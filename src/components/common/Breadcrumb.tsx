import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  intro: 'System Introduction',
  dashboard: 'Dashboard',
  analytics: 'Storage Analytics',
  buckets: 'Buckets',
  optimization: 'Optimization Center',
  lifecycle: 'Lifecycle Policies',
  cost: 'Cost Analysis',
  'regional-infrastructure': 'Regional Infrastructure',
  settings: 'Settings',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-slate-800 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Storage Lens</span>
      </Link>

      {pathnames.map((path, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[path.toLowerCase()] || path;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-300 mx-1.5 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-slate-800 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
