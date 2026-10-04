import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Sparkles,
  Clock,
  DollarSign,
  Settings,
  HardDrive,
  Cloud,
  ChevronRight,
  Activity,
  Globe,
  Compass,
  GitFork,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'warning' | 'info' | 'default';
}

const overviewNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Reviewer Workflow', path: '/workflow', icon: GitFork },
];
const storageNavItems: NavItem[] = [
  { name: 'Buckets', path: '/buckets', icon: Database },
  { name: 'Storage Analytics', path: '/analytics', icon: BarChart3 },
];
const optimizationNavItems: NavItem[] = [
  { name: 'Optimization', path: '/optimization', icon: Sparkles },
  { name: 'Lifecycle Policies', path: '/lifecycle', icon: Clock },
  { name: 'Cost Analysis', path: '/cost', icon: DollarSign },
];

const infrastructureNavItems: NavItem[] = [
  { name: 'Regional Infrastructure', path: '/regional-infrastructure', icon: Globe },
];

const systemNavItems: NavItem[] = [
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { isAwsConnected, settings } = useApp();

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onCloseMobile}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
            isActive
              ? 'bg-amber-50 text-amber-800 font-semibold border-l-2 border-amber-500 shadow-xs dark:bg-gradient-to-r dark:from-amber-500/15 dark:to-transparent dark:text-amber-300 dark:border-amber-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.04]'
          }`
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-slate-500 group-hover:text-amber-600 dark:text-slate-400 dark:group-hover:text-amber-400" />
          <span className="truncate">{item.name}</span>
        </div>

        {item.badge && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
              item.badgeVariant === 'warning'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                : item.badgeVariant === 'info'
                ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/[0.08]'
            }`}
          >
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#080C14] text-slate-700 dark:text-slate-300 flex flex-col h-full border-r border-slate-200 dark:border-white/[0.08] select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#0B0F19]/50">
        <Link
          to="/intro"
          className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
          title="Return to Introduction Page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <HardDrive className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-1.5">
              S3 Optimizer
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded font-semibold">
                Lens
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px] font-sans">
              Storage Optimization
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Overview</div>
        {overviewNavItems.map(renderNavLink)}

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Storage</div>
        {storageNavItems.map(renderNavLink)}

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Optimization</div>
        {optimizationNavItems.map(renderNavLink)}

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          INFRASTRUCTURE
        </div>
        {infrastructureNavItems.map(renderNavLink)}

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Management
        </div>
        {systemNavItems.map(renderNavLink)}
      </div>

      {/* Bottom Status & Project Info */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#0B0F19]/40 space-y-2.5">
        {/* Storage Lens Health Gauge */}
        <div className="p-2.5 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-[11px] shadow-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Storage Lens Metrics
            </span>
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">Pending</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 truncate">
              AWS-published metrics are shown in Storage Analytics
          </p>
        </div>

        {/* AWS Connection Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] text-xs shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              {isAwsConnected && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="truncate">
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {isAwsConnected ? 'AWS Connected (Live)' : 'Disconnected'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {isAwsConnected ? settings.awsRegion : 'AWS connection unavailable'}
              </p>
            </div>
          </div>
          <Cloud className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
        </div>

        {/* User Profile Mini Section */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/20">
              PK
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate font-display">
                Pavan Kalyan
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                Cloud Architect
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
