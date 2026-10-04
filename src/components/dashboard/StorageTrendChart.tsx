import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StorageTrendPoint } from '../../types';
import { Info, CheckCircle2 } from 'lucide-react';

interface StorageTrendChartProps {
  data: StorageTrendPoint[];
}

export const StorageTrendChart: React.FC<StorageTrendChartProps> = ({ data }) => {
  // If no data or only a single observation point exists (no historical 6-month trend from AWS)
  if (!data || data.length <= 1) {
    const observation = data && data.length === 1 ? data[0] : null;
    const formattedStorage = observation ? `${observation.totalTB} TB` : 'Unavailable';

    return (
      <div className="w-full h-64 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/[0.06] text-center">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
          <Info className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
          {observation ? 'Historical Storage Trend Unavailable' : 'Storage Trend Data Unavailable'}
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
          {observation ? 'Only the current inventory observation is available. No historical Storage Lens series has been returned, so no trend line is drawn.' : 'The backend did not return storage trend observations. Reconnect to the live API to view the current S3 inventory.'}
        </p>

        {observation && (
          <div className="mt-4 px-4 py-2.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-sans">
              Current S3 inventory observation:
            </span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {formattedStorage} (100% S3 Standard)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              LIVE
            </span>
          </div>
        )}
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as StorageTrendPoint;
      return (
        <div className="bg-white dark:bg-[#0B0F19]/95 backdrop-blur-xl text-slate-900 dark:text-white text-xs p-3.5 rounded-xl shadow-2xl border border-slate-200 dark:border-white/[0.1] font-sans">
          <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-1.5 mb-2 font-display">
            2026 {label} Storage
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <p className="flex justify-between gap-6">
              <span className="text-blue-400">S3 Standard:</span>
              <span className="font-semibold">{point.standardTB} TB</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-amber-400">Standard-IA:</span>
              <span className="font-semibold">{point.standardIaTB} TB</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-purple-400">Intelligent-Tiering:</span>
              <span className="font-semibold">{point.intelligentTB} TB</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-sky-400">Glacier Flexible:</span>
              <span className="font-semibold">{point.glacierTB} TB</span>
            </p>
            <div className="border-t border-slate-200 dark:border-white/[0.08] pt-1.5 mt-1.5 font-bold text-slate-900 dark:text-white flex justify-between">
              <span>Total Volume:</span>
              <span className="text-amber-400">{point.totalTB} TB</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="modernColorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="modernColorStandard" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val} TB`}
          />
          <Tooltip content={customTooltip} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--chart-legend)' }}
          />
          <Area
            type="monotone"
            dataKey="totalTB"
            name="Total Storage"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#modernColorTotal)"
            dot={{ stroke: '#F59E0B', strokeWidth: 2, fill: '#080C14', r: 3 }}
            activeDot={{ r: 5, fill: '#F59E0B' }}
          />
          <Area
            type="monotone"
            dataKey="standardTB"
            name="Standard Tier"
            stroke="#3B82F6"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#modernColorStandard)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
