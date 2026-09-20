import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { TaskItem, TaskPriority } from '../../types';
import { X, CheckCircle2, Clock, Calendar, Trash2, Edit3, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (task: TaskItem) => void;
  onReschedule: (taskId: string, newDate: string, newTime?: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onReschedule,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customDate, setCustomDate] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  if (!isOpen || !task) return null;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="amber">High Priority</Badge>;
      case 'medium':
        return <Badge variant="purple">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="neutral">Low Priority</Badge>;
    }
  };

  const handleQuickReschedule = (daysToAdd: number) => {
    const targetDate = format(addDays(new Date(), daysToAdd), 'yyyy-MM-dd');
    onReschedule(task.id, targetDate, task.dueTime);
    setIsRescheduling(false);
  };

  const handleCustomRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    onReschedule(task.id, customDate, customTime || task.dueTime);
    setIsRescheduling(false);
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              {getPriorityBadge(task.priority)}
              <Badge variant="neutral" style={{ textTransform: 'capitalize' }}>
                {task.category}
              </Badge>
              <Badge variant={task.status === 'completed' ? 'emerald' : task.status === 'in_progress' ? 'purple' : 'neutral'}>
                {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
              </Badge>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
              {task.title}
            </h3>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {task.description && (
            <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary-500)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {task.description}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--primary-400)" />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Due Date</div>
                <div style={{ fontWeight: 600 }}>{task.dueDate}</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary-400)" />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Due Time & Est</div>
                <div style={{ fontWeight: 600 }}>
                  {task.dueTime || 'Anytime'} ({task.estimatedMinutes || 30}m)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reschedule Accordion */}
          {isRescheduling ? (
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid var(--border-emerald)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary-400)' }}>
                Reschedule Task
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => handleQuickReschedule(0)}>Today</Button>
                <Button size="sm" variant="ghost" onClick={() => handleQuickReschedule(1)}>Tomorrow</Button>
                <Button size="sm" variant="ghost" onClick={() => handleQuickReschedule(7)}>Next Week</Button>
              </div>

              <form onSubmit={handleCustomRescheduleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="date"
                  className="gt-input"
                  style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
                  value={customDate || task.dueDate}
                  onChange={e => setCustomDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="gt-input"
                  style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
                  value={customTime || task.dueTime || '12:00'}
                  onChange={e => setCustomTime(e.target.value)}
                />
                <Button size="sm" variant="primary" type="submit">Save</Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsRescheduling(false)}>Cancel</Button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsRescheduling(true)}
              style={{
                background: 'transparent',
                border: '1px border-dashed var(--border-emerald)',
                color: 'var(--primary-400)',
                padding: '0.5rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Calendar size={14} /> Quick Reschedule Task
            </button>
          )}

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} /> Delete this task permanently?
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button
                  size="sm"
                  style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={15} color="#ef4444" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit3 size={15} />}
              onClick={() => {
                onEdit(task);
                onClose();
              }}
            >
              Edit
            </Button>
          </div>

          <Button
            variant={task.status === 'completed' ? 'ghost' : 'primary'}
            size="sm"
            icon={task.status === 'completed' ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
            onClick={() => {
              onToggleComplete(task);
              onClose();
            }}
          >
            {task.status === 'completed' ? 'Reopen Task' : 'Mark Completed'}
          </Button>
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

        .gt-modal-card {
          width: 100%;
          max-width: 500px;
          padding: 1.75rem;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};
