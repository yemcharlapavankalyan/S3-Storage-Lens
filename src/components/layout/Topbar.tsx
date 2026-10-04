import React, { useState } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  X,
  Compass,
} from 'lucide-react';
import { Breadcrumb } from '../common/Breadcrumb';
import { useApp } from '../../context/AppContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    isRefreshing,
    triggerRefresh,
    lastRefreshed,
    globalSearch,
    setGlobalSearch,
    addToast,
    settings,
    isDark,
    toggleTheme,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const formatLastSync = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };



  return (
    <header className="h-16 bg-white/90 dark:bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <Breadcrumb />
        </div>
      </div>

      {/* Middle: Modern Quick Search with ⌘K */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search S3 buckets, prefixes, storage classes..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14] focus:border-amber-500/50 rounded-lg outline-none focus:ring-1 focus:ring-amber-500/40 transition-all placeholder:text-slate-500"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/[0.06] border border-slate-300 dark:border-white/[0.08] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions: Live radar, Sync, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live AWS radar status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{settings.awsRegion} • Live AWS</span>
        </div>

        {/* Sync status & Refresh button */}
        <button
          onClick={triggerRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/[0.08] transition-colors relative"
          title={`Refresh AWS-backed views · Last requested ${formatLastSync(lastRefreshed)}`}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500 dark:text-amber-400' : ''}`}
          />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/[0.08] transition-colors relative"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsUserMenuOpen(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] dark:border-white/[0.08] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />

          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl py-2 z-50 backdrop-blur-2xl">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white font-display">
                  Storage Lens System Events
                </span>

              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
                <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                  No notification feed is connected. System events are not generated by this interface.
                </div>
              </div>

              <div className="px-4 py-2 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/20 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Storage Lens availability is reported from AWS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-amber-500/40 transition-all"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
              PK
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl py-2 z-50 backdrop-blur-2xl">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.08]">
                <p className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  Pavan Kalyan
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Local application session
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                    Cloud Architect
                  </span>
                </div>
              </div>

              <div className="py-1">
                <a
                  href="#/workflow"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Reviewer Workflow Demo
                </a>
                <a
                  href="#/intro"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  System Introduction
                </a>
                <a
                  href="#/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  API & Connection Settings
                </a>
                <a
                  href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    AWS Storage Lens Docs
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="border-t border-slate-200 dark:border-white/[0.08] pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    addToast('Session status', 'This interface does not provide user authentication.', 'info');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  Authentication: Not configured
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
