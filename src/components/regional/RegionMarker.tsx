import React from 'react';
import { RegionInfrastructure } from '../../types/regional';

interface RegionMarkerProps {
  region: RegionInfrastructure;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: (region: RegionInfrastructure) => void;
  compact?: boolean;
}

export const RegionMarker: React.FC<RegionMarkerProps> = ({
  region,
  x,
  y,
  isSelected,
  onSelect,
  compact = false,
}) => {
  const isPrimary = region.role === 'Primary';
  const isCandidate = region.role === 'Failover Candidate';
  const isSecondary = region.role === 'Secondary' || region.role === 'Observed';
  const isHealthy = region.status === 'Healthy' || region.status === 'Ready';

  // Position label to avoid overlaps: California (left/top-right), Hyderabad (top-right), Singapore (bottom-right)
  const isSingapore = region.id === 'ap-southeast-1';
  const labelOffsetX = 16;
  const labelOffsetY = isSingapore ? 12 : -28;

  return (
    <g
      id={`marker-${region.id}`}
      tabIndex={0}
      role="button"
      aria-label={`Region ${region.name} (${region.awsRegion}), Role: ${region.role}, Status: ${region.status}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(region);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onSelect(region);
        }
      }}
      className="cursor-pointer focus:outline-none group select-none transition-transform"
      transform={`translate(${x}, ${y})`}
    >
      {/* Selection Halo */}
      {isSelected && (
        <>
          <circle
            r={isPrimary ? 18 : 15}
            fill="none"
            stroke="#FF9900"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            className="animate-pulse"
          />
          <circle
            r={isPrimary ? 22 : 19}
            fill="none"
            stroke="#FF9900"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="3 3"
          />
        </>
      )}

      {/* Target Crosshair on Selected */}
      {isSelected && (
        <g stroke="#FF9900" strokeWidth="1" strokeOpacity="0.6">
          <line x1="-8" y1="0" x2="-4" y2="0" />
          <line x1="4" y1="0" x2="8" y2="0" />
          <line x1="0" y1="-8" x2="0" y2="-4" />
          <line x1="0" y1="4" x2="0" y2="8" />
        </g>
      )}

      {/* Primary Region Marker: High emphasis, solid marker, stronger visual weight */}
      {isPrimary && (
        <g>
          {/* Subtle outer ping ring */}
          <circle
            r="12"
            fill="#10B981"
            fillOpacity="0.12"
            stroke="#10B981"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Solid marker center */}
          <circle
            r="6"
            fill="#10B981"
            stroke="#080C14"
            strokeWidth="1.5"
          />
          {/* Status pip */}
          <circle
            r="2"
            fill="#FFFFFF"
          />
        </g>
      )}

      {/* Secondary Region Marker: Normal marker, slightly lower emphasis */}
      {isSecondary && (
        <g>
          <circle
            r="9"
            fill="#3B82F6"
            fillOpacity="0.1"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <circle
            r="4.5"
            fill="#E2E8F0"
            stroke="#1E293B"
            strokeWidth="1.5"
          />
          <circle
            r="1.5"
            fill="#3B82F6"
          />
        </g>
      )}

      {/* Failover Candidate Marker: Outlined/dashed marker, candidate indicator */}
      {isCandidate && (
        <g>
          <circle
            r="10"
            fill="#F59E0B"
            fillOpacity="0.08"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeDasharray="2.5 2"
          />
          <circle
            r="4.5"
            fill="#1E293B"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="2 1.5"
          />
          <circle
            r="1.5"
            fill="#F59E0B"
          />
        </g>
      )}

      {/* Hover hit target */}
      <circle r="16" fill="transparent" />

      {/* Technical Label Tag */}
      {!compact && (
        <g
          transform={`translate(${labelOffsetX}, ${labelOffsetY})`}
          className="pointer-events-none"
        >
          {/* Connecting leader line */}
          <path
            d={isSingapore ? 'M 0 0 L -8 -6' : 'M 0 16 L -8 22'}
            stroke={isSelected ? '#FF9900' : 'rgba(255,255,255,0.2)'}
            strokeWidth="1"
            fill="none"
          />

          {/* Badge background */}
          <rect
            x="0"
            y="0"
            width={isPrimary ? 134 : isCandidate ? 144 : 126}
            height="34"
            rx="5"
            fill={isSelected ? '#0F1626' : '#0B0F19'}
            fillOpacity="0.94"
            stroke={
              isSelected
                ? '#FF9900'
                : isPrimary
                ? 'rgba(16, 185, 129, 0.4)'
                : isCandidate
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(255, 255, 255, 0.15)'
            }
            strokeWidth={isSelected ? '1.5' : '1'}
          />

          {/* Status Indicator Dot */}
          <circle
            cx="9"
            cy="11"
            r="3"
            fill={isHealthy ? '#10B981' : '#F59E0B'}
          />

          {/* Region Name */}
          <text
            x="17"
            y="14"
            fill="#FFFFFF"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            letterSpacing="-0.01em"
          >
            {region.name}
          </text>

          {/* AWS Region Code */}
          <text
            x="9"
            y="26"
            fill="#94A3B8"
            fontSize="8.5"
            fontFamily='"JetBrains Mono", monospace'
            letterSpacing="0.02em"
          >
            {region.awsRegion}
          </text>

          {/* Role Pill */}
          <text
            x={isPrimary ? 124 : isCandidate ? 134 : 116}
            y="26"
            textAnchor="end"
            fill={isPrimary ? '#34D399' : isCandidate ? '#FBBF24' : '#94A3B8'}
            fontSize="8"
            fontWeight="600"
            fontFamily='"JetBrains Mono", monospace'
          >
            {isPrimary ? 'PRIMARY' : isCandidate ? 'CANDIDATE' : region.role === 'Observed' ? 'OBSERVED' : 'SECONDARY'}
          </text>
        </g>
      )}
    </g>
  );
};
