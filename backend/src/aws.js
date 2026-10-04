const { S3Client } = require("@aws-sdk/client-s3");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");
const { S3ControlClient } = require("@aws-sdk/client-s3-control");

const DEFAULT_REGION = process.env.AWS_REGION || "us-east-1";

// Primary S3 Client
const s3Client = new S3Client({
  region: DEFAULT_REGION,
});

// Cache for regional S3 clients to query buckets in different AWS regions (e.g., ap-south-2)
const regionalS3Clients = new Map();
regionalS3Clients.set(DEFAULT_REGION, s3Client);

function getS3ClientForRegion(region) {
  const targetRegion = region || DEFAULT_REGION;
  if (!regionalS3Clients.has(targetRegion)) {
    regionalS3Clients.set(
      targetRegion,
      new S3Client({ region: targetRegion })
    );
  }
  return regionalS3Clients.get(targetRegion);
}

// STS Client for verifying identity and fetching Account ID
const stsClient = new STSClient({
  region: DEFAULT_REGION,
});

// S3 Control Client for S3 Storage Lens Configurations
const s3ControlClient = new S3ControlClient({
  region: DEFAULT_REGION,
});

// Cached Caller Identity
let cachedIdentity = null;
let lastIdentityFetchTime = 0;
const IDENTITY_CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function getCallerIdentity(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedIdentity &&
    now - lastIdentityFetchTime < IDENTITY_CACHE_TTL_MS
  ) {
    return cachedIdentity;
  }

  try {
    const response = await stsClient.send(new GetCallerIdentityCommand({}));
    cachedIdentity = {
      accountId: response.Account || null,
      arn: response.Arn || null,
      userId: response.UserId || null,
      connected: true,
      region: DEFAULT_REGION,
    };
    lastIdentityFetchTime = now;
    return cachedIdentity;
  } catch (error) {
    console.warn("AWS STS Caller Identity check failed:", error.message);
    return {
      accountId: null,
      arn: null,
      userId: null,
      connected: false,
      region: DEFAULT_REGION,
      error: error.message,
    };
  }
}

// Attach helpers and sub-clients directly to s3Client for 100% backward compatibility
s3Client.s3Client = s3Client;
s3Client.stsClient = stsClient;
s3Client.s3ControlClient = s3ControlClient;
s3Client.getS3ClientForRegion = getS3ClientForRegion;
s3Client.getCallerIdentity = getCallerIdentity;
s3Client.DEFAULT_REGION = DEFAULT_REGION;

module.exports = s3Client;