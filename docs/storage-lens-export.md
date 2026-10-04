# Storage Lens export integration

The application reads actual Amazon S3 Storage Lens metrics exports. It does not convert direct S3 `ListObjectsV2` inventory into Storage Lens metrics and does not synthesize missing metrics.

## AWS configuration

- Account: `283609055531`
- Dashboard: `s3-storage-lens-reviewer` (home Region `us-east-1`)
- Scope: account-level, all Regions and buckets
- Tier and selections: Advanced metrics, activity metrics, cost optimization metrics, prefix storage metrics (delimiter `/`, depth `5`, threshold `3%`)
- CloudWatch publishing: enabled
- Export: CSV schema `V_1`, SSE-S3, destination bucket `s3-storage-lens-export-283609055531` in `us-east-1`, prefix `storage-lens/`

The export bucket is private, has all S3 Block Public Access settings enabled, uses bucket-owner-enforced ownership, and has default SSE-S3 encryption. Its bucket policy permits only the Storage Lens service principal to write under the dashboard's export prefix, scoped to this account and dashboard ARN. No IAM policy was changed.

Storage Lens exports are generated daily. AWS writes a manifest at the versioned dashboard path, then report CSV files referenced by that manifest. The application discovers the latest manifest by paginating S3 listings and reads only the report files the manifest names. Prefix values are URL-decoded according to the AWS export schema.

## API

All routes are under `/api/storage-lens`:

| Endpoint | Purpose |
| --- | --- |
| `GET /status` | Dashboard configuration metadata from S3 Control |
| `GET /export/status` | Destination settings and whether a first/latest export manifest exists |
| `GET /metrics` | Rows in the latest manifest's actual report CSV files, separated as account, bucket, and prefix records |
| `GET /trends` | Account-level daily values from up to 90 real manifests; no interpolation |
| `GET /prefixes` | Prefix rows from the latest actual export |

The export status values are `NOT_CONFIGURED`, `CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT`, `AVAILABLE`, or `UNAVAILABLE`. A waiting response means AWS has not delivered a manifest yet; the UI shows the destination and does not substitute live inventory or fixtures. Metrics are labeled `STORAGE LENS` only after the CSV report has been read successfully.

The S3 console may show an empty dashboard while the first daily aggregation is being prepared. The application reports the actual manifest/report date when available; S3 object `LastModified` is not presented as a metric date. No S3 demo data is written, modified, or deleted by this integration.
