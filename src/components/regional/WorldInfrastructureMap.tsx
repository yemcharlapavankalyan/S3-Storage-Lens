import React, { useState, useRef, useMemo, useCallback } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import worldDataRaw from 'world-atlas/countries-110m.json';
import { RegionInfrastructure, ReplicationConnection } from '../../types/regional';
import { RegionMarker } from './RegionMarker';
import { ReplicationLink } from './ReplicationLink';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { Activity, ShieldCheck } from 'lucide-react';

interface WorldInfrastructureMapProps {
  regions: RegionInfrastructure[];
  connections: ReplicationConnection[];
  selectedRegionId?: string | null;
  onSelectRegion?: (region: RegionInfrastructure) => void;
  isCompact?: boolean;
  className?: string;
}

export const WorldInfrastructureMap: React.FC<WorldInfrastructureMapProps> = ({
  regions,
  connections,
  selectedRegionId,
  onSelectRegion,
  isCompact = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG Base Dimensions
  const baseWidth = 960;
  const baseHeight = 500;

  // Zoom and Pan States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Memoize Map Projection & TopoJSON features
  const { countriesGeoJson, bordersMesh, graticuleLines, projection } = useMemo(() => {
    const proj = geoNaturalEarth1()
      .scale(153)
      .translate([baseWidth / 2, baseHeight / 2]);

    const worldAtlas = worldDataRaw as any;
    const countries = feature(worldAtlas, worldAtlas.objects.countries);
    const borders = mesh(worldAtlas, worldAtlas.objects.countries, (a: any, b: any) => a !== b);
    const graticule = geoGraticule().step([30, 30])();

    return {
      projection: proj,
      countriesGeoJson: countries,
      bordersMesh: borders,
      graticuleLines: graticule,
    };
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath(projection);
  }, [projection]);

  // Project Region Coordinates
  const projectedRegions = useMemo(() => {
    return regions.flatMap((region) => {
      if (!region.coordinates) return [];
      const coords = projection(region.coordinates);
      if (!coords) return [];
      return {
        ...region,
        projectedX: coords[0],
        projectedY: coords[1],
      };
    });
  }, [regions, projection]);

  // Project Connections
  const projectedConnections = useMemo(() => {
    return connections.map((conn) => {
      const sourceRegion = projectedRegions.find((r) => r.id === conn.sourceId);
      const targetRegion = projectedRegions.find((r) => r.id === conn.targetId);

      const start = sourceRegion
        ? [sourceRegion.projectedX, sourceRegion.projectedY]
        : projection(conn.sourceCoordinates) || [0, 0];

      const end = targetRegion
        ? [targetRegion.projectedX, targetRegion.projectedY]
        : projection(conn.targetCoordinates) || [0, 0];

      return {
        ...conn,
        startX: start[0],
        startY: start[1],
        endX: end[0],
        endY: end[1],
      };
    });
  }, [connections, projectedRegions, projection]);

  // Zoom Handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.3, 3.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.3, 0.8));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan Handlers via Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if primary click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.8), 3.5));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100 select-none shadow-sm transition-all dark:border-slate-700 dark:bg-slate-950 ${
        isCompact ? 'h-[360px]' : 'h-[540px] xl:h-[600px]'
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      aria-label="World S3 Infrastructure Map"
    >
      {/* Subtle Radar/Grid background ambiance */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Left: Infrastructure Overlay Header */}
      <div className="absolute top-3.5 left-4 z-10 pointer-events-none flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-200 tracking-wide uppercase">
            Discovered S3 bucket regions
          </span>
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.04] rounded border border-slate-200 dark:border-white/[0.06]">
            {regions.length} observed
          </span>
        </div>
      </div>

      {/* Top Right: Zoom and Pan Controls */}
      <div className="absolute top-3.5 right-4 z-10">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          zoom={zoom}
        />
      </div>

      {/* Bottom Left: Map Legend */}
      <div className="absolute bottom-3.5 left-4 z-10 max-w-[calc(100%-2rem)]">
          <MapLegend replicationPaths={connections.length} />
      </div>

      {/* Bottom Right: Active Telemetry Info */}
      <div className="absolute bottom-3.5 right-4 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-md text-[10px] font-mono text-slate-600 dark:text-slate-400">
        <Activity className="w-3 h-3 text-emerald-400" />
        <span>Bucket inventory: current</span>
        <span className="text-slate-600">|</span>
        <ShieldCheck className="w-3 h-3 text-blue-400" />
        <span>{connections.length} verified replication paths</span>
      </div>

      {/* Main SVG Visualization */}
      <svg
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Subtle Radial Glow in Center */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--map-glow-center)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--map-glow-edge)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Backdrop Sphere / Ocean Fill */}
        <rect width={baseWidth} height={baseHeight} fill="url(#mapGlow)" />

        {/* Dynamic Zoom & Pan Container */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: `${baseWidth / 2}px ${baseHeight / 2}px`,
            transition: isDragging ? 'none' : 'transform 150ms ease-out',
          }}
        >
          {/* Geographic Graticule (Lat/Long technical lines) */}
          <path
            d={pathGenerator(graticuleLines) || ''}
            fill="none"
            stroke="rgba(255, 255, 255, 0.035)"
            strokeWidth="0.6"
            strokeDasharray="2 3"
          />

          {/* Continents / Landmass Polygons */}
          <g className="continents">
            {(countriesGeoJson as any).features.map((featureItem: any, index: number) => {
              const d = pathGenerator(featureItem);
              if (!d) return null;
              return (
                <path
                  key={`country-${index}`}
                  d={d}
                  fill="#111827"
                  stroke="#1E293B"
                  strokeWidth="0.5"
                  className="transition-colors hover:fill-[#141E33]"
                />
              );
            })}
          </g>

          {/* Country Boundaries Mesh */}
          <path
            d={pathGenerator(bordersMesh as any) || ''}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.45"
            strokeLinejoin="round"
          />

          {/* Minimal Oceanic / Geographic Technical Labels */}
          <g
            className="ocean-labels pointer-events-none select-none"
            fill="rgba(148, 163, 184, 0.18)"
            fontSize="7"
            fontFamily='"JetBrains Mono", monospace'
            letterSpacing="0.25em"
            fontWeight="500"
          >
            <text x="180" y="280">PACIFIC OCEAN</text>
            <text x="430" y="240">ATLANTIC OCEAN</text>
            <text x="660" y="360">INDIAN OCEAN</text>
          </g>

          {/* Infrastructure Replication & Failover Connection Links */}
          <g className="replication-links">
            {projectedConnections.map((conn) => {
              const isConnHighlighted =
                selectedRegionId === conn.sourceId || selectedRegionId === conn.targetId;

              return (
                <ReplicationLink
                  key={conn.id}
                  id={conn.id}
                  startX={conn.startX}
                  startY={conn.startY}
                  endX={conn.endX}
                  endY={conn.endY}
                  type={conn.type}
                  label={conn.label}
                  isHighlighted={isConnHighlighted}
                />
              );
            })}
          </g>

          {/* AWS Regional Infrastructure Markers */}
          <g className="region-markers">
            {projectedRegions.map((region) => {
              const isSelected = selectedRegionId === region.id;
              return (
                <RegionMarker
                  key={region.id}
                  region={region}
                  x={region.projectedX}
                  y={region.projectedY}
                  isSelected={isSelected}
                  onSelect={(reg) => onSelectRegion?.(reg)}
                  compact={isCompact}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
};
