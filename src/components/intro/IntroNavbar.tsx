import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardDrive,
  ArrowRight,
  Menu,
  X,
  Layers,
  Sparkles,
  Activity,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IntroNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAwsConnected, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#080C14]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <HardDrive className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight">
                S3 Storage Optimizer
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-semibold">
                AWS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              Storage Lens & Lifecycle Automation
            </p>
          </div>
        </Link>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <button
            onClick={(e) => scrollToSection(e, 'story')}
            className="hover:text-amber-300 transition-colors cursor-pointer"
          >
            Overview
          </button>
          <button
            onClick={(e) => scrollToSection(e, 'capabilities')}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Capabilities
          </button>
          <button
            onClick={(e) => scrollToSection(e, 'workflow')}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Workflow
          </button>
          <button
            onClick={(e) => scrollToSection(e, 'architecture')}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Architecture
          </button>
        </nav>

        {/* Right Status Badge & Console CTA */}
        <div className="flex items-center gap-3">
          {/* Live AWS Connection Badge - genuine data only, no fake metrics */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.08] text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isAwsConnected ? 'bg-emerald-400' : 'bg-slate-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAwsConnected ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {isAwsConnected ? 'AWS Connected' : 'Telemetry Standby'}
            </span>
            {isAwsConnected && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  {settings.awsRegion.split(' ')[0]}
                </span>
              </>
            )}
          </div>

          {/* Primary Explore Storage Console Button */}
          <button
            onClick={() => navigate('/dashboard')}
            id="cta-open-console-nav"
            className="btn-primary !py-2 !px-3.5 text-xs font-semibold shadow-glowSm flex items-center gap-2"
            title="Open S3 Storage Console"
          >
            <Terminal className="w-3.5 h-3.5 hidden sm:inline" />
            <span>Open Storage Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-white dark:bg-[#0B0F19]/95 backdrop-blur-2xl px-4 py-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isAwsConnected ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
              {isAwsConnected ? `AWS Connected (${settings.awsRegion.split(' ')[0]})` : 'Telemetry Standby'}
            </span>
          </div>

          <div className="space-y-1 text-sm font-medium">
            <button
              onClick={(e) => scrollToSection(e, 'story')}
              className="w-full text-left block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-white/[0.04] cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'capabilities')}
              className="w-full text-left block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-white/[0.04] cursor-pointer"
            >
              Capabilities
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'workflow')}
              className="w-full text-left block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-white/[0.04] cursor-pointer"
            >
              Workflow Pipeline
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'architecture')}
              className="w-full text-left block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-white/[0.04] cursor-pointer"
            >
              Architecture Flow
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/dashboard');
              }}
              className="w-full btn-primary !py-2.5 justify-center text-xs"
            >
              <span>Explore Storage Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default IntroNavbar;
