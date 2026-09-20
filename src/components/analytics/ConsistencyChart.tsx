import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ChartDataPoint } from '../../services/analyticsService';
import { Calendar, TrendingUp, Sparkles } from 'lucide-react';

interface ConsistencyChartProps {
  data: ChartDataPoint[];
  timeframeDays: 7 | 30 | 90;
  onTimeframeChange: (days: 7 | 30 | 90) => void;
}

export const ConsistencyChart: React.FC<ConsistencyChartProps> = ({
  data,
  timeframeDays,
  onTimeframeChange,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Compute stats for active window
  const avgPercentage = data.length > 0
    ? Math.round(data.reduce((acc, curr) => acc + curr.percentage, 0) / data.length)
    : 0;

  return (
    <Card emeraldGlow style={{ padding: '1.5rem' }}>
      {/* Header with Timeframe Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={20} color="var(--primary-400)" />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>Consistency Trend Chart</h3>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Average Execution Rate: <strong style={{ color: 'var(--primary-300)' }}>{avgPercentage}%</strong> over past {timeframeDays} days
          </span>
        </div>

        {/* Timeframe Switcher Buttons: 7 days, 30 days, 90 days */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '3px' }}>
          <button
            className={`gt-time-btn ${timeframeDays === 7 ? 'active' : ''}`}
            onClick={() => onTimeframeChange(7)}
          >
            7 Days
          </button>
          <button
            className={`gt-time-btn ${timeframeDays === 30 ? 'active' : ''}`}
            onClick={() => onTimeframeChange(30)}
          >
            30 Days
          </button>
          <button
            className={`gt-time-btn ${timeframeDays === 90 ? 'active' : ''}`}
            onClick={() => onTimeframeChange(90)}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Hover Tooltip Box */}
      <div style={{ minHeight: '32px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
        {hoveredPoint ? (
          <div style={{ fontSize: '0.825rem', padding: '0.375rem 0.75rem', background: 'var(--primary-soft)', border: '1px solid var(--border-emerald)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <strong>{hoveredPoint.label} ({hoveredPoint.dateStr})</strong>
            <span>Completion: <strong style={{ color: 'var(--primary-400)' }}>{hoveredPoint.percentage}%</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>• {hoveredPoint.habitsDone} Habits, {hoveredPoint.tasksDone} Tasks</span>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hover or tap any bar to inspect daily completion details.
          </div>
        )}
      </div>

      {/* Minimalist Visual SVG Bar Chart */}
      <div style={{ width: '100%', height: '220px', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${Math.max(300, data.length * 20)} 200`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Background Grid Lines */}
          <line x1="0" y1="40" x2="100%" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="100%" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="160" x2="100%" y2="160" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Bars */}
          {data.map((pt, idx) => {
            const chartWidth = Math.max(300, data.length * 20);
            const step = chartWidth / data.length;
            const x = idx * step + step * 0.15;
            const barWidth = Math.max(4, step * 0.7);
            const barHeight = (pt.percentage / 100) * 160;
            const y = 180 - barHeight;

            return (
              <g
                key={pt.dateStr}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={timeframeDays === 90 ? 1 : 3}
                  fill={hoveredPoint?.dateStr === pt.dateStr ? 'var(--primary-400)' : 'url(#emeraldGradient)'}
                  opacity={hoveredPoint?.dateStr === pt.dateStr ? 1 : 0.85}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Date Label for 7 days or 30 days */}
                {(timeframeDays === 7 || (timeframeDays === 30 && idx % 5 === 0)) && (
                  <text
                    x={x + barWidth / 2}
                    y="195"
                    fill="var(--text-muted)"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-400)" />
              <stop offset="100%" stopColor="var(--primary-700)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <style>{`
        .gt-time-btn {
          padding: 0.35rem 0.85rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-time-btn:hover {
          color: #ffffff;
        }

        .gt-time-btn.active {
          background: var(--primary-soft);
          border: 1px solid var(--border-emerald);
          color: var(--primary-400);
        }
      `}</style>
    </Card>
  );
};
