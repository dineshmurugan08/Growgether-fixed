import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextField } from '../common/Input';
import { Badge } from '../common/Badge';
import { Habit, HabitCategory, HabitFrequency } from '../../types';
import { CreateHabitInput } from '../../services/habitsService';
import { X, Sparkles, Calendar, Clock, Target, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHabitInput) => void;
  editingHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('mindset');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDays, setTargetDays] = useState<number>(7);
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setFrequency(editingHabit.frequency);
      setTargetDays(editingHabit.targetDays);
      setReminderTime(editingHabit.reminderTime || '08:00');
      setStartDate(editingHabit.startDate || format(new Date(), 'yyyy-MM-dd'));
    } else {
      setTitle('');
      setDescription('');
      setCategory('mindset');
      setFrequency('daily');
      setTargetDays(7);
      setReminderTime('08:00');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      frequency,
      targetDays: Number(targetDays),
      reminderTime,
      startDate,
    });

    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', border: '1px solid var(--border-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h3>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Habit Name *"
            placeholder="e.g. 10 Min Morning Mindfulness & Breathwork"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="gt-form-group">
            <label className="gt-label">Description / Intent Statement</label>
            <textarea
              className="gt-textarea"
              rows={2}
              placeholder="Why this habit matters to your self-growth..."
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
                onChange={e => setCategory(e.target.value as HabitCategory)}
              >
                <option value="mindset">🧠 Mindset</option>
                <option value="productivity">⚡ Productivity</option>
                <option value="health">🌱 Health & Hydration</option>
                <option value="fitness">🏃‍♂️ Fitness & Movement</option>
                <option value="social">🤝 Friendship & Social</option>
              </select>
            </div>

            <div className="gt-form-group">
              <label className="gt-label">Frequency</label>
              <select
                className="gt-select"
                value={frequency}
                onChange={e => {
                  const freq = e.target.value as HabitFrequency;
                  setFrequency(freq);
                  setTargetDays(freq === 'daily' ? 7 : freq === 'weekdays' ? 5 : 2);
                }}
              >
                <option value="daily">Daily (7 days/week)</option>
                <option value="weekdays">Weekdays (5 days/week)</option>
                <option value="weekends">Weekends (2 days/week)</option>
                <option value="custom">Custom Goal</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <TextField
              label="Target Days / Wk"
              type="number"
              min={1}
              max={7}
              value={targetDays}
              onChange={e => setTargetDays(Number(e.target.value))}
            />

            <TextField
              label="Daily Reminder"
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
            />

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} icon={<Sparkles size={16} />}>
              {editingHabit ? 'Save Changes' : 'Create Habit'}
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
