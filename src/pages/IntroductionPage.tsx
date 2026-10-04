import React, { useEffect } from 'react';
import { IntroNavbar } from '../components/intro/IntroNavbar';
import { HeroSection } from '../components/intro/HeroSection';
import { ProductCapabilityStrip } from '../components/intro/ProductCapabilityStrip';
import { ProductStorySection } from '../components/intro/ProductStorySection';
import { CoreWorkflowSection } from '../components/intro/CoreWorkflowSection';
import { ArchitecturePipeline } from '../components/intro/ArchitecturePipeline';
import { FeatureTeasers } from '../components/intro/FeatureTeasers';
import { FinalCtaSection } from '../components/intro/FinalCtaSection';
import { IntroFooter } from '../components/intro/IntroFooter';

export const IntroductionPage: React.FC = () => {
  useEffect(() => {
    document.title = 'S3 Storage Optimizer | Amazon S3 Storage Lens & Lifecycle Optimization';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="intro-page min-h-screen flex flex-col selection:bg-amber-500/25">
      {/* 10. Minimal Landing Navigation */}
      <IntroNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. First Screen / Atmospheric Hero */}
        <HeroSection />

        {/* 3. Product Capability Strip (Actual Capabilities, Zero Fake Statistics) */}
        <ProductCapabilityStrip />

        {/* 4. Product Story: Storage grows faster than visibility */}
        <ProductStorySection />

        {/* 5. Core Workflow: STORE -> MONITOR -> ANALYZE -> OPTIMIZE -> AUTOMATE (Continuous Flow) */}
        <CoreWorkflowSection />

        {/* 6. Architecture: From storage data to storage decisions (7-Stage Connected Chain) */}
        <ArchitecturePipeline />

        {/* 7. Feature Exploration: 6 Real Built-In Capabilities */}
        <FeatureTeasers />

        {/* 9. Final CTA: See your storage clearly */}
        <FinalCtaSection />
      </main>

      {/* Technical Footer */}
      <IntroFooter />
    </div>
  );
};

export default IntroductionPage;
