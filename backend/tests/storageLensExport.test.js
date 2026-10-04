const assert = require("node:assert/strict");
const { parseCsv, destinationDetails } = require("../src/services/storageLensExportService");

const csv = [
  "version_number,configuration_id,report_date,aws_account_number,aws_region,storage_class,record_type,record_value,bucket_name,metric_name,metric_value",
  '1.0,s3-storage-lens-reviewer,2026-10-03,283609055531,us-east-1,STANDARD,PREFIX,"demo-data/frequently-accessed/a,b/",s3-demo,StorageBytes,1024',
  "1.0,s3-storage-lens-reviewer,2026-10-03,283609055531,ap-south-2,STANDARD,ACCOUNT,, ,ObjectCount,105",
].join("\n");

const rows = parseCsv(csv);
assert.equal(rows.length, 2);
assert.equal(rows[0].record_value, "demo-data/frequently-accessed/a,b/");
assert.equal(rows[0].metric_value, 1024);
assert.equal(rows[1].metric_value, 105);

const destination = destinationDetails({
  Id: "s3-storage-lens-reviewer",
  DataExport: {
    S3BucketDestination: {
      Arn: "arn:aws:s3:::s3-storage-lens-export-283609055531",
      Prefix: "storage-lens/",
      Format: "CSV",
      OutputSchemaVersion: "V_1",
    },
  },
}, "283609055531");
assert.equal(destination.bucket, "s3-storage-lens-export-283609055531");
assert.equal(destination.root, "storage-lens/StorageLens/283609055531/s3-storage-lens-reviewer/V_1");
assert.equal(destination.format, "CSV");

console.log("Storage Lens export parser tests passed.");
