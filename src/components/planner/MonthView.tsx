import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { UnifiedPlannerItem } from '../../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { Calendar as CalendarIcon, CheckSquare, Sparkles, Flame } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  itemsByDate: Record<string, UnifiedPlannerItem[]>;
  onSelectDate: (dateStr: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  itemsByDate,
  onSelectDate,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Month Summary Banner */}
      <Card emeraldGlow style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Monthly Growth Overview
            </div>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Click any date to inspect and manage scheduled events, tasks, and habits for that day.
            </p>
          </div>
        </div>
      </Card>

      {/* Month Calendar Matrix */}
      <Card style={{ padding: '1rem' }}>
        {/* Day Name Headers */}
        <div className="gt-month-headers">
          {dayNames.map(name => (
            <div key={name} className="gt-month-header-cell">
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="gt-month-grid">
          {calendarDays.map(dayObj => {
            const dateStr = format(dayObj, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(dayObj, monthStart);
            const isToday = isSameDay(dayObj, new Date());
            const dayItems = itemsByDate[dateStr] || [];

            const habitCount = dayItems.filter(i => i.type === 'habit').length;
            const taskCount = dayItems.filter(i => i.type === 'task').length;
            const eventCount = dayItems.filter(i => i.type === 'event').length;
            const completedCount = dayItems.filter(i => i.completed).length;

            return (
              <div
                key={dateStr}
                className={`gt-month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => onSelectDate(dateStr)}
              >
                {/* Date Top Row */}
                <div className="gt-day-cell-top">
                  <span className={`gt-day-number ${isToday ? 'today-badge' : ''}`}>
                    {format(dayObj, 'd')}
                  </span>
                  {dayItems.length > 0 && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: completedCount === dayItems.length ? 'var(--primary-400)' : 'var(--text-muted)' }}>
                      {completedCount}/{dayItems.length}
                    </span>
                  )}
                </div>

                {/* Day Activity Indicators */}
                <div className="gt-day-cell-content">
                  {eventCount > 0 && (
                    <div className="gt-indicator gt-ind-event">
                      <span>📅 {eventCount} Event{eventCount > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {taskCount > 0 && (
                    <div className="gt-indicator gt-ind-task">
                      <span>📝 {taskCount} Task{taskCount > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {habitCount > 0 && (
                    <div className="gt-indicator gt-ind-habit">
                      <span>🌱 {habitCount} Habit{habitCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`
        .gt-month-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.5rem;
        }

        .gt-month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .gt-month-day-cell {
          min-height: 90px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-month-day-cell:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--border-emerald);
          transform: translateY(-1px);
        }

        .gt-month-day-cell.other-month {
          opacity: 0.35;
          background: transparent;
        }

        .gt-month-day-cell.is-today {
          border: 1px solid var(--border-emerald);
          background: rgba(16, 185, 129, 0.05);
        }

        .gt-day-cell-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gt-day-number {
          font-weight: 700;
          font-size: 0.9rem;
          color: #ffffff;
        }

        .gt-day-number.today-badge {
          background: var(--primary-500);
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }

        .gt-day-cell-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .gt-indicator {
          font-size: 0.68rem;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gt-ind-event {
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.25);
        }

        .gt-ind-task {
          background: rgba(245, 158, 11, 0.15);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .gt-ind-habit {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
      `}</style>
    </div>
  );
};
