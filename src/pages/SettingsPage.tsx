import React, { useState } from 'react';
import {
  Cloud,
  Sliders,
  Bell,
  Monitor,
  Save,
  Info,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';

import { getAwsStatus, AwsStatusResponse } from '../services/awsService';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, addToast } = useApp();

  const [form, setForm] = useState(settings);
  const [testingConnection, setTestingConnection] = useState(false);
  const [awsInfo, setAwsInfo] = useState<AwsStatusResponse | null>(null);

  // Auto-detect and populate live AWS status on mount
  React.useEffect(() => {
    getAwsStatus()
      .then((status) => {
        setAwsInfo(status);
      })
      .catch((err) => {
        console.warn('Could not auto-fetch AWS status on mount:', err);
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addToast('Configuration Saved', 'Settings updated successfully.', 'success');
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const status = await getAwsStatus();
      setAwsInfo(status);

      if (status.connected) {
        addToast(
          'AWS Connection Verified',
          `Connected to Account ${status.accountId} (${status.bucketsCount} buckets, region ${status.region}) in ${status.latencyMs}ms.`,
          'success'
        );
      } else {
        addToast(
          'Connection Issue',
          status.error || 'Backend reached, but AWS credentials not detected.',
          'warning'
        );
      }
    } catch {
      addToast('Connection Failed', `Could not reach backend at ${form.backendApiUrl}`, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Settings"
        subtitle="Configure AWS connection parameters, Storage Lens threshold sensitivity, and notification preferences."
        showDateRange={false}
        showRefresh={false}
      />

      {/* Backend & AWS Status Notice */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-start gap-3 text-slate-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-slate-200">
        <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-900 dark:text-white block">
            AWS backend connection
          </strong>
          <p className="mt-0.5 text-emerald-800/90 leading-relaxed">
            {awsInfo?.connected ? <>AWS account <span className="font-mono font-bold text-emerald-950">{awsInfo.accountId || 'verified'}</span> is reachable through the backend at <code className="font-mono text-emerald-700">{form.backendApiUrl}</code>. S3 inventory is read directly; Storage Lens metrics are reported separately when AWS publishes them.</> : <>AWS account identity is not verified yet. Use Test Connection to check the backend and configured AWS credential chain. Storage Lens availability is reported separately from direct S3 inventory.</>}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AWS Connection */}
        <div className="aws-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
            <Cloud className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AWS Connection & API Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Configure connection parameters for AWS Storage Lens and REST services
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                AWS Region
              </label>
              <select
                value={form.awsRegion}
                onChange={(e) => setForm({ ...form, awsRegion: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="us-east-1">us-east-1</option>
                <option value="ap-south-2">ap-south-2</option>
                <option value="ap-south-1">ap-south-1</option>
                <option value="us-west-2">us-west-2</option>
                <option value="eu-west-1">eu-west-1</option>
              </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
                Backend AWS region context; bucket regions are discovered independently.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Backend API URL (<code className="font-mono text-amber-700">VITE_API_BASE_URL</code>)
              </label>
              <input
                type="text"
                value={form.backendApiUrl}
                onChange={(e) => setForm({ ...form, backendApiUrl: e.target.value })}
                placeholder="http://localhost:8080/api"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500 font-mono text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Node.js Express / AWS S3 backend REST endpoint
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${awsInfo?.connected ? 'bg-emerald-500' : awsInfo?.connected === false ? 'bg-rose-500' : 'bg-slate-400'}`} />
              <span className="text-xs text-slate-600 font-medium">
                Connection Status:{' '}
                <strong>
                  {awsInfo?.connected
                    ? `Live AWS Connected (${awsInfo.latencyMs}ms)`
                    : awsInfo?.connected === false
                    ? 'Disconnected / Offline'
                    : 'Ready to Test'}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="btn-secondary !text-xs !py-1.5 !px-3 shrink-0"
            >
              <Zap className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
              <span>{testingConnection ? 'Pinging API...' : 'Test Connection'}</span>
            </button>
          </div>

          {awsInfo?.connected && (
            <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-800 font-sans font-medium">Account ID:</span>
                <span className="font-bold">{awsInfo.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-sans font-medium">IAM Principal:</span>
                <span className="truncate max-w-[280px] sm:max-w-md">{awsInfo.arn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-sans font-medium">Storage Lens:</span>
                <span>{awsInfo.storageLensDashboard || 'Unavailable'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-sans font-medium">Discovered Buckets:</span>
                <span>{awsInfo.bucketNames.join(', ') || `${awsInfo.bucketsCount} buckets`}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Analysis Settings */}
        <div className="aws-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
            <Sliders className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Storage Lens Heuristic & Analysis Rules
              </h2>
              <p className="text-xs text-slate-500">
                Tune object-age and size thresholds for inventory-based review candidates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Activity Observation Threshold ({form.activityThresholdDays} days)
              </label>
              <input
                type="range"
                min="7"
                max="90"
                step="1"
                value={form.activityThresholdDays}
                onChange={(e) =>
                  setForm({ ...form, activityThresholdDays: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>7 days</span>
                <span>{form.activityThresholdDays} days</span>
                <span>90 days</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Minimum Candidate Storage Volume ({form.optimizationThresholdGB} GB)
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={form.optimizationThresholdGB}
                onChange={(e) =>
                  setForm({ ...form, optimizationThresholdGB: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>10 GB</span>
                <span>{form.optimizationThresholdGB} GB</span>
                <span>500 GB</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Recommendation Sensitivity
              </label>
              <select
                value={form.recommendationSensitivity}
                onChange={(e) =>
                  setForm({ ...form, recommendationSensitivity: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Conservative">
                  Conservative (Review fewer candidates)
                </option>
                <option value="Balanced">Balanced (Standard 30-day evaluation)</option>
                <option value="Aggressive">
                  Aggressive (Review more candidates)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Minimum S3 Object Size Filter ({form.minimumStorageSizeMB} KB)
              </label>
              <input
                type="number"
                value={form.minimumStorageSizeMB}
                onChange={(e) =>
                  setForm({ ...form, minimumStorageSizeMB: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard-IA minimum billable threshold is 128 KB
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Settings */}
        <div className="aws-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
            <Bell className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                System Alert & Notification Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Manage automated notifications for storage milestones and reviews
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableOptimizationAlerts}
                onChange={(e) =>
                  setForm({ ...form, enableOptimizationAlerts: e.target.checked })
                }
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  New Optimization Candidate Alerts
                </span>
                <span className="text-slate-500 text-[11px]">
                  Receive notifications when Storage Lens discovers prefix segments eligible for Infrequent Access or Glacier transitions.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableStorageGrowthAlerts}
                onChange={(e) =>
                  setForm({ ...form, enableStorageGrowthAlerts: e.target.checked })
                }
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Storage Growth Velocity Alerts
                </span>
                <span className="text-slate-500 text-[11px]">
                  Alert when a monitored bucket exceeds 15% monthly volume growth rate.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableLifecycleAlerts}
                onChange={(e) =>
                  setForm({ ...form, enableLifecycleAlerts: e.target.checked })
                }
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Lifecycle Execution Summaries
                </span>
                <span className="text-slate-500 text-[11px]">
                  Daily digest summarizing object transitions and expiration rule runs.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Display Settings */}
        <div className="aws-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
            <Monitor className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Display & Interface Settings
              </h2>
              <p className="text-xs text-slate-500">
                Visual preferences and dashboard density
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Dashboard Theme
              </label>
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="light">Light Professional (AWS Standard)</option>
                <option value="dark">Dark Enterprise</option>
                <option value="system">System Synchronized</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Table Row Density
              </label>
              <select
                value={form.compactMode ? 'compact' : 'comfortable'}
                onChange={(e) =>
                  setForm({ ...form, compactMode: e.target.value === 'compact' })
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="comfortable">Comfortable (Standard padding)</option>
                <option value="compact">Compact (High density data rows)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="btn-primary !py-2.5 !px-6 text-xs font-semibold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
