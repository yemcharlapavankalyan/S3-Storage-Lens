import React from 'react';
import { LifecycleStage } from '../../types';
import { StorageClassBadge } from '../common/Badges';
import { ArrowDown, Clock, ShieldCheck, Trash2 } from 'lucide-react';

interface LifecycleTimelineProps {
  stages: LifecycleStage[];
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ stages }) => {
  return (
    <div className="py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((stage, idx) => {
          const isExpiration = stage.storageClass === 'EXPIRATION';
          const isFirst = idx === 0;

          return (
            <div key={idx} className="relative group">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                  isExpiration
                    ? 'border-rose-500 text-rose-500'
                    : isFirst
                    ? 'border-blue-500 text-blue-500'
                    : 'border-amber-500 text-amber-500'
                }`}
              >
                {isExpiration ? (
                  <Trash2 className="w-2.5 h-2.5" />
                ) : (
                  <Clock className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Stage Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StorageClassBadge storageClass={stage.storageClass} />
                    <span className="font-semibold text-xs text-slate-800">
                      {isFirst
                        ? 'Day 0 (Initial Ingestion)'
                        : `Day ${stage.daysAfterCreation} (${(stage.daysAfterCreation / 30).toFixed(0)} months)`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Stage {stage.order}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
