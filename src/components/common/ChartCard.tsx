import React, { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  minHeight?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  minHeight = 'min-h-[280px]',
}) => {
  return (
    <div className={`aws-card p-5 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        <div className={`w-full ${minHeight} flex flex-col justify-center`}>
          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-white/[0.07] text-xs text-slate-600 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
