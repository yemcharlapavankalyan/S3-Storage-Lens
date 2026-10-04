'use strict';

const assert = require('node:assert/strict');
const {
  MiB, ROOT, makeConfig, buildPlan, parseDistribution, createSyntheticReadable,
  listObjects, verifyPlan, cleanupBatch, withRetry,
} = require('../scripts/demoData');

async function run() {
  const config = makeConfig({ 'target-gb': '0.01', 'max-target-gb': '1', 'object-size-mb': '3', 'dataset-id': 'test-dataset', 'prefix-depth': '2' });
  const plan = buildPlan(config);
  assert.equal(plan.reduce((sum, item) => sum + item.size, 0), config.targetBytes, 'plan byte total matches target');
  assert.equal(plan[0].key.startsWith(`${ROOT}frequently-accessed/test-dataset/part-000/part-000/`), true);
  assert.ok(plan.every((item) => item.size > 0 && item.size <= 3 * MiB));
  assert.throws(() => parseDistribution('logs:90'), /total 100/);
  assert.throws(() => buildPlan(makeConfig({ 'target-gb': '2', 'max-target-gb': '1' })), /exceeds MAX_TARGET_SIZE_GB/);

  const streamA = createSyntheticReadable(4097, 'stable-seed');
  const streamB = createSyntheticReadable(4097, 'stable-seed');
  const [bytesA, bytesB] = await Promise.all([
    (async () => { const chunks = []; for await (const chunk of streamA) chunks.push(chunk); return Buffer.concat(chunks); })(),
    (async () => { const chunks = []; for await (const chunk of streamB) chunks.push(chunk); return Buffer.concat(chunks); })(),
  ]);
  assert.equal(bytesA.length, 4097);
  assert.deepEqual(bytesA, bytesB, 'synthetic payloads are deterministic');

  let sent = 0;
  const fakeClient = { async send(command) {
    assert.ok(command.input.Prefix === ROOT);
    sent += 1;
    return sent === 1
      ? { Contents: [{ Key: plan[0].key, Size: plan[0].size }], IsTruncated: true, NextContinuationToken: 'page2' }
      : { Contents: plan.slice(1).map((item) => ({ Key: item.key, Size: item.size })), IsTruncated: false };
  } };
  const listed = [];
  for await (const object of listObjects(fakeClient, config.bucket, ROOT)) listed.push(object);
  assert.equal(sent, 2, 'ListObjectsV2 pagination follows continuation token');

  sent = 0;
  const result = await verifyPlan(fakeClient, config, plan);
  assert.equal(result.expectedBytes, config.targetBytes);
  assert.equal(result.success, true, 'verification compares actual listed objects');
  assert.equal(result.actualCount, plan.length);

  const cleanup = cleanupBatch([
    { Key: 'demo-data/logs/test/object.bin' },
    { Key: 'other-data/object.bin' },
    { Key: '../demo-data/object.bin' },
    { Key: 'demo-data' },
  ]);
  assert.deepEqual(cleanup.map((item) => item.Key), ['demo-data/logs/test/object.bin']);

  let attempts = 0;
  const retryResult = await withRetry(async () => {
    attempts += 1;
    if (attempts < 3) { const error = new Error('temporary'); error.name = 'SlowDown'; throw error; }
    return 'ok';
  }, { baseDelayMs: 0, sleep: async () => {} });
  assert.equal(retryResult, 'ok');
  assert.equal(attempts, 3, 'transient failures receive exponential retries');

  console.log('Demo data offline tests: 7 passed, 0 failed');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
