#!/usr/bin/env node
'use strict';

const { Readable } = require('node:stream');
const { createCipheriv, createHash } = require('node:crypto');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const {
  HeadBucketCommand,
  GetBucketLocationCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();
const s3Client = require('../src/aws');

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;
const ROOT = 'demo-data/';
const DEFAULT_BUCKET = 's3-storage-lens-pavan-2026';
const DEFAULT_DISTRIBUTION = {
  'frequently-accessed': 25,
  logs: 15,
  analytics: 20,
  archive: 25,
  reports: 15,
};
const STORAGE_CLASSES = new Set([
  'STANDARD', 'STANDARD_IA', 'ONEZONE_IA', 'INTELLIGENT_TIERING',
  'GLACIER', 'DEEP_ARCHIVE', 'GLACIER_IR', 'EXPRESS_ONEZONE',
]);

function parseArgs(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) { result._.push(token); continue; }
    const equals = token.indexOf('=');
    if (equals >= 0) result[token.slice(2, equals)] = token.slice(equals + 1);
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) result[token.slice(2)] = argv[++i];
    else result[token.slice(2)] = true;
  }
  return result;
}

function numberOption(value, fallback, name, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${name} must be a number from ${min} to ${max}.`);
  }
  return number;
}

function safeDatasetId(value) {
  const id = value || `dataset-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/.test(id) || id.includes('..')) {
    throw new Error('Dataset ID must be 3–64 safe characters (letters, numbers, dot, underscore, hyphen).');
  }
  if (id === 'dataset-20261003191738') throw new Error('This dataset ID is reserved for the existing dataset and cannot be reused.');
  return id;
}

function parseDistribution(raw) {
  if (!raw) return { ...DEFAULT_DISTRIBUTION };
  const parsed = {};
  for (const part of raw.split(',')) {
    const [key, value] = part.split(':');
    if (!key || !/^\d+(?:\.\d+)?$/.test(value || '')) throw new Error('PREFIX_DISTRIBUTION must look like frequently-accessed:25,logs:15,...');
    parsed[key.trim()] = Number(value);
  }
  if (Object.keys(parsed).some((key) => !Object.hasOwn(DEFAULT_DISTRIBUTION, key))) {
    throw new Error(`Prefix distribution keys must be: ${Object.keys(DEFAULT_DISTRIBUTION).join(', ')}.`);
  }
  const distribution = { ...DEFAULT_DISTRIBUTION, ...parsed };
  if (Math.abs(Object.values(distribution).reduce((sum, value) => sum + value, 0) - 100) > 0.001) {
    throw new Error('Prefix distribution percentages must total 100.');
  }
  if (Object.values(distribution).some((value) => value < 0)) throw new Error('Prefix percentages cannot be negative.');
  return distribution;
}

function makeConfig(args = {}) {
  const targetGB = numberOption(args['target-gb'] ?? process.env.DEMO_TARGET_GIB ?? process.env.TARGET_SIZE_GB, 20, 'DEMO_TARGET_GIB', { min: 0.000001 });
  const maxGB = numberOption(args['max-target-gb'] ?? process.env.MAX_TARGET_SIZE_GB, 100, 'MAX_TARGET_SIZE_GB', { min: 0.000001 });
  const objectSizeMB = numberOption(args['object-size-mb'] ?? process.env.OBJECT_SIZE_MB, 100, 'OBJECT_SIZE_MB', { min: 0.001, max: 5000 });
  const concurrency = numberOption(args.concurrency ?? process.env.CONCURRENCY, 8, 'CONCURRENCY', { min: 1, max: 64 });
  const prefixDepth = numberOption(args['prefix-depth'] ?? process.env.PREFIX_DEPTH, 1, 'PREFIX_DEPTH', { min: 0, max: 4 });
  const region = args.region || process.env.DEMO_REGION || process.env.DEMO_DATA_REGION || process.env.AWS_REGION || 'us-east-1';
  const bucket = args.bucket || process.env.DEMO_BUCKET || process.env.DEMO_DATA_BUCKET || DEFAULT_BUCKET;
  const storageClass = String(args['storage-class'] || process.env.STORAGE_CLASS || 'STANDARD').toUpperCase();
  if (!STORAGE_CLASSES.has(storageClass)) throw new Error(`Unsupported S3 storage class: ${storageClass}`);
  if (!/^[a-z0-9.-]{3,63}$/.test(bucket)) throw new Error('Bucket name is invalid.');
  return {
    targetBytes: Math.round(targetGB * GiB), targetGB, maxGB, objectSizeBytes: Math.round(objectSizeMB * MiB),
    objectSizeMB, concurrency, prefixDepth, region, bucket, storageClass,
    datasetId: safeDatasetId(args['dataset-id'] || process.env.DATASET_ID),
    distribution: parseDistribution(args['prefix-distribution'] || process.env.PREFIX_DISTRIBUTION),
    resume: Boolean(args.resume), overrideLimit: Boolean(args['override-limit']),
  };
}

function buildPlan(config) {
  if (config.targetGB > config.maxGB && !config.overrideLimit) {
    throw new Error(`Target ${config.targetGB} GiB exceeds MAX_TARGET_SIZE_GB=${config.maxGB}. Set --override-limit to acknowledge the configured cap.`);
  }
  const entries = [];
  let remainingTotal = config.targetBytes;
  let sequence = 0;
  const categories = Object.entries(config.distribution);
  categories.forEach(([category, percentage], categoryIndex) => {
    const allocated = categoryIndex === categories.length - 1
      ? remainingTotal
      : Math.round(config.targetBytes * percentage / 100);
    remainingTotal -= allocated;
    let remaining = allocated;
    let index = 1;
    while (remaining > 0) {
      const size = Math.min(config.objectSizeBytes, remaining);
      const dirs = [];
      for (let depth = 0; depth < config.prefixDepth; depth += 1) {
        dirs.push(`part-${String(Math.floor((index - 1) / (1000 ** (depth + 1)))).padStart(3, '0')}`);
      }
      const suffix = dirs.length ? `${dirs.join('/')}/` : '';
      entries.push({
        category, key: `${ROOT}${category}/${config.datasetId}/${suffix}object-${String(index).padStart(8, '0')}.bin`,
        size, sequence: sequence++,
      });
      remaining -= size;
      index += 1;
    }
  });
  return entries;
}

function formatBytes(bytes) {
  if (bytes >= GiB) return `${(bytes / GiB).toFixed(3)} GiB`;
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(2)} MiB`;
  return `${bytes.toLocaleString()} bytes`;
}

function printPlan(config, plan) {
  const prefixBytes = {};
  for (const item of plan) prefixBytes[item.category] = (prefixBytes[item.category] || 0) + item.size;
  console.log('\nDEMO DATA MANAGEMENT — UPLOAD PLAN');
  console.log(`Bucket:             s3://${config.bucket}/`);
  console.log(`Region:             ${config.region}`);
  console.log(`Demo prefix:        s3://${config.bucket}/${ROOT}`);
  console.log(`Dataset ID:         ${config.datasetId}`);
  console.log(`Target size:        ${formatBytes(config.targetBytes)} (${config.targetGB} GiB)`);
  console.log(`Estimated objects:  ${plan.length.toLocaleString()}`);
  console.log(`Object size:        up to ${config.objectSizeMB} MiB`);
  console.log(`Concurrency:        ${config.concurrency} object uploads`);
  console.log(`Storage class:      ${config.storageClass}`);
  console.log('Prefix distribution:');
  for (const [category, percentage] of Object.entries(config.distribution)) {
    console.log(`  ${category.padEnd(22)} ${String(percentage).padStart(5)}%  ${formatBytes(prefixBytes[category] || 0)}`);
  }
  console.log('\nStorage and request charges may apply. No exact cost is estimated here.');
}

function printInspection(config, inspection, existingCount, conflicts) {
  const identity = inspection.identity;
  console.log(`AWS identity:       verified · account ${identity.accountId || 'unknown'} · ${identity.arn || 'ARN unavailable'}`);
  if (!inspection.exists) {
    console.log(`Bucket status:      does not exist; an explicitly confirmed upload would create it in ${config.region}`);
    console.log('Bucket region:      not applicable (bucket absent; planned create region will be verified)');
    console.log('Existing objects:   0 (bucket does not exist)');
    console.log('Potential conflicts: 0');
    return;
  }
  console.log(`Bucket status:      exists`);
  console.log(`Bucket region:      ${inspection.actualRegion}${inspection.regionMatches ? ' · verified' : ` · MISMATCH (expected ${config.region})`}`);
  console.log(`Existing objects:   ${existingCount === null ? 'not checked' : existingCount.toLocaleString()}`);
  console.log(`Potential conflicts: ${conflicts === null ? 'not checked' : conflicts.toLocaleString()}`);
}

async function* listObjects(client, bucket, prefix) {
  let ContinuationToken;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken }));
    for (const object of page.Contents || []) yield object;
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    if (page.IsTruncated && !ContinuationToken) throw new Error('S3 returned a truncated page without a continuation token.');
  } while (ContinuationToken);
}

async function collectObjects(client, bucket, prefix) {
  const result = [];
  for await (const object of listObjects(client, bucket, prefix)) result.push(object);
  return result;
}

function cleanupBatch(objects) {
  return objects.filter((item) => typeof item.Key === 'string' && item.Key.startsWith(ROOT));
}

async function verifyPlan(client, config, plan) {
  const expected = new Map(plan.map((item) => [item.key, item]));
  const actual = [];
  const datasetPrefix = `${ROOT}`;
  for await (const object of listObjects(client, config.bucket, datasetPrefix)) {
    if (object.Key?.includes(`/${config.datasetId}/`)) actual.push(object);
  }
  const actualMap = new Map(actual.map((item) => [item.Key, item]));
  const missing = [];
  const mismatched = [];
  for (const [key, expectedObject] of expected) {
    const found = actualMap.get(key);
    if (!found) missing.push(key);
    else if (found.Size !== expectedObject.size) mismatched.push({ key, expected: expectedObject.size, actual: found.Size });
  }
  const unexpected = actual.filter((item) => !expected.has(item.Key));
  const byPrefix = {};
  let totalBytes = 0;
  for (const object of actual) {
    const category = object.Key.slice(ROOT.length).split('/')[0];
    byPrefix[category] ||= { count: 0, bytes: 0 };
    byPrefix[category].count += 1;
    byPrefix[category].bytes += object.Size || 0;
    totalBytes += object.Size || 0;
  }
  return {
    expectedCount: plan.length, expectedBytes: plan.reduce((sum, item) => sum + item.size, 0),
    actualCount: actual.length, actualBytes: totalBytes, byPrefix, missing, mismatched, unexpected,
    success: missing.length === 0 && mismatched.length === 0 && unexpected.length === 0,
  };
}

function printVerification(config, result) {
  console.log(`\nVerification for ${config.datasetId} (direct ListObjectsV2 observations)`);
  console.log(`Expected: ${result.expectedCount.toLocaleString()} objects, ${formatBytes(result.expectedBytes)}`);
  console.log(`Actual:   ${result.actualCount.toLocaleString()} objects, ${formatBytes(result.actualBytes)}`);
  for (const [prefix, totals] of Object.entries(result.byPrefix)) {
    console.log(`  ${prefix}: ${totals.count.toLocaleString()} objects, ${formatBytes(totals.bytes)}`);
  }
  console.log(`Missing: ${result.missing.length}; size mismatches: ${result.mismatched.length}; unexpected: ${result.unexpected.length}`);
  if (result.missing.length) console.log(`First missing keys: ${result.missing.slice(0, 10).join(', ')}`);
  if (result.mismatched.length) console.log(`First size mismatches: ${JSON.stringify(result.mismatched.slice(0, 5))}`);
  if (result.unexpected.length) console.log(`First unexpected keys: ${result.unexpected.slice(0, 10).map((item) => item.Key).join(', ')}`);
  console.log(`Verification: ${result.success ? 'PASS' : 'INCOMPLETE'}`);
}

function createSyntheticReadable(size, seedText, chunkBytes = MiB) {
  let remaining = size;
  const key = createHash('sha256').update(`s3-demo-data:${seedText}`).digest();
  const iv = createHash('sha256').update(`s3-demo-iv:${seedText}`).digest().subarray(0, 16);
  const cipher = createCipheriv('aes-256-ctr', key, iv);
  return Readable.from((async function* generate() {
    while (remaining > 0) {
      const length = Math.min(chunkBytes, remaining);
      yield cipher.update(Buffer.alloc(length));
      remaining -= length;
    }
    const final = cipher.final();
    if (final.length) yield final;
  })());
}

function retryable(error) {
  const status = error?.$metadata?.httpStatusCode;
  return status >= 500 || status === 429 || ['SlowDown', 'Throttling', 'RequestTimeout', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'NetworkingError'].includes(error?.name || error?.code);
}

async function withRetry(action, { attempts = 5, baseDelayMs = 500, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), onRetry = () => {} } = {}) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await action(attempt); }
    catch (error) {
      lastError = error;
      if (attempt + 1 >= attempts || !retryable(error)) throw error;
      const delay = Math.min(30_000, baseDelayMs * (2 ** attempt)) + Math.floor(Math.random() * 250);
      onRetry(error, attempt + 1, delay);
      await sleep(delay);
    }
  }
  throw lastError;
}

async function confirm(promptText) {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('Confirmation requires an interactive terminal. No action was started.');
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try { return (await rl.question(`${promptText} Type yes to continue: `)).trim() === 'yes'; }
  finally { rl.close(); }
}

function isBucketMissing(error) {
  return error?.$metadata?.httpStatusCode === 404 || ['NotFound', 'NoSuchBucket'].includes(error?.name || error?.code);
}

async function inspectBucket(client, config) {
  const identity = await s3Client.getCallerIdentity(true);
  if (!identity.connected) throw new Error(`Could not verify AWS identity: ${identity.error || 'STS caller identity unavailable'}`);
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
  } catch (error) {
    if (isBucketMissing(error)) return { identity, exists: false, actualRegion: null, regionMatches: false };
    throw new Error(`Could not determine whether target bucket exists (${error.name || error.code || 'S3 error'}). No bucket or objects were changed.`);
  }
  const location = await client.send(new GetBucketLocationCommand({ Bucket: config.bucket }));
  const actualRegion = location.LocationConstraint || 'us-east-1';
  return { identity, exists: true, actualRegion, regionMatches: actualRegion === config.region };
}

async function preflight(client, config) {
  const result = await inspectBucket(client, config);
  if (!result.exists) throw new Error(`Bucket ${config.bucket} does not exist. An explicit confirmed upload may create it in ${config.region}.`);
  if (!result.regionMatches) throw new Error(`Configured region ${config.region} does not match bucket region ${result.actualRegion}. Refusing to continue.`);
  return result;
}

async function createBucketAfterConfirmation(client, config) {
  try {
    const input = { Bucket: config.bucket };
    if (config.region !== 'us-east-1') input.CreateBucketConfiguration = { LocationConstraint: config.region };
    await client.send(new CreateBucketCommand(input));
  } catch (error) {
    if (!['BucketAlreadyOwnedByYou', 'BucketAlreadyExists'].includes(error?.name || error?.code)) throw error;
    const inspected = await inspectBucket(client, config);
    if (!inspected.exists || !inspected.regionMatches) {
      throw new Error(`Bucket creation conflicted with an existing bucket; it is not confirmed in ${config.region}. No uploads were started.`);
    }
  }
  const verified = await inspectBucket(client, config);
  if (!verified.exists || !verified.regionMatches) throw new Error(`Created bucket failed region verification for ${config.region}. No uploads were started.`);
  return verified;
}

async function uploadOne(client, config, item, progress) {
  return withRetry(async () => {
    const params = {
      Bucket: config.bucket, Key: item.key, Body: createSyntheticReadable(item.size, `${config.datasetId}:${item.key}`),
      ContentType: 'application/octet-stream', StorageClass: config.storageClass,
      IfNoneMatch: '*', Metadata: { 'demo-dataset-id': config.datasetId, 'synthetic-data': 'true' },
    };
    if (item.size >= 16 * MiB) {
      const upload = new Upload({ client, params, partSize: 8 * MiB, queueSize: 2, leavePartsOnError: false });
      upload.on('httpUploadProgress', (event) => progress(item, event.loaded || 0));
      return upload.done();
    }
    return client.send(new PutObjectCommand(params));
  }, { onRetry: (error, attempt, delay) => console.warn(`Retry ${attempt} for ${item.key} in ${delay}ms (${error.name || 'transient error'}).`) });
}

function startProgress(config, plan) {
  const started = Date.now();
  const state = { succeeded: 0, failed: 0, completedBytes: 0, inFlightBytes: 0 };
  const activeBytes = new Map();
  let lastPrinted = 0;
  const report = (force = false) => {
    const now = Date.now();
    if (!force && now - lastPrinted < 1000) return;
    lastPrinted = now;
    const throughput = state.completedBytes / Math.max((now - started) / 1000, 1);
    const remaining = Math.max(0, plan.reduce((sum, item) => sum + item.size, 0) - state.completedBytes);
    const eta = throughput > 0 ? `${Math.ceil(remaining / throughput)}s` : 'calculating';
    state.inFlightBytes = [...activeBytes.values()].reduce((sum, value) => sum + value, 0);
    const shown = Math.min(plan.reduce((sum, item) => sum + item.size, 0), state.completedBytes + state.inFlightBytes);
    process.stdout.write(`\r${formatBytes(shown)} / ${formatBytes(plan.reduce((sum, item) => sum + item.size, 0))} · ${state.succeeded} ok · ${state.failed} failed · ${formatBytes(throughput)}/s · ETA ${eta}   `);
  };
  return {
    state,
    event(item, loaded) { activeBytes.set(item.key, loaded); report(); },
    success(item) { state.succeeded += 1; state.completedBytes += item.size; activeBytes.delete(item.key); report(true); },
    failure(item) { state.failed += 1; activeBytes.delete(item.key); report(true); },
    finish() { report(true); process.stdout.write('\n'); },
  };
}

async function uploadPlan(client, config, plan) {
  let interrupted = false;
  const onSignal = () => { interrupted = true; console.warn('\nInterrupt received. Finishing in-flight objects and stopping new uploads; rerun with --resume.'); };
  process.on('SIGINT', onSignal);
  const progress = startProgress(config, plan);
  let cursor = 0;
  const failures = [];
  async function worker() {
    while (!interrupted) {
      const item = plan[cursor++];
      if (!item) return;
      try { await uploadOne(client, config, item, progress.event); progress.success(item); }
      catch (error) { failures.push({ key: item.key, error }); progress.failure(item); console.error(`\nFAILED ${item.key}: ${error.message}`); }
    }
  }
  try { await Promise.all(Array.from({ length: Math.min(config.concurrency, plan.length) }, worker)); }
  finally { process.off('SIGINT', onSignal); progress.finish(); }
  return { interrupted, failures };
}

async function activity(client, config, args) {
  const getCount = numberOption(args['get-requests'] ?? process.env.GET_REQUESTS, 1000, 'GET_REQUESTS', { min: 0, max: 100000 });
  const headCount = numberOption(args['head-requests'] ?? process.env.HEAD_REQUESTS, 500, 'HEAD_REQUESTS', { min: 0, max: 100000 });
  const listCount = numberOption(args['list-requests'] ?? process.env.LIST_REQUESTS, 10, 'LIST_REQUESTS', { min: 0, max: 10000 });
  const concurrency = numberOption(args.concurrency ?? process.env.CONCURRENCY, 10, 'CONCURRENCY', { min: 1, max: 32 });
  const base = `${ROOT}`;
  const objects = await collectObjects(client, config.bucket, base);
  const datasetObjects = objects.filter((item) => item.Key?.includes(`/${config.datasetId}/`));
  if (!datasetObjects.length && (getCount + headCount > 0)) throw new Error(`No objects found for dataset ${config.datasetId} under ${ROOT}.`);
  console.log(`\nControlled S3 activity (generated requests; not Storage Lens metrics)`);
  console.log(`Bucket: s3://${config.bucket}/; dataset: ${config.datasetId}; region: ${config.region}`);
  console.log(`GET: ${getCount}; HEAD: ${headCount}; LIST: ${listCount}; max concurrency: ${concurrency}`);
  console.log('GET bodies are drained; all object keys are selected only from this dataset under demo-data/.');
  if (!(await confirm('This generates S3 request and possibly data-transfer charges.'))) { console.log('Cancelled.'); return; }
  const jobs = [];
  for (let i = 0; i < getCount; i += 1) jobs.push({ kind: 'get', object: datasetObjects[i % datasetObjects.length] });
  for (let i = 0; i < headCount; i += 1) jobs.push({ kind: 'head', object: datasetObjects[i % datasetObjects.length] });
  for (let i = 0; i < listCount; i += 1) jobs.push({ kind: 'list' });
  let cursor = 0; let done = 0; let failed = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        if (job.kind === 'get') {
          const result = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: job.object.Key }));
          if (result.Body) for await (const _chunk of result.Body) { /* drain to complete GET */ }
        } else if (job.kind === 'head') await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: job.object.Key }));
        else await client.send(new ListObjectsV2Command({ Bucket: config.bucket, Prefix: `${ROOT}`, MaxKeys: 1000 }));
      } catch (error) { failed += 1; console.warn(`\nActivity ${job.kind} failed: ${error.message}`); }
      done += 1;
      if (done % 25 === 0 || done === jobs.length) process.stdout.write(`\r${done}/${jobs.length} requests; ${failed} failed`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  console.log(`\nActivity complete: ${done - failed} succeeded, ${failed} failed. These are generated requests, not Storage Lens metrics.`);
}

async function main(argv) {
  const args = parseArgs(argv);
  const command = args._[0] || 'dry-run';
  const config = makeConfig(args);
  const client = s3Client.getS3ClientForRegion(config.region);
  if (command === 'test') return;

  if (command === 'cleanup') {
    await preflight(client, config);
    const objects = await collectObjects(client, config.bucket, ROOT);
    const total = objects.reduce((sum, item) => sum + (item.Size || 0), 0);
    console.log('\nDEMO DATA CLEANUP — destructive action');
    console.log(`Bucket: s3://${config.bucket}/`); console.log(`Prefix: ${ROOT}`);
    console.log(`Objects: ${objects.length.toLocaleString()}`); console.log(`Size: ${formatBytes(total)}`);
    console.log('Only listed current objects whose keys begin exactly with demo-data/ will be submitted for deletion.');
    if (!(await confirm('This cannot be undone from this tool.'))) { console.log('Cancelled.'); return; }
    for (let i = 0; i < objects.length; i += 1000) {
      const batch = cleanupBatch(objects.slice(i, i + 1000));
      if (batch.length) await client.send(new DeleteObjectsCommand({
        Bucket: config.bucket, Delete: { Objects: batch.map(({ Key }) => ({ Key })), Quiet: true },
      }));
    }
    console.log(`Cleanup submitted for ${objects.length} objects under ${ROOT}.`);
    console.log('In versioned buckets, older versions may remain and require a separately reviewed version-aware cleanup.');
    return;
  }

  const plan = buildPlan(config);
  if (command === 'dry-run') {
    printPlan(config, plan);
    console.log('\nDry run: calculations only; no S3 writes were made.');
    try {
      const inspection = await inspectBucket(client, config);
      if (!inspection.exists) {
        printInspection(config, inspection, 0, 0);
        console.log('No bucket creation was attempted during this dry run.');
        return;
      }
      if (!inspection.regionMatches) {
        printInspection(config, inspection, null, null);
        throw new Error(`Bucket region mismatch. Expected ${config.region}; found ${inspection.actualRegion}.`);
      }
      const existing = await collectObjects(client, config.bucket, ROOT);
      const planned = new Set(plan.map((item) => item.key));
      const conflicts = existing.filter((item) => planned.has(item.Key));
      printInspection(config, inspection, existing.length, conflicts.length);
      console.log(`Prefix checked:     ${ROOT}`);
      if (conflicts.length) console.log(`Conflicting keys:   ${conflicts.slice(0, 10).map((item) => item.Key).join(', ')}`);
    } catch (error) {
      console.error(`Read-only AWS inspection failed: ${error.message}`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === 'upload') {
    printPlan(config, plan);
    const inspection = await inspectBucket(client, config);
    if (inspection.exists && !inspection.regionMatches) throw new Error(`Configured region ${config.region} does not match bucket region ${inspection.actualRegion}. Refusing to continue.`);
    printInspection(config, inspection, inspection.exists ? null : 0, inspection.exists ? null : 0);
    const existing = inspection.exists ? await collectObjects(client, config.bucket, ROOT) : [];
    if (inspection.exists) console.log(`Prefix checked:     ${ROOT}; ${existing.length} existing objects.`);
    const byKey = new Map(existing.filter((item) => item.Key?.includes(`/${config.datasetId}/`)).map((item) => [item.Key, item]));
    const planKeys = new Set(plan.map((item) => item.key));
    const unexpected = [...byKey.keys()].filter((key) => !planKeys.has(key));
    if (unexpected.length) throw new Error(`${unexpected.length} unexpected objects already exist in dataset ${config.datasetId}; choose another ID. No objects were changed.`);
    const pending = [];
    for (const item of plan) {
      const found = byKey.get(item.key);
      if (!found) pending.push(item);
      else if (!config.resume) throw new Error(`Object already exists: ${item.key}. Choose a new dataset ID or use --resume. No objects were changed.`);
      else if (found.Size !== item.size) throw new Error(`Existing object has unexpected size: ${item.key}. No objects were changed.`);
    }
    console.log(`Resume mode: ${config.resume ? 'on' : 'off'}; objects already complete: ${plan.length - pending.length}; to upload: ${pending.length}.`);
    if (!pending.length) { console.log('Dataset already matches the plan; verifying.'); }
    else if (!(await confirm(`WARNING: ${inspection.exists ? '' : `this will create bucket ${config.bucket} in ${config.region}, then `}upload synthetic data to S3. Costs depend on storage class, requests, and duration.`))) { console.log('Cancelled. No upload started.'); return; }
    if (!inspection.exists && pending.length) {
      console.log(`Creating bucket ${config.bucket} in ${config.region} after explicit confirmation...`);
      await createBucketAfterConfirmation(client, config);
    }
    const result = pending.length ? await uploadPlan(client, config, pending) : { interrupted: false, failures: [] };
    const verification = await verifyPlan(client, config, plan);
    printVerification(config, verification);
    if (result.interrupted || result.failures.length || !verification.success) process.exitCode = 1;
    return;
  }

  if (command === 'verify') {
    await preflight(client, config);
    const result = await verifyPlan(client, config, plan);
    printVerification(config, result);
    if (!result.success) process.exitCode = 1;
    return;
  }

  if (command === 'activity') {
    await preflight(client, config);
    await activity(client, config, args);
    return;
  }

  throw new Error(`Unknown command '${command}'. Use dry-run, upload, verify, cleanup, or activity.`);
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`demo-data: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  GiB, MiB, ROOT, DEFAULT_DISTRIBUTION, parseArgs, parseDistribution, makeConfig, buildPlan,
  formatBytes, listObjects, collectObjects, cleanupBatch, verifyPlan, createSyntheticReadable, retryable, withRetry,
};
