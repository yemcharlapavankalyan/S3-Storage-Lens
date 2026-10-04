import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { RegionSummaryStrip } from '../components/regional/RegionSummaryStrip';
import { WorldInfrastructureMap } from '../components/regional/WorldInfrastructureMap';
import { RegionDetailsPanel } from '../components/regional/RegionDetailsPanel';
import { RegionalStorageDistribution } from '../components/regional/RegionalStorageDistribution';
import { ReplicationTopology } from '../components/regional/ReplicationTopology';
import { FailoverRecommendation } from '../components/regional/FailoverRecommendation';
import { RegionInfrastructure } from '../types/regional';
import {
  getRegionalInfrastructure,
  RegionalInfrastructureResponse,
} from '../services/regionalService';
import { useApp } from '../context/AppContext';
import { Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegionalInfrastructurePage: React.FC = () => {
  const { lastRefreshed } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [infraData, setInfraData] = useState<RegionalInfrastructureResponse>({
    regions: [],
    connections: [],
    summary: { configuredRegions: 0, replicationPaths: 0, failoverCandidates: 0, healthStatusText: 'Loading live AWS region inventory' },
    dataSource: 'UNAVAILABLE',
  });

  const [selectedRegion, setSelectedRegion] = useState<RegionInfrastructure | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const response = await getRegionalInfrastructure();
        setInfraData(response);
        if (response.regions.length > 0) {
          // Keep selection or default to Primary
          setSelectedRegion((prev) =>
            prev ? response.regions.find((r) => r.id === prev.id) || response.regions[0] : response.regions[0]
          );
        }
      } catch (err: any) {
        console.warn('Failed to load regional infrastructure from backend:', err);
        setError('Regional inventory is unavailable because the backend did not return live AWS data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  const handleSelectRegion = (region: RegionInfrastructure) => {
    setSelectedRegion(region);
  };

  const handleClearSelection = () => {
    setSelectedRegion(null);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Page Title & Subtitle Header */}
      <PageHeader
        title="Regional Infrastructure"
        subtitle="Monitor regional S3 storage, health, replication and failover readiness."
        showDateRange={false}
        showRefresh={true}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
            {infraData.dataSource === 'LIVE_AWS' || infraData.dataSource === 'aws-s3-hybrid' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-800 dark:text-slate-200">LIVE AWS inventory</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-700 dark:text-slate-300">UNAVAILABLE</span>
              </>
            )}
          </div>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-[540px] rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 animate-pulse" />
            <div className="lg:col-span-4 h-[540px] rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {!infraData.regions.length ? <div className="aws-card p-10 text-center"><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">No regional inventory returned</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Region and bucket details will appear here when the AWS-backed regional endpoint returns them.</p></div> : <>
          {/* Top Infrastructure Summary Strip */}
          <RegionSummaryStrip summary={infraData.summary} />

          {/* Main Workspace: World Map (Large Left) & Region Details Panel (Narrow Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left / Large: World Infrastructure Map */}
            <div className="lg:col-span-8 xl:col-span-8 flex flex-col">
              <WorldInfrastructureMap
                regions={infraData.regions}
                connections={infraData.connections}
                selectedRegionId={selectedRegion?.id || null}
                onSelectRegion={handleSelectRegion}
                className="flex-1"
              />
            </div>

            {/* Right / Narrow: Region Details Panel */}
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
              <RegionDetailsPanel
                selectedRegion={selectedRegion}
                onClearSelection={handleClearSelection}
                className="flex-1"
              />
            </div>
          </div>

          {/* Regional Storage Distribution */}
          <RegionalStorageDistribution
            regions={infraData.regions}
            selectedRegionId={selectedRegion?.id || null}
            onSelectRegion={handleSelectRegion}
          />

          {/* Replication Topology & Failover Recommendation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReplicationTopology
              regions={infraData.regions}
              selectedRegionId={selectedRegion?.id || null}
              onSelectRegion={handleSelectRegion}
            />
            <FailoverRecommendation />
          </div>
          </>}
        </>
      )}
    </div>
  );
};

export default RegionalInfrastructurePage;
