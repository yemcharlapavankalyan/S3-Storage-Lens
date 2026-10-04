const http = require("http");
const app = require("../src/server");

const TEST_PORT = 5099;
let server;

function makeRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log(" Starting S3 Optimizer Backend Smoke Tests");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  async function assertEndpoint(name, path, method = "GET", body = null, validate = null) {
    try {
      const res = await makeRequest(path, method, body);
      const isStatusOk = res.status >= 200 && res.status < 300;
      let isDataValid = true;

      if (validate && isStatusOk) {
        isDataValid = validate(res.body);
      }
      if (path === "/api/dashboard/activity-overview" && res.body) {
        console.log(`Storage Lens activity: ${res.body.status}; ${res.body.observations?.length || 0} daily datapoints${res.body.reason ? `; ${res.body.reason}` : ""}`);
      }
      if (path === "/api/storage-lens/export/status" && res.body) {
        console.log(`Storage Lens export: ${res.body.status}; destination ${res.body.destination?.bucket || "not configured"}; latest report ${res.body.latestSnapshotDate || "none"}`);
      }

      if (isStatusOk && isDataValid) {
        console.log(`✓ [PASS] ${method} ${path} - Status ${res.status}`);
        passed++;
      } else {
        console.error(`✗ [FAIL] ${method} ${path} - Status: ${res.status}, Valid: ${isDataValid}`);
        console.error("  Response:", JSON.stringify(res.body || res.raw).slice(0, 150));
        failed++;
      }
    } catch (err) {
      console.error(`✗ [ERROR] ${method} ${path} - ${err.message}`);
      failed++;
    }
  }

  // Start test server
  server = app.listen(TEST_PORT, async () => {
    console.log(`Test server running on port ${TEST_PORT}\n`);

    await assertEndpoint("Health Check", "/api/health", "GET", null, (b) => b.status === "ok");
    await assertEndpoint("AWS Status", "/api/aws/status", "GET", null, (b) => b.region !== undefined);
    await assertEndpoint("S3 Objects", "/api/s3/objects", "GET", null, (b) => b.success === true && Array.isArray(b.objects));
    await assertEndpoint("S3 Metrics", "/api/s3/metrics", "GET", null, (b) => b.success === true && b.metrics !== undefined);
    await assertEndpoint("Dashboard Summary", "/api/dashboard/summary", "GET", null, (b) => b.totalStorageTB > 0);
    await assertEndpoint("Storage By Class", "/api/dashboard/storage-by-class", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Storage Trend", "/api/dashboard/storage-trend", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Activity Overview", "/api/dashboard/activity-overview", "GET", null, (b) => ["available", "pending", "unavailable"].includes(b.status) && Array.isArray(b.observations));
    await assertEndpoint("Events", "/api/dashboard/events", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Buckets List", "/api/buckets", "GET", null, (b) => Array.isArray(b) && b.length > 0);
    await assertEndpoint("Analytics KPIs", "/api/analytics/kpis", "GET", null, (b) => b.totalStorageTB !== undefined);
    await assertEndpoint("Analytics Prefixes", "/api/analytics/prefixes", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Optimization Candidates", "/api/optimization/candidates", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Update Candidate Status", "/api/optimization/candidates/opt-real-logs/status", "PATCH", { status: "APPROVED" }, (b) => b.success === true);
    await assertEndpoint("Lifecycle Summary", "/api/lifecycle/summary", "GET", null, (b) => b.totalRulesEvaluated !== undefined);
    await assertEndpoint("Lifecycle Policies", "/api/lifecycle/policies", "GET", null, (b) => Array.isArray(b));
    await assertEndpoint("Cost Analysis", "/api/cost/analysis", "GET", null, (b) => b.currentMonthlyCost !== undefined);
    await assertEndpoint("Regional Infrastructure", "/api/regional/infrastructure", "GET", null, (b) => Array.isArray(b.regions) && b.regions.length > 0 && b.dataSource === "LIVE_AWS");
    await assertEndpoint("Storage Lens Configuration", "/api/storage-lens/status", "GET", null, (b) => Array.isArray(b.configurations));
    await assertEndpoint("Storage Lens Export Status", "/api/storage-lens/export/status", "GET", null, (b) => b.status === "CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT" && b.destination?.bucket === "s3-storage-lens-export-283609055531");
    await assertEndpoint("Storage Lens Export Metrics", "/api/storage-lens/metrics", "GET", null, (b) => Array.isArray(b.metrics) && b.metrics.length === 0 && b.status === "CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT");
    await assertEndpoint("Storage Lens Export Trends", "/api/storage-lens/trends", "GET", null, (b) => Array.isArray(b.observations));
    await assertEndpoint("Storage Lens Export Prefixes", "/api/storage-lens/prefixes", "GET", null, (b) => Array.isArray(b.prefixes));

    console.log("\n==========================================");
    console.log(` Test Summary: ${passed} passed, ${failed} failed`);
    console.log("==========================================");

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
}

runTests();
