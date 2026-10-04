import React from 'react';

interface ReplicationLinkProps {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'Replication' | 'Failover path';
  label?: string;
  isHighlighted?: boolean;
}

export const ReplicationLink: React.FC<ReplicationLinkProps> = ({
  id,
  startX,
  startY,
  endX,
  endY,
  type,
  label,
  isHighlighted = false,
}) => {
  // Calculate curved path (quadratic bezier curve)
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Offset control point upwards (lower y) to simulate geodesic/orbital network link
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const arcHeight = Math.min(Math.max(dist * 0.2, 24), 85);
  const ctrlX = midX;
  const ctrlY = midY - arcHeight;

  const pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
  const isReplication = type === 'Replication';

  const strokeColor = isReplication
    ? isHighlighted ? '#93C5FD' : '#3B82F6'
    : isHighlighted ? '#FCD34D' : '#F59E0B';

  const strokeWidth = isHighlighted ? 2.5 : isReplication ? 1.8 : 1.5;

  return (
    <g className="replication-link group select-none pointer-events-none" id={`link-${id}`}>
      {/* Background glow path */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth + 3}
        strokeOpacity={isHighlighted ? 0.35 : 0.12}
        strokeLinecap="round"
      />

      {/* Main Connection Path */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isReplication ? undefined : '5 4'}
        strokeOpacity={isHighlighted ? 1 : 0.85}
        strokeLinecap="round"
      />

      {/* Active Replication Animated Pulse (respects prefers-reduced-motion) */}
      {isReplication && (
        <circle r={2.5} fill="#93C5FD" className="replication-pulse">
          <animateMotion
            path={pathData}
            dur="4s"
            repeatCount="indefinite"
            keyPoints="0;1"
            keyTimes="0;1"
          />
        </circle>
      )}

      {/* Subtle direction indicator arrow / dot at midpoint */}
      <circle
        cx={midX}
        cy={midY - arcHeight * 0.5}
        r={isReplication ? 2 : 1.8}
        fill={strokeColor}
        fillOpacity={0.9}
      />

      {label && (
        <title>{label} ({type})</title>
      )}
    </g>
  );
};
