# Demo data management

The standalone CLI in `backend/scripts/demoData.js` creates synthetic objects under a bucket's `demo-data/` prefix. It uses the same AWS SDK credential chain and project `.env` as the backend. It never writes outside that prefix. Before a real operation it verifies AWS identity, checks the bucket's actual location, and refuses region mismatches. A missing bucket is only created by an explicitly confirmed upload; dry-run never creates it.

## Regional demo layout

The project uses separate buckets for regional datasets:

| Region | Bucket | Dataset status |
| --- | --- | --- |
| `us-east-1` (N. Virginia) | `s3-storage-lens-pavan-2026` | Existing live S3 demo dataset: 20 GiB / 207 objects under `demo-data/` (as recorded for this project). |
| `ap-south-2` (Asia Pacific, Hyderabad) | `s3-storage-lens-pavan-hyd-2026` | Live S3 dataset `dataset-20261003195542`: 10 GiB / 105 objects under `demo-data/`; paginated verification passed with all five prefixes and no missing or unexpected objects. |

These labels mean **LIVE S3 DATA** from direct S3 inventory. They do not mean Storage Lens metrics. Keep the regional buckets and observations distinct; do not copy, delete, overwrite, or re-upload the us-east-1 dataset while preparing the Hyderabad dataset.

Run the Hyderabad dry-run with an automatically generated dataset ID:

```sh
DEMO_BUCKET=s3-storage-lens-pavan-hyd-2026 DEMO_REGION=ap-south-2 DEMO_TARGET_GIB=10 npm run demo-data:dry-run
```

The dry-run prints the AWS identity, bucket status and verified region (when the bucket exists), requested plan, existing object count, and potential key conflicts. If the bucket is absent it reports that an explicitly confirmed upload would create it in `ap-south-2`; it does not create it. A region mismatch or inconclusive bucket check is an error and must be resolved before any upload.

## Dry run (default target: 20 GiB)

```sh
npm run demo-data:dry-run
```

This calculates the plan and performs a read-only bucket/prefix check. It does not upload. For a local-only calculation without AWS access, use the offline test mode:

```sh
npm run demo-data:test
```

## Upload 20 GiB

Choose a stable dataset ID and run a dry run first:

```sh
npm run demo-data:dry-run -- --target-gb 20 --dataset-id class-demo-20g
npm run demo-data:upload -- --target-gb 20 --dataset-id class-demo-20g
```

The upload command prints the bucket, region, size, object count, distribution, and storage class. It requires typing `yes` at an interactive prompt before writes begin. Non-interactive upload is refused. A default 100 GiB safety cap applies; exceeding it stops unless `--override-limit` is supplied. That override never bypasses the confirmation prompt. Upload defaults to 20 GiB, not 1 TiB.

By default, objects are at most 100 MiB, split among category prefixes with the configured proportions: frequently-accessed 25%, logs 15%, analytics 20%, archive 25%, and reports 15%. The last object in each prefix may be smaller so the generated plan matches the requested total. The plan uses MiB object-size units and GiB target units (1 GiB = 1024³ bytes). Large objects use the AWS SDK multipart Upload manager; smaller objects use PutObject. Each key carries a synthetic-data marker and dataset ID metadata.

## Increase the target or tune the plan

```sh
npm run demo-data:dry-run -- --target-gb 50 --object-size-mb 64 --concurrency 8 --prefix-depth 2
npm run demo-data:upload -- --target-gb 50 --max-target-gb 100 --object-size-mb 64 --concurrency 8 --prefix-depth 2 --dataset-id class-demo-50g
```

The larger target remains subject to the 100 GiB configured cap and explicit confirmation. To change percentages, provide all five keys totaling 100:

```sh
PREFIX_DISTRIBUTION='frequently-accessed:25,logs:15,analytics:20,archive:25,reports:15' npm run demo-data:dry-run
```

Other settings can be provided through environment variables: `TARGET_SIZE_GB` (alias `DEMO_TARGET_GIB`), `MAX_TARGET_SIZE_GB`, `OBJECT_SIZE_MB`, `CONCURRENCY`, `PREFIX_DEPTH`, `STORAGE_CLASS`, `DEMO_DATA_BUCKET` (alias `DEMO_BUCKET`), and `DEMO_DATA_REGION` (alias `DEMO_REGION`). The `DEMO_*` aliases take precedence over older names. The CLI reads the project `.env` as the backend does; AWS secrets should remain in the existing AWS credential provider configuration and must not be placed in source code.

## Resume an interrupted upload

Use the exact same dataset ID and plan values:

```sh
npm run demo-data:upload -- --target-gb 20 --dataset-id class-demo-20g --resume
```

The tool lists the existing dataset first, skips only expected keys whose sizes match, refuses unexpected dataset keys or size mismatches, and uses conditional writes to prevent replacing an object that appears after preflight. A Ctrl+C stops scheduling new objects and lets active uploads finish; multipart transfers abort on unrecoverable failure, and the command reports that `--resume` can continue the dataset.

## Verify later

Use the same dataset ID and plan inputs as the upload:

```sh
npm run demo-data:verify -- --target-gb 20 --object-size-mb 100 --prefix-depth 1 --dataset-id class-demo-20g
```

Verification uses paginated S3 `ListObjectsV2` results and reports actual count, bytes, per-category totals, missing keys, size mismatches, and unexpected keys. It does not rely on Storage Lens.

## Generate controlled S3 activity (optional)

```sh
npm run demo-data:activity -- --dataset-id class-demo-20g --get-requests 1000 --head-requests 500 --list-requests 10 --concurrency 10
```

This first reads the demo-data prefix to find keys for the selected dataset, prints the exact request counts, and requires interactive `yes` confirmation. GET bodies are drained. Limits are enforced (100,000 GET/HEAD and 10,000 LIST requests per invocation; concurrency at most 32). These are generated S3 requests, **not real-time Storage Lens metrics**.

## Cleanup

```sh
npm run demo-data:cleanup
```

Cleanup lists and displays all current objects under exactly `demo-data/`, totals them, and requires typing `yes`. The delete request is constructed only from listed keys that start with `demo-data/`; it cannot target the bucket or other prefixes. Cleanup is not automatic. On versioned buckets, deleting current keys may leave older object versions and their storage charges; this command intentionally does not enumerate or delete versions.

## Cost and Storage Lens timing

S3 storage, request, retrieval, and possibly transfer charges depend on region, storage class, request volume, and how long objects remain. This tool does not claim an exact cost. Review current AWS pricing and the account's billing controls before an upload, especially above the default 20 GiB target.

Direct S3 listing can reflect completed uploads quickly, but that is not a Storage Lens metric. Storage Lens metrics are aggregated and published periodically; initial metrics may take time to appear, and historical trends require an adequate collection window/configuration. The application must continue to label object inventory as direct AWS data and Storage Lens activity/trends as `PENDING` or `UNAVAILABLE` until AWS actually returns those metrics.
