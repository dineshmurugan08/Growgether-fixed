import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Habit, HabitStats } from '../../types';
import { habitsService } from '../../services/habitsService';
import { X, Flame, Trophy, Calendar, Edit3, Trash2, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface HabitDetailModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onToggleComplete: (habitId: string) => void;
  onToggleSkip: (habitId: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  isOpen,
  habit,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSkip,
}) => {
  if (!isOpen || !habit) return null;

  const stats: HabitStats = habitsService.getHabitStats(habit.userId, habit.id);
  const logs = habitsService.getAllLogs(habit.userId).filter(l => l.habitId === habit.id);
  const completedDatesSet = new Set(logs.filter(l => l.status === 'completed').map(l => l.completedDate));
  const skippedDatesSet = new Set(logs.filter(l => l.status === 'skipped').map(l => l.completedDate));

  // Generate 28-day history grid items
  const historyGrid = Array.from({ length: 28 }).map((_, i) => {
    const d = subDays(new Date(), 27 - i);
    const dStr = format(d, 'yyyy-MM-dd');
    const isCompleted = completedDatesSet.has(dStr);
    const isSkipped = skippedDatesSet.has(dStr);
    const dayNum = format(d, 'd');
    const dayName = format(d, 'EEE');

    let bg = 'rgba(255, 255, 255, 0.03)';
    let borderColor = 'var(--border-subtle)';
    let textColor = 'var(--text-muted)';
    let statusText = 'Not logged';

    if (isCompleted) {
      bg = 'var(--primary-soft)';
      borderColor = 'var(--border-emerald)';
      textColor = 'var(--primary-300)';
      statusText = 'Completed ✓';
    } else if (isSkipped) {
      bg = 'var(--amber-soft)';
      borderColor = 'rgba(245, 158, 11, 0.3)';
      textColor = '#fcd34d';
      statusText = 'Skipped ⏭';
    }

    const titleHover = format(d, 'MMM d, yyyy') + ': ' + statusText;

    return (
      <div
        key={dStr}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.35rem 0.25rem',
          borderRadius: '8px',
          backgroundColor: bg,
          border: '1px solid ' + borderColor,
          color: textColor,
          fontSize: '0.7rem',
          fontWeight: 600,
        }}
        title={titleHover}
      >
        <span style={{ fontSize: '0.625rem', opacity: 0.7 }}>{dayName}</span>
        <span>{dayNum}</span>
      </div>
    );
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${habit.title}"? This cannot be undone.`)) {
      onDelete(habit.id);
      onClose();
    }
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-detail-modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <Badge variant="emerald">{habit.category.toUpperCase()}</Badge>
              <Badge variant="cyan">{habit.frequency.toUpperCase()}</Badge>
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>{habit.title}</h2>
            {habit.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {habit.description}
              </p>
            )}
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Action Toggle Bar */}
        <div className="gt-detail-action-bar">
          <Button
            variant={stats.completedToday ? 'soft' : 'primary'}
            style={{ flex: 1 }}
            icon={<CheckCircle2 size={16} />}
            onClick={() => onToggleComplete(habit.id)}
          >
            {stats.completedToday ? 'Completed Today ✓' : 'Mark Complete'}
          </Button>

          <Button
            variant={stats.skippedToday ? 'secondary' : 'ghost'}
            style={{ flex: 1 }}
            icon={<RotateCcw size={16} />}
            onClick={() => onToggleSkip(habit.id)}
          >
            {stats.skippedToday ? 'Skipped Today ⏭' : 'Skip Today'}
          </Button>
        </div>

        {/* Key Stats Row */}
        <div className="gt-detail-stats-grid">
          <div className="gt-detail-stat-box">
            <Flame size={20} color="var(--amber-gold)" />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{stats.currentStreak} Days</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Current Streak</div>
            </div>
          </div>

          <div className="gt-detail-stat-box">
            <Trophy size={20} color="var(--primary-400)" />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{stats.bestStreak} Days</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Best Streak</div>
            </div>
          </div>

          <div className="gt-detail-stat-box">
            <ShieldCheck size={20} color="var(--cyan-teal)" />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{stats.completionRate}%</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>30-Day Rate</div>
            </div>
          </div>
        </div>

        {/* 28-Day Consistency Calendar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              28-Day Consistency History
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {stats.totalCompleted} Completed • {stats.totalSkipped} Skipped
            </span>
          </div>

          <div className="gt-history-grid">
            {historyGrid}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="ghost" icon={<Trash2 size={15} color="var(--rose-pink)" />} onClick={handleDelete}>
            Delete Habit
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={<Edit3 size={15} />} onClick={() => { onEdit(habit); onClose(); }}>
              Edit Habit
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        .gt-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .gt-detail-modal-card {
          width: 100%;
          max-width: 540px;
          padding: 1.75rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .gt-detail-action-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .gt-detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .gt-detail-stat-box {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .gt-history-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
