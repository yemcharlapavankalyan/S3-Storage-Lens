# Amazon S3 Storage Lens & Infrastructure Optimizer
> **Subtitle:** An AWS-Based Approach for Monitoring, Analysis, and Storage Optimization  
> **Application Name:** S3 Storage Optimizer  
> **Authors:** Pavan Kalyan, Charitha, Sravanthi, Narasimha

---

##  Project Overview

**S3 Storage Optimizer** is an end-to-end cloud infrastructure and storage management solution. It integrates a high-performance **React 19 + TypeScript** frontend with a **Node.js/Express + AWS SDK v3** backend to visualize, monitor, analyze, and optimize Amazon S3 storage portfolios.

### Key Capabilities
* **Live AWS Integration:** Connects directly to Amazon S3, AWS STS, and AWS S3 Storage Lens using standard AWS credential chains (`~/.aws/credentials` or IAM roles).
* **Storage Lens Dashboards:** Reads the `s3-storage-lens-reviewer` configuration and ingests actual daily CSV exports from its dedicated S3 destination when AWS delivers them. A configured destination without files is shown as waiting, never filled with S3 inventory or sample metrics.
* **Regional Infrastructure Map:** Discovers bucket Regions from AWS and displays the two live demo-data Regions: `us-east-1` and `ap-south-2` (Hyderabad). It does not infer replication or failover configuration from co-location.
* **Optimization Recommendations:** Data-driven recommendations derived from real S3 objects, file patterns, and storage class distributions, calculating real cost differentials rather than hardcoded guesses.
* **Cost Intelligence:** Transparent cost modeling based on published AWS S3 tier pricing ($0.023/GB Standard, $0.0125/GB Standard-IA, $0.004/GB Glacier).
* **Source-aware unavailable states:** Storage Lens export and analytics views do not fall back to sample metrics when AWS is unreachable or has not delivered a report. A small number of non-metric demonstration views retain isolated fixture data.

---

##  Technology Stack

### Frontend
* **Framework:** React 19 + TypeScript (Strict mode)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (Custom dark AWS infrastructure observability theme)
* **Mapping:** `d3-geo` (Natural Earth projection) + `topojson-client` + `world-atlas` (110m TopoJSON)
* **Charts:** Recharts (responsive multi-axis line/bar charts, donut tier breakdowns)
* **Icons:** Lucide React
* **Routing:** React Router (HashRouter for seamless deep linking and static previewing)

### Backend
* **Runtime:** Node.js (v18+)
* **Framework:** Express 5
* **AWS SDK v3:**
  * `@aws-sdk/client-s3` (S3 object listing, bucket discovery, encryption, versioning, replication, lifecycle)
  * `@aws-sdk/client-sts` (Caller identity, Account ID, IAM verification)
  * `@aws-sdk/client-s3-control` (S3 Storage Lens dashboard configurations)
* **Middleware:** CORS (cross-origin enabled), JSON body parser, request duration telemetry

---

##  Project Architecture

```
s3-storage-optimizer/
├── .env.example                  # Frontend environment configuration template
├── package.json                  # Root scripts (build, dev, backend, test)
├── tailwind.config.js            # Tailwind AWS tokens & dark themes
├── vite.config.ts                # Vite bundler configuration
│
├── backend/                      # Node.js / Express REST API Backend
│   ├── package.json              # Backend dependencies (@aws-sdk/*, express, cors, dotenv)
│   ├── .env                      # Backend environment variables (PORT, AWS_REGION, DEFAULT_BUCKET)
│   ├── src/
│   │   ├── server.js             # Express app entry point & route mounting
│   │   ├── aws.js                # AWS SDK v3 client initialization & STS caller identity cache
│   │   ├── routes/
│   │   │   ├── healthRoutes.js   # /api/health, /api/aws/status
│   │   │   ├── s3Routes.js       # /api/s3/objects, /api/s3/metrics
│   │   │   ├── dashboardRoutes.js# /api/dashboard/summary, storage-by-class, trend, events
│   │   │   ├── bucketRoutes.js   # /api/buckets, /api/buckets/:id
│   │   │   ├── analyticsRoutes.js# /api/analytics/kpis, trends, prefixes
│   │   │   ├── optimizationRoutes.js # /api/optimization/candidates, status updates
│   │   │   ├── lifecycleRoutes.js# /api/lifecycle/summary, policies
│   │   │   ├── costRoutes.js     # /api/cost/analysis
│   │   │   └── regionalRoutes.js # /api/regional/infrastructure
│   │   └── services/
│   │       ├── s3Service.js      # Multi-bucket discovery, object listing, metrics
│   │       ├── storageLensService.js # Storage Lens configuration + clearly labeled S3 inventory summaries
│   │       ├── storageLensExportService.js # Reads manifests and actual Storage Lens CSV exports
│   │       ├── optimizationService.js# Rule-based candidate generation from real objects
│   │       ├── lifecycleService.js# S3 Lifecycle policy inspection & application
│   │       ├── costService.js    # AWS published pricing tier calculations
│   │       └── regionalService.js# Cross-region bucket discovery & topology mapping
│   └── tests/
│       └── smokeTest.js          # Automated HTTP test suite verifying all 18 endpoints
│
└── src/                          # React TypeScript Frontend
    ├── components/
    │   ├── common/               # MetricCard, ChartCard, Badges, DetailDrawer, PageHeader
    │   ├── layout/               # Sidebar, Topbar, MainLayout
    │   ├── dashboard/            # ActivityChart, RecentActivityList, StorageClassDonut, StorageTrendChart
    │   ├── analytics/            # AnalyticsDetailDrawer
    │   ├── buckets/              # BucketDetailDrawer
    │   ├── optimization/         # OptimizationInsightsCard, OptimizationReviewModal
    │   ├── lifecycle/            # CreatePolicyModal, LifecycleTimeline, PolicyDetailDrawer
    │   └── regional/             # WorldInfrastructureMap, RegionMarker, RegionDetailsPanel,
    │                             # MapControls, MapLegend, ReplicationLink, RegionSummaryStrip,
    │                             # RegionalStorageDistribution, ReplicationTopology, FailoverRecommendation
    ├── pages/                    # 8 Application Pages (Dashboard, Analytics, Buckets, Optimization,
    │                             # Lifecycle, Cost, Settings, Regional Infrastructure)
    ├── services/                 # Frontend API client layer (apiClient with fallback)
    ├── mock/                     # Offline fallback demonstration datasets
    └── types/                    # Shared TypeScript interfaces
```

---

##  AWS IAM Permissions Required

To run the backend against live AWS resources, ensure your AWS IAM User, Role, or CLI profile has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "STSCallerIdentity",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3BucketInspection",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning",
        "s3:GetBucketEncryption",
        "s3:GetLifecycleConfiguration",
        "s3:GetReplicationConfiguration",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::*",
        "arn:aws:s3:::*/*"
      ]
    },
    {
      "Sid": "S3StorageLensRead",
      "Effect": "Allow",
      "Action": [
        "s3:ListStorageLensConfigurations",
        "s3:GetStorageLensConfiguration",
        "s3:GetStorageLensDashboard"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3LifecycleManagementOptional",
      "Effect": "Allow",
      "Action": [
        "s3:PutLifecycleConfiguration"
      ],
      "Resource": "arn:aws:s3:::*"
    }
  ]
}
```

*Note: AWS credentials are never committed to source control. The backend automatically leverages standard AWS SDK credential discovery (AWS environment variables, `~/.aws/credentials`, or ECS/EC2 instance profiles).*

---

## ⚙️ Environment Variables

### 1. Frontend (`.env` or root `.env.example`)
```env
# Port where Express backend is running
VITE_API_BASE_URL=http://localhost:5001/api

# Default region display
VITE_AWS_DEFAULT_REGION=us-east-1
```

### 2. Backend (`backend/.env`)
```env
# Backend server port
PORT=5001

# Default AWS Region
AWS_REGION=us-east-1

# Primary bucket to inspect
DEFAULT_BUCKET=s3-storage-lens-pavan-2026

# Storage Lens dashboard whose configuration and exports are read
STORAGE_LENS_DASHBOARD_ID=s3-storage-lens-reviewer
```

---

##  Setup & Startup Instructions

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **AWS CLI** (configured via `aws configure` with valid credentials)

### 2. Installation
Install root and backend dependencies:
```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Start the Backend API Server
In a dedicated terminal, start the Express backend:
```bash
npm run backend
```
*Output confirms:*
```
 S3 Storage Optimizer Backend Running
 Endpoint: http://localhost:5001
 Health:   http://localhost:5001/api/health
 Status:   http://localhost:5001/api/aws/status
```

### 4. Start the Frontend Development Server
In a second terminal, start Vite:
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or the port Vite outputs).

---

##  Testing Commands

### Run Backend API Smoke Tests
Executes the automated test suite verifying all 18 backend endpoints:
```bash
npm run backend:test
```
*Tests verify status 200, valid JSON schemas, and live AWS responses across all routes.*

### Run Frontend TypeScript Build
Validates strict type-checking and produces the minified bundle:
```bash
npm run build
```

### Run Linter
Checks code quality with `oxlint`:
```bash
npm run lint
```

---

##  Complete REST API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Backend status, uptime, AWS connectivity check, Account ID |
| **AWS** | `GET` | `/api/aws/status` | Live STS caller identity, IAM ARN, region, bucket list, round-trip latency |
| **Storage Lens** | `GET` | `/api/storage-lens/status` | Live dashboard configuration metadata |
| **Storage Lens** | `GET` | `/api/storage-lens/export/status` | Export destination and first/latest manifest status |
| **Storage Lens** | `GET` | `/api/storage-lens/metrics` | Latest actual CSV export rows grouped by account, bucket, and prefix |
| **Storage Lens** | `GET` | `/api/storage-lens/trends` | Daily observations derived only from available export manifests |
| **Storage Lens** | `GET` | `/api/storage-lens/prefixes` | Prefix-level rows from the latest actual export |
| **S3 Raw** | `GET` | `/api/s3/objects?bucket=...` | List objects in bucket (size, class, key, last modified) |
| **S3 Raw** | `GET` | `/api/s3/metrics?bucket=...` | Storage bytes, file extensions, largest and latest object |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Total storage, object counts, monitored buckets, candidate counts |
| **Dashboard** | `GET` | `/api/dashboard/storage-by-class` | Breakdown by storage class (Standard, IA, Intelligent, Glacier) |
| **Dashboard** | `GET` | `/api/dashboard/storage-trend` | Current storage observation calculated from direct S3 inventory |
| **Dashboard** | `GET` | `/api/dashboard/activity-overview` | Actual Storage Lens activity datapoints from CloudWatch, or pending/unavailable status |
| **Dashboard** | `GET` | `/api/dashboard/events` | Recent system activity stream |
| **Buckets** | `GET` | `/api/buckets` | Real AWS buckets list with region, versioning, encryption, prefixes |
| **Buckets** | `GET` | `/api/buckets/:id` | Detailed metadata for a single bucket |
| **Analytics** | `GET` | `/api/analytics/kpis` | Aggregated analytics KPIs |
| **Analytics** | `GET` | `/api/analytics/prefixes` | Filterable prefix records (`bucket`, `class`, `activity`, `search`) |
| **Analytics** | `GET` | `/api/analytics/prefixes/:id` | Single prefix telemetry record |
| **Optimization**| `GET` | `/api/optimization/candidates` | Rule-based optimization candidates generated from live S3 objects |
| **Optimization**| `PATCH`| `/api/optimization/candidates/:id/status`| Update candidate approval status (`APPROVED`, `REJECTED`, `REVIEW`) |
| **Lifecycle** | `GET` | `/api/lifecycle/summary` | Summary of active, review, and draft lifecycle policies |
| **Lifecycle** | `GET` | `/api/lifecycle/policies` | Live S3 bucket lifecycle rules + staged custom policies |
| **Lifecycle** | `POST`| `/api/lifecycle/policies` | Create/apply new S3 Lifecycle policy to AWS bucket |
| **Cost** | `GET` | `/api/cost/analysis` | Spend analysis, AWS rate modeling, comparison segments |
| **Regional** | `GET` | `/api/regional/infrastructure` | Geographic topology, bucket-to-region mapping, CRR status, failover candidate |

---

##  Regional Infrastructure Feature

The centerpiece **Regional Infrastructure** console (`/#/regional-infrastructure`) provides:
1. **Interactive World Map**: Natural Earth projection with continents, country boundaries, oceanic labels, and zoom/reset controls.
2. **Geographic AWS Markers**:
   * **US East (`us-east-1`)**: `s3-storage-lens-pavan-2026` live S3 dataset.
   * **Hyderabad (`ap-south-2`)**: `s3-storage-lens-pavan-hyd-2026` live S3 dataset.
3. **Replication and failover**: Shown only when source S3 configuration confirms a real relationship; separate demo buckets do not imply replication.
4. **Dynamic Inspection Panel**: Live region details updating instantly when selecting markers on the map.
5. **Horizontal Storage Distribution & Topology**: Proportional tier bar and node-to-node replication diagrams.
6. **Failover Evaluation**: Standby candidate criteria matrix with transparent evaluation notice.

---

##  End-to-End Data Flow Verification

```
[React UI (Port 5173)]
        │  HTTP Fetch (apiClient)
        ▼
[Express REST API (Port 5001)]
        │  AWS SDK v3 Commands
        ▼
[AWS Cloud Services]
  ├── AWS STS (GetCallerIdentity)
  ├── Amazon S3 (ListBuckets, GetBucketLocation, ListObjectsV2, GetLifecycle)
  └── AWS S3 Storage Lens (configuration, manifests, and daily CSV export objects)
        │
        ▼
[Backend Aggregation & Pricing Models]
        │
        ▼
[React UI State & Observability Views]
```

Storage Lens export bucket and current AWS configuration are documented in [docs/storage-lens-export.md](docs/storage-lens-export.md). Direct S3 object inventory remains labeled `LIVE AWS` or `CALCULATED`; it is not reported as Storage Lens data.
