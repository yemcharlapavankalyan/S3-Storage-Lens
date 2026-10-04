import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ActivityMetricPoint } from '../../types';
import { Activity, Info } from 'lucide-react';

interface ActivityChartProps {
  data: ActivityMetricPoint[];
  status: 'available' | 'pending' | 'unavailable';
  reason?: string | null;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, status, reason }) => {
  if (status !== 'available' || !data || data.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/[0.06] text-center">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
          <Activity className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
          {status === 'pending' ? 'Business Activity Metrics Pending' : 'Business Activity Metrics Unavailable'}
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
          {reason || 'No verified GET/PUT request or egress observations are available from AWS. This panel charts published Storage Lens daily activity metrics when present.'}
        </p>
        <div className="mt-4 px-3.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono">
            GET / PUT / Downloaded bytes: {status === 'pending' ? 'PENDING' : 'UNAVAILABLE'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30 font-mono">
            UNAVAILABLE
          </span>
        </div>
      </div>
    );
  }
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ActivityMetricPoint;
      return (
        <div className="bg-white dark:bg-[#0B0F19]/95 backdrop-blur-xl text-slate-900 dark:text-white text-xs p-3.5 rounded-xl shadow-2xl border border-slate-200 dark:border-white/[0.1] font-sans">
          <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-1 mb-2 font-display">
            Activity for {label}
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <p className="flex justify-between gap-6">
              <span className="text-amber-400">GET Requests:</span>
              <span className="font-semibold">{item.getRequests?.toLocaleString() ?? 'Unavailable'}</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-blue-400">PUT Requests:</span>
              <span className="font-semibold">{item.putRequests?.toLocaleString() ?? 'Unavailable'}</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-emerald-400">Downloaded Data:</span>
              <span className="font-semibold">{item.downloadedGB ?? 'Unavailable'} GiB</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
          />
          {/* Left Y Axis for Requests */}
          <YAxis
            yAxisId="requests"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
          />
          {/* Right Y Axis for Downloaded GB */}
          <YAxis
            yAxisId="bytes"
            orientation="right"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val} GB`}
          />
          <Tooltip content={customTooltip} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--chart-legend)' }}
            iconType="circle"
          />
          <Bar
            yAxisId="requests"
            dataKey="getRequests"
            name="GET Requests"
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            yAxisId="requests"
            dataKey="putRequests"
            name="PUT Requests"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="bytes"
            type="monotone"
            dataKey="downloadedGB"
            name="Downloaded (GiB)"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#10B981' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
