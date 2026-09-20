import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextField } from '../common/Input';
import { PlannerBlock, PlannerCategory } from '../../types';
import { CreateBlockInput } from '../../services/plannerService';
import { X, Calendar, Clock, BookOpen, UserCheck, Briefcase, Heart, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface PlannerEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBlockInput) => void;
  editingBlock?: PlannerBlock | null;
  initialDate?: string;
}

export const PlannerEventModal: React.FC<PlannerEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBlock,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blockDate, setBlockDate] = useState<string>(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [category, setCategory] = useState<PlannerCategory>('event');

  useEffect(() => {
    if (editingBlock) {
      setTitle(editingBlock.title);
      setDescription(editingBlock.description || '');
      setBlockDate(editingBlock.blockDate || initialDate || format(new Date(), 'yyyy-MM-dd'));
      setStartTime(editingBlock.startTime || '09:00');
      setEndTime(editingBlock.endTime || '10:00');
      setCategory(editingBlock.category || 'event');
    } else {
      setTitle('');
      setDescription('');
      setBlockDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('event');
    }
  }, [editingBlock, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      blockDate,
      startTime,
      endTime,
      category,
    });

    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--cyan-soft)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67e8f9' }}>
              <Calendar size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>{editingBlock ? 'Edit Event Block' : 'Schedule Event / Activity'}</h3>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Title / Activity Name *"
            placeholder="e.g. System Design Study Session or Team Sync"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="gt-form-group">
            <label className="gt-label">Description / Notes</label>
            <textarea
              className="gt-textarea"
              rows={2}
              placeholder="Add key goals or location details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="gt-form-group">
              <label className="gt-label">Category</label>
              <select
                className="gt-select"
                value={category}
                onChange={e => setCategory(e.target.value as PlannerCategory)}
              >
                <option value="event">📅 Standalone Event</option>
                <option value="study">📚 Study Session</option>
                <option value="personal">🌿 Personal Activity</option>
                <option value="work">⚡ Work / Deep Focus</option>
                <option value="health">🏃‍♂️ Health & Wellness</option>
              </select>
            </div>

            <TextField
              label="Event Date"
              type="date"
              value={blockDate}
              onChange={e => setBlockDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />

            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} icon={<Sparkles size={16} />}>
              {editingBlock ? 'Save Block' : 'Schedule Block'}
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
          max-width: 500px;
          padding: 1.75rem;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};
