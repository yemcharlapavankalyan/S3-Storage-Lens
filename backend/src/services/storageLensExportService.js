const {
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const s3 = require("../aws");
const { getStorageLensDashboard } = require("./storageLensService");

const MAX_TREND_SNAPSHOTS = 90;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value.replace(/\r$/, ""));
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    if (record.metric_value !== undefined && record.metric_value !== "") {
      const numericValue = Number(record.metric_value);
      if (Number.isFinite(numericValue)) record.metric_value = numericValue;
    }
    return record;
  });
}

function destinationDetails(configuration, accountId) {
  const destination = configuration?.DataExport?.S3BucketDestination;
  if (!destination?.Arn) return null;
  const bucket = destination.Arn.split(":").pop()?.replace(/^bucket\//, "");
  if (!bucket) return null;
  const prefix = (destination.Prefix || "").replace(/^\/+|\/+$/g, "");
  const root = [prefix, "StorageLens", accountId, configuration.Id, destination.OutputSchemaVersion || "V_1"]
    .filter(Boolean)
    .join("/");
  return { bucket, prefix, root, format: destination.Format || null, schemaVersion: destination.OutputSchemaVersion || null };
}

async function listAllObjects(client, bucket, prefix) {
  const objects = [];
  let ContinuationToken;
  do {
    const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken }));
    objects.push(...(result.Contents || []));
    ContinuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objects;
}

async function readBody(body) {
  if (body?.transformToString) return body.transformToString();
  const chunks = [];
  for await (const chunk of body || []) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function getJsonObject(client, bucket, key) {
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return JSON.parse(await readBody(result.Body));
}

function reportDateFromKey(key) {
  return key.match(/dt=(\d{4}-\d{2}-\d{2})/)?.[1] || null;
}

async function getContext() {
  const [identity, lens] = await Promise.all([s3.getCallerIdentity(), getStorageLensDashboard()]);
  const configuration = lens.activeDashboard;
  if (!identity.connected || !identity.accountId || !configuration?.Id) {
    return { status: "UNAVAILABLE", provenance: "UNAVAILABLE", reason: "AWS identity or Storage Lens dashboard configuration could not be verified.", identity, lens };
  }
  const destination = destinationDetails(configuration, identity.accountId);
  if (!destination) {
    return { status: "NOT_CONFIGURED", provenance: "UNAVAILABLE", reason: "The active Storage Lens dashboard has no S3 metrics export destination configured.", identity, lens, configuration };
  }
  const client = s3.getS3ClientForRegion("us-east-1");
  const manifestsPrefix = `${destination.root}/manifests/`;
  const manifestObjects = (await listAllObjects(client, destination.bucket, manifestsPrefix))
    .filter((object) => object.Key?.endsWith("/manifest.json"))
    .sort((a, b) => (b.Key || "").localeCompare(a.Key || ""));

  return {
    status: manifestObjects.length ? "AVAILABLE" : "CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT",
    provenance: manifestObjects.length ? "STORAGE_LENS" : "UNAVAILABLE",
    reason: manifestObjects.length ? null : "Export destination is configured, but AWS has not delivered the first Storage Lens manifest yet. Storage Lens exports are generated daily; the application does not substitute S3 inventory values.",
    identity,
    lens,
    configuration,
    destination,
    client,
    manifestsPrefix,
    manifestObjects,
  };
}

async function loadManifest(context, object) {
  const manifest = await getJsonObject(context.client, context.destination.bucket, object.Key);
  return { ...manifest, manifestKey: object.Key, reportDate: manifest.reportDate || reportDateFromKey(object.Key) };
}

async function loadReportRows(context, manifest) {
  const files = manifest.reportFiles || [];
  const allRows = [];
  for (const file of files) {
    if (!file.key || !file.key.endsWith(".csv")) continue;
    const result = await context.client.send(new GetObjectCommand({ Bucket: context.destination.bucket, Key: file.key }));
    allRows.push(...parseCsv(await readBody(result.Body)));
  }
  return allRows.filter((row) => row.configuration_id === context.configuration.Id);
}

function snapshotResponse(context, manifest = null) {
  return {
    status: context.status,
    provenance: context.provenance,
    reason: context.reason,
    dashboardId: context.configuration?.Id || null,
    accountId: context.identity.accountId || null,
    destination: context.destination ? {
      bucket: context.destination.bucket,
      prefix: context.destination.prefix,
      format: context.destination.format,
      schemaVersion: context.destination.schemaVersion,
    } : null,
    latestSnapshotDate: manifest?.reportDate || null,
    manifestKey: manifest?.manifestKey || null,
    checkedAt: new Date().toISOString(),
  };
}

async function getStorageLensExportStatus() {
  const context = await getContext();
  if (!context.destination) return snapshotResponse(context);
  if (!context.manifestObjects.length) return snapshotResponse(context);
  const manifest = await loadManifest(context, context.manifestObjects[0]);
  return snapshotResponse(context, manifest);
}

async function getLatestExportMetrics() {
  const context = await getContext();
  if (!context.destination || !context.manifestObjects.length) return { ...snapshotResponse(context), metrics: [], account: [], buckets: [], prefixes: [] };
  const manifest = await loadManifest(context, context.manifestObjects[0]);
  const rows = await loadReportRows(context, manifest);
  return {
    ...snapshotResponse(context, manifest),
    reportSchema: manifest.reportSchema || null,
    reportFiles: (manifest.reportFiles || []).map(({ key, size }) => ({ key, size })),
    metrics: rows,
    account: rows.filter((row) => row.record_type === "ACCOUNT"),
    buckets: rows.filter((row) => row.record_type === "BUCKET"),
    prefixes: rows.filter((row) => row.record_type === "PREFIX").map((row) => ({
      ...row,
      decodedPrefix: decodeURIComponent(row.record_value || ""),
    })),
  };
}

async function getStorageLensExportPrefixes() {
  const metrics = await getLatestExportMetrics();
  return { status: metrics.status, provenance: metrics.provenance, reason: metrics.reason, latestSnapshotDate: metrics.latestSnapshotDate, prefixes: metrics.prefixes || [] };
}

async function getStorageLensExportTrends() {
  const context = await getContext();
  if (!context.destination || !context.manifestObjects.length) return { ...snapshotResponse(context), observations: [] };
  const candidates = context.manifestObjects
    .map((object) => ({ object, reportDate: reportDateFromKey(object.Key || "") }))
    .filter((item) => item.reportDate)
    .sort((a, b) => b.reportDate.localeCompare(a.reportDate))
    .slice(0, MAX_TREND_SNAPSHOTS);
  const observations = [];
  for (const candidate of candidates) {
    const manifest = await loadManifest(context, candidate.object);
    const rows = await loadReportRows(context, manifest);
    const accountRows = rows.filter((row) => row.record_type === "ACCOUNT");
    const totals = {};
    for (const row of accountRows) {
      const name = row.metric_name;
      const value = Number(row.metric_value);
      if (name && Number.isFinite(value)) totals[name] = (totals[name] || 0) + value;
    }
    observations.push({ date: manifest.reportDate || candidate.reportDate, metrics: totals });
  }
  observations.sort((a, b) => a.date.localeCompare(b.date));
  return { ...snapshotResponse(context), observations };
}

module.exports = {
  parseCsv,
  destinationDetails,
  getStorageLensExportStatus,
  getLatestExportMetrics,
  getStorageLensExportTrends,
  getStorageLensExportPrefixes,
};
