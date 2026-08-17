import React from 'react';

export default function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  sparklineData = [12, 18, 15, 25, 22, 32, 28, 40],
  color = '#6366f1',
  changeType = 'positive',
}) {
  const isPositive = changeType === 'positive';
  const isNeutral = changeType === 'neutral';
  const trendColor = isPositive ? '#34d399' : isNeutral ? 'var(--text-secondary)' : '#fb7185';

  // Generate SVG sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData) || 1;
  const width = 100;
  const height = 32;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: gradient || 'var(--accent-gradient)',
          opacity: 0.15,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
            {label}
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: gradient || 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${color}40`,
            flexShrink: 0,
          }}
        >
          <span className="ms20" style={{ color: '#ffffff' }}>
            {icon}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: trendColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="ms14">{isPositive ? 'trending_up' : 'trending_flat'}</span>
              <span>{sub}</span>
            </div>
          )}
        </div>

        {/* Mini SVG Sparkline */}
        <div style={{ width: 85, height: 28, flexShrink: 0 }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
