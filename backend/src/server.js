const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const s3Routes = require("./routes/s3Routes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bucketRoutes = require("./routes/bucketRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const optimizationRoutes = require("./routes/optimizationRoutes");
const lifecycleRoutes = require("./routes/lifecycleRoutes");
const costRoutes = require("./routes/costRoutes");
const regionalRoutes = require("./routes/regionalRoutes");
const storageLensRoutes = require("./routes/storageLensRoutes");

const app = express();

// ========================================
// Middleware Configuration
// ========================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ========================================
// API Routes Mounting
// ========================================
app.use("/api", healthRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buckets", bucketRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/optimization", optimizationRoutes);
app.use("/api/lifecycle", lifecycleRoutes);
app.use("/api/cost", costRoutes);
app.use("/api/regional", regionalRoutes);
app.use("/api/storage-lens", storageLensRoutes);

// Root fallback health
app.get("/", (req, res) => {
  res.json({
    name: "S3 Storage Lens & Infrastructure Optimizer API",
    status: "running",
    version: "1.0.0",
    healthCheck: "/api/health",
    docs: "/api/aws/status",
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error in S3 Optimizer backend",
    error: err.message,
  });
});

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5001;

// Only listen if not imported by test runner
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(` S3 Storage Optimizer Backend Running`);
    console.log(` Endpoint: http://localhost:${PORT}`);
    console.log(` Health:   http://localhost:${PORT}/api/health`);
    console.log(` Status:   http://localhost:${PORT}/api/aws/status`);
    console.log(`================================================`);
  });
}

module.exports = app;
