import React from 'react';
import {
  Eye,
  BarChart3,
  Sparkles,
  RefreshCw,
  Calculator,
  Globe2,
} from 'lucide-react';

interface CapabilityItem {
  id: string;
  category: string;
  subheading: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  iconBg: string;
  items: string[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'visibility',
    category: 'S3 VISIBILITY',
    subheading: 'Inventory & Inventory State',
    icon: Eye,
    accentColor: 'text-blue-400 group-hover:text-blue-300',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    items: ['Buckets', 'Objects', 'Storage Classes', 'Regions'],
  },
  {
    id: 'analytics',
    category: 'STORAGE ANALYTICS',
    subheading: 'Telemetry & Distribution',
    icon: BarChart3,
    accentColor: 'text-amber-400 group-hover:text-amber-300',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    items: ['Storage Distribution', 'Prefix Analysis', 'Object Metrics'],
  },
  {
    id: 'optimization',
    category: 'OPTIMIZATION',
    subheading: 'Deterministic Analysis',
    icon: Sparkles,
    accentColor: 'text-orange-400 group-hover:text-orange-300',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    items: ['Optimization Candidates', 'Storage-Class Strategies', 'Lifecycle Opportunities'],
  },
  {
    id: 'automation',
    category: 'AUTOMATION',
    subheading: 'Declarative Rule Synthesis',
    icon: RefreshCw,
    accentColor: 'text-purple-400 group-hover:text-purple-300',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    items: ['Lifecycle Policies', 'Transitions', 'Expiration'],
  },
  {
    id: 'cost',
    category: 'COST INTELLIGENCE',
    subheading: 'Financial Modeling',
    icon: Calculator,
    accentColor: 'text-emerald-400 group-hover:text-emerald-300',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    items: ['Storage Cost Estimates', 'Strategy Comparison'],
  },
  {
    id: 'infrastructure',
    category: 'REGIONAL INFRASTRUCTURE',
    subheading: 'Multi-Region Topology',
    icon: Globe2,
    accentColor: 'text-cyan-400 group-hover:text-cyan-300',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    items: ['Regions', 'Replication', 'Failover Readiness'],
  },
];

export const ProductCapabilityStrip: React.FC = () => {
  return (
    <section className="relative py-10 bg-white dark:bg-[#06090F] border-b border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Capability Strip Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="group p-4 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-white/[0.12] hover:bg-slate-900/80 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                      {cap.category}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cap.iconBg} transition-transform group-hover:scale-105`}>
                      <Icon className={`w-3.5 h-3.5 ${cap.accentColor}`} />
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-left">
                    {cap.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium group-hover:text-slate-900 dark:text-white transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ProductCapabilityStrip;
