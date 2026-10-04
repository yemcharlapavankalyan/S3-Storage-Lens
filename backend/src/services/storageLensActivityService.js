const {
  CloudWatchClient,
  ListMetricsCommand,
  GetMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");
const s3Client = require("../aws");
const { getStorageLensDashboard } = require("./storageLensService");

const NAMESPACE = "AWS/S3/Storage-Lens";
const PERIOD_SECONDS = 86400;
const LOOKBACK_DAYS = 30;
let cache = null;
let cacheAt = 0;
const CACHE_MS = 5 * 60 * 1000;
const cloudWatch = new CloudWatchClient({ region: s3Client.DEFAULT_REGION || "us-east-1" });

async function listAccountMetrics(metricName, configId, accountId) {
  const metrics = [];
  let NextToken;
  do {
    const result = await cloudWatch.send(new ListMetricsCommand({
      Namespace: NAMESPACE,
      MetricName: metricName,
      Dimensions: [
        { Name: "configuration_id", Value: configId },
        { Name: "aws_account_number", Value: accountId },
      ],
      NextToken,
    }));
    for (const metric of result.Metrics || []) {
      const dims = metric.Dimensions || [];
      const values = Object.fromEntries(dims.map((dimension) => [dimension.Name, dimension.Value]));
      if (values.configuration_id === configId && values.aws_account_number === accountId && values.record_type === "ACCOUNT") metrics.push(metric);
    }
    NextToken = result.NextToken;
  } while (NextToken);
  return metrics;
}

async function getStorageLensActivityMetrics(forceRefresh = false) {
  if (!forceRefresh && cache && Date.now() - cacheAt < CACHE_MS) return cache;
  const lens = await getStorageLensDashboard();
  const identity = await s3Client.getCallerIdentity();
  const configId = lens.activeDashboard?.Id;
  if (!lens.connected || !configId || !identity.accountId) {
    return { status: "unavailable", provenance: "UNAVAILABLE", observations: [], reason: "Storage Lens dashboard configuration or AWS account identity could not be verified." };
  }

  const cloudWatchEnabled = lens.activeDashboard?.DataExport?.CloudWatchMetrics?.IsEnabled;
  if (cloudWatchEnabled === false) {
    return { status: "unavailable", provenance: "UNAVAILABLE", observations: [], reason: "CloudWatch publishing is disabled in the active Storage Lens configuration." };
  }

  try {
    const names = ["GetRequests", "PutRequests", "BytesDownloaded"];
    const metricLists = await Promise.all(names.map((name) => listAccountMetrics(name, configId, identity.accountId)));
    const queries = [];
    const queryInfo = new Map();
    metricLists.forEach((metrics, index) => metrics.forEach((metric, metricIndex) => {
      const id = `${["get", "put", "down"][index]}${metricIndex}`;
      queries.push({
        Id: id,
        MetricStat: {
          Metric: { Namespace: NAMESPACE, MetricName: names[index], Dimensions: metric.Dimensions },
          Period: PERIOD_SECONDS,
          Stat: "Average",
        },
        ReturnData: true,
      });
      queryInfo.set(id, ["getRequests", "putRequests", "downloadedBytes"][index]);
    }));

    if (!queries.length) {
      const result = { status: "pending", provenance: "UNAVAILABLE", observations: [], reason: "No account-level Storage Lens activity series has reached CloudWatch yet. Storage Lens metrics publish daily and can take additional time to appear." };
      cache = result; cacheAt = Date.now(); return result;
    }

    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS);
    let NextToken;
    const valuesByDate = new Map();
    do {
      const result = await cloudWatch.send(new GetMetricDataCommand({
        MetricDataQueries: queries,
        StartTime: start,
        EndTime: end,
        ScanBy: "TimestampAscending",
        NextToken,
      }));
      for (const series of result.MetricDataResults || []) {
        const field = queryInfo.get(series.Id);
        if (!field) continue;
        (series.Timestamps || []).forEach((timestamp, index) => {
          const key = new Date(timestamp).toISOString();
          const observation = valuesByDate.get(key) || { date: key, getRequests: null, putRequests: null, downloadedBytes: null };
          const value = series.Values?.[index];
          if (value != null) observation[field] = (observation[field] || 0) + value;
          valuesByDate.set(key, observation);
        });
      }
      NextToken = result.NextToken;
    } while (NextToken);

    const observations = [...valuesByDate.values()].sort((a, b) => a.date.localeCompare(b.date)).map((point) => ({
      date: point.date,
      getRequests: point.getRequests,
      putRequests: point.putRequests,
      downloadedGB: point.downloadedBytes == null ? null : Number((point.downloadedBytes / (1024 ** 3)).toFixed(4)),
      downloadedBytes: point.downloadedBytes,
    }));
    const result = observations.length
      ? { status: "available", provenance: "STORAGE_LENS", observations, reason: null, metricNamespace: NAMESPACE, periodSeconds: PERIOD_SECONDS, updatedAt: new Date().toISOString() }
      : { status: "pending", provenance: "UNAVAILABLE", observations: [], reason: "CloudWatch metrics exist for this configuration, but no datapoints are available in the requested period yet." };
    cache = result; cacheAt = Date.now(); return result;
  } catch (error) {
    const result = { status: "unavailable", provenance: "UNAVAILABLE", observations: [], reason: `CloudWatch Storage Lens activity query failed: ${error.message}`, requiredPermission: "cloudwatch:ListMetrics, cloudwatch:GetMetricData" };
    cache = result; cacheAt = Date.now(); return result;
  }
}

module.exports = { getStorageLensActivityMetrics };
