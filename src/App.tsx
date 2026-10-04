import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { IntroductionPage } from './pages/IntroductionPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BucketsPage } from './pages/BucketsPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { LifecyclePage } from './pages/LifecyclePage';
import { CostPage } from './pages/CostPage';
import { RegionalInfrastructurePage } from './pages/RegionalInfrastructurePage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkflowPage } from './pages/WorkflowPage';

/**
 * We use HashRouter here so that static previews, file:// URLs,
 * and client-side routing on local servers reload seamlessly without 404s.
 */
export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Landing / Introduction entry points */}
          <Route path="/" element={<IntroductionPage />} />
          <Route path="/intro" element={<IntroductionPage />} />

          {/* Console Dashboard & Management Modules */}
          <Route element={<MainLayout />}>
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="buckets" element={<BucketsPage />} />
            <Route path="optimization" element={<OptimizationPage />} />
            <Route path="lifecycle" element={<LifecyclePage />} />
            <Route path="cost" element={<CostPage />} />
            <Route path="regional-infrastructure" element={<RegionalInfrastructurePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
