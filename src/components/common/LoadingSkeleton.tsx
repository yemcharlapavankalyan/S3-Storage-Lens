import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 4,
  height = 'h-8',
}) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`bg-slate-100 rounded-md ${height} w-full`}></div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="aws-card p-5 animate-pulse space-y-3">
      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
      <div className="h-7 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 rounded w-3/4"></div>
    </div>
  );
};
