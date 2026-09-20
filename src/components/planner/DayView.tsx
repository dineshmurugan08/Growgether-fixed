import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Input';
import { UnifiedPlannerItem } from '../../types';
import { Clock, BookOpen, User, CheckSquare, Sparkles, Calendar, Trash2, Edit3, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface DayViewProps {
  dateStr: string;
  items: UnifiedPlannerItem[];
  onToggleComplete: (item: UnifiedPlannerItem) => void;
  onEditBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const DayView: React.FC<DayViewProps> = ({
  dateStr,
  items,
  onToggleComplete,
  onEditBlock,
  onDeleteBlock,
}) => {
  const getItemBadge = (item: UnifiedPlannerItem) => {
    if (item.type === 'habit') {
      return <Badge variant="emerald" icon={<Sparkles size={11} />}>Habit ({item.streakCount || 0}d streak)</Badge>;
    }
    if (item.type === 'task') {
      return <Badge variant={item.priority === 'high' ? 'amber' : 'purple'} icon={<CheckSquare size={11} />}>Task ({item.priority || 'Medium'})</Badge>;
    }

    switch (item.category) {
      case 'study':
        return <Badge variant="purple" icon={<BookOpen size={11} />}>Study Session</Badge>;
      case 'personal':
        return <Badge variant="cyan" icon={<User size={11} />}>Personal Activity</Badge>;
      case 'work':
        return <Badge variant="amber" icon={<Sparkles size={11} />}>Work / Deep Focus</Badge>;
      default:
        return <Badge variant="emerald" icon={<Calendar size={11} />}>Event</Badge>;
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Day Overview Summary */}
      <Card emeraldGlow style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Day Focus Timeline
            </div>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.25rem' }}>
              {completedCount} of {totalCount} Time Blocks Completed
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `conic-gradient(var(--primary-500) ${progressPct}%, rgba(255,255,255,0.1) 0%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
                {progressPct}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Hourly Timeline Grid */}
      <Card style={{ padding: '1.25rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Calendar size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No events or tasks for this day</h4>
            <p style={{ fontSize: '0.875rem' }}>Use the "+ Schedule Event" button to add a study session, personal activity, or focus block.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {HOURS.map(hour => {
              const hourItems = items.filter(item => {
                const startTime = item.startTime || '09:00';
                const itemHour = startTime.substring(0, 2);
                const currentHour = hour.substring(0, 2);
                return itemHour === currentHour;
              });

              if (hourItems.length === 0) return null;

              return (
                <div key={hour} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Time Stamp Column */}
                  <div style={{ width: '60px', flexShrink: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                    {hour}
                  </div>

                  {/* Items Stack for this Hour */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {hourItems.map(item => {
                      const isDone = item.completed;
                      const borderLeftColor =
                        item.type === 'habit' ? 'var(--primary-500)' :
                        item.type === 'task' ? '#f59e0b' :
                        item.category === 'study' ? '#a855f7' :
                        item.category === 'personal' ? '#06b6d4' : 'var(--primary-400)';

                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '0.875rem 1rem',
                            background: isDone ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                            border: isDone ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)',
                            borderLeft: `4px solid ${borderLeftColor}`,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.875rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <Checkbox
                              checked={isDone}
                              onChange={() => onToggleComplete(item)}
                            />

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                                  {item.title}
                                </span>
                                {getItemBadge(item)}
                              </div>

                              {item.description && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                  {item.description}
                                </p>
                              )}

                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Clock size={12} /> {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}
                              </div>
                            </div>
                          </div>

                          {/* Options for Custom Events */}
                          {item.type === 'event' && onDeleteBlock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 size={14} color="#ef4444" />}
                              onClick={() => onDeleteBlock(item.originalId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Unscheduled / Any Time Items */}
            {(() => {
              const unscheduled = items.filter(item => {
                const startTime = item.startTime || '00:00';
                const hourNum = parseInt(startTime.substring(0, 2), 10);
                return hourNum < 6 || hourNum > 22;
              });

              if (unscheduled.length === 0) return null;

              return (
                <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Anytime / Additional Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {unscheduled.map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Checkbox
                            checked={item.completed}
                            onChange={() => onToggleComplete(item)}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff', textDecoration: item.completed ? 'line-through' : 'none' }}>
                            {item.title}
                          </span>
                          {getItemBadge(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Card>
    </div>
  );
};
