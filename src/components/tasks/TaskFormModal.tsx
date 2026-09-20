import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextField } from '../common/Input';
import { TaskItem, TaskPriority, TaskCategory } from '../../types';
import { CreateTaskInput } from '../../services/tasksService';
import { X, CheckSquare, Calendar, Clock, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => void;
  editingTask?: TaskItem | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState<string>('12:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('focus');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || format(new Date(), 'yyyy-MM-dd'));
      setDueTime(editingTask.dueTime || '12:00');
      setPriority(editingTask.priority || 'medium');
      setCategory(editingTask.category || 'focus');
      setEstimatedMinutes(editingTask.estimatedMinutes || 30);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setDueTime('12:00');
      setPriority('medium');
      setCategory('focus');
      setEstimatedMinutes(30);
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      category,
      estimatedMinutes: Number(estimatedMinutes),
    });

    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', border: '1px solid var(--border-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <CheckSquare size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Task Title *"
            placeholder="e.g. Finalize Q3 Personal Growth Milestones"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="gt-form-group">
            <label className="gt-label">Description / Action Plan</label>
            <textarea
              className="gt-textarea"
              rows={2}
              placeholder="Add extra context, links, or micro-steps..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="gt-form-group">
              <label className="gt-label">Priority Level</label>
              <select
                className="gt-select"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>

            <div className="gt-form-group">
              <label className="gt-label">Category</label>
              <select
                className="gt-select"
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
              >
                <option value="focus">⚡ Deep Focus</option>
                <option value="work">💼 Work / Project</option>
                <option value="personal">👤 Personal Growth</option>
                <option value="health">🏃‍♂️ Health & Wellness</option>
                <option value="social">🤝 Social & Community</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />

            <TextField
              label="Due Time"
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
            />

            <TextField
              label="Est. Duration (mins)"
              type="number"
              min={5}
              step={5}
              value={estimatedMinutes}
              onChange={e => setEstimatedMinutes(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} icon={<CheckSquare size={16} />}>
              {editingTask ? 'Save Task' : 'Create Task'}
            </Button>
          </div>
        </form>
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
          max-width: 520px;
          padding: 1.75rem;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};
