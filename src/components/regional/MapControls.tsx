import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoom?: number;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  zoom = 1,
  className = '',
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-md shadow-sm ${className}`}
      role="toolbar"
      aria-label="Map navigation controls"
    >
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom In"
        className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:hover:text-white"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom Out"
        className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:hover:text-white"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-white/[0.12] mx-0.5" />

      <button
        type="button"
        onClick={onReset}
        aria-label="Reset view"
        title={`Reset View (${zoomPercent}%)`}
        className="h-7 px-2 flex items-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 hover:text-slate-950 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-slate-300 dark:hover:text-white"
      >
        <RotateCcw className="w-3 h-3 text-slate-400" />
        <span className="hidden sm:inline">Reset View</span>
        <span className="text-[10px] text-slate-500 hidden md:inline">({zoomPercent}%)</span>
      </button>
    </div>
  );
};
