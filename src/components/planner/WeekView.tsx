import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Checkbox } from '../common/Input';
import { UnifiedPlannerItem } from '../../types';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  itemsByDate: Record<string, UnifiedPlannerItem[]>;
  onSelectDate: (dateStr: string) => void;
  onToggleComplete: (item: UnifiedPlannerItem) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  itemsByDate,
  onSelectDate,
  onToggleComplete,
}) => {
  // Compute Monday through Sunday for current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 1 = Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Compute total weekly stats
  let totalWeeklyItems = 0;
  let totalWeeklyCompleted = 0;

  weekDays.forEach(d => {
    const dStr = format(d, 'yyyy-MM-dd');
    const dayItems = itemsByDate[dStr] || [];
    totalWeeklyItems += dayItems.length;
    totalWeeklyCompleted += dayItems.filter(i => i.completed).length;
  });

  const overallWeekPct = totalWeeklyItems > 0 ? Math.round((totalWeeklyCompleted / totalWeeklyItems) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Week Summary Banner */}
      <Card emeraldGlow style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Focus Matrix
            </div>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.25rem' }}>
              {totalWeeklyCompleted} of {totalWeeklyItems} Commitments Accomplished This Week
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Monday {format(weekStart, 'MMM d')} – Sunday {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: `conic-gradient(var(--primary-500) ${overallWeekPct}%, rgba(255,255,255,0.1) 0%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>
                {overallWeekPct}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 7-Day Columns Grid */}
      <div className="gt-week-grid">
        {weekDays.map(dayObj => {
          const dateStr = format(dayObj, 'yyyy-MM-dd');
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          const dayItems = itemsByDate[dateStr] || [];
          const dayCompleted = dayItems.filter(i => i.completed).length;
          const dayPct = dayItems.length > 0 ? Math.round((dayCompleted / dayItems.length) * 100) : 0;

          return (
            <div
              key={dateStr}
              className={`gt-week-day-col ${isToday ? 'is-today' : ''}`}
            >
              {/* Day Header */}
              <div
                className="gt-week-day-header"
                onClick={() => onSelectDate(dateStr)}
                title="Click to view detailed day timeline"
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: isToday ? 'var(--primary-400)' : 'var(--text-secondary)' }}>
                    {format(dayObj, 'EEEE')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    {format(dayObj, 'MMM d')}
                  </div>
                </div>

                <Badge variant={dayPct === 100 && dayItems.length > 0 ? 'emerald' : isToday ? 'cyan' : 'neutral'} style={{ fontSize: '0.7rem' }}>
                  {dayCompleted}/{dayItems.length} ({dayPct}%)
                </Badge>
              </div>

              {/* Items List */}
              <div className="gt-week-day-body">
                {dayItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No events scheduled
                  </div>
                ) : (
                  dayItems.map(item => {
                    const isDone = item.completed;
                    return (
                      <div
                        key={item.id}
                        className={`gt-week-item ${isDone ? 'done' : ''}`}
                      >
                        <Checkbox
                          checked={isDone}
                          onChange={() => onToggleComplete(item)}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#ffffff', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>{item.type.toUpperCase()}</span> • <span>{item.startTime || 'All day'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .gt-week-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 1200px) {
          .gt-week-grid {
            grid-template-columns: repeat(7, 1fr);
          }
        }

        .gt-week-day-col {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .gt-week-day-col:hover {
          border-color: var(--border-emerald);
        }

        .gt-week-day-col.is-today {
          border: 1px solid var(--border-emerald);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
        }

        .gt-week-day-header {
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .gt-week-day-header:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .gt-week-day-body {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          max-height: 420px;
          overflow-y: auto;
        }

        .gt-week-item {
          padding: 0.5rem 0.625rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.15s ease;
        }

        .gt-week-item.done {
          opacity: 0.6;
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  );
};
