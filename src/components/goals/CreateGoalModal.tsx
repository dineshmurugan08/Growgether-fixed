import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextField } from '../common/Input';
import { UserProfile } from '../../types';
import { friendsService } from '../../services/friendsService';
import { sharedGoalsService } from '../../services/sharedGoalsService';
import { useAuth } from '../../context/AuthContext';
import { X, Target, Sparkles, Users, Calendar } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [title, setTitle] = useState('30 Days of Consistency');
  const [targetHabitTitle, setTargetHabitTitle] = useState('Complete daily study habit');
  const [targetDays, setTargetDays] = useState<number>(30);
  const [description, setDescription] = useState('Collaborative milestone to build daily focus & habits.');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && userId) {
      const userFriends = friendsService.getFriendsList(userId);
      setFriends(userFriends);
      if (userFriends.length > 0) {
        setSelectedFriendIds([userFriends[0].id]);
      }
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleToggleFriend = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(selectedFriendIds.filter(id => id !== friendId));
    } else {
      setSelectedFriendIds([...selectedFriendIds, friendId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetHabitTitle.trim() || selectedFriendIds.length === 0) return;

    sharedGoalsService.createSharedGoal(userId, {
      title: title.trim(),
      description: description.trim(),
      targetHabitTitle: targetHabitTitle.trim(),
      targetDays: Number(targetDays),
      invitedFriendIds: selectedFriendIds,
    });

    onGoalCreated();
    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--purple-soft)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
              <Target size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Create Shared Goal with Friends</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Set a milestone challenge to encourage mutual consistency
              </span>
            </div>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Goal Challenge Title *"
            placeholder="e.g. 30 Days of Consistency"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <TextField
            label="Target Daily Habit / Activity *"
            placeholder="e.g. Complete daily study habit"
            value={targetHabitTitle}
            onChange={e => setTargetHabitTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="gt-form-group">
              <label className="gt-label">Milestone Duration (Days)</label>
              <select
                className="gt-select"
                value={targetDays}
                onChange={e => setTargetDays(Number(e.target.value))}
              >
                <option value={7}>7 Days Challenge</option>
                <option value={14}>14 Days Challenge</option>
                <option value={21}>21 Days Challenge</option>
                <option value={30}>30 Days of Consistency</option>
                <option value={60}>60 Days Mastery</option>
                <option value={90}>90 Days Transformation</option>
              </select>
            </div>

            <div className="gt-form-group">
              <label className="gt-label">Goal Focus</label>
              <input
                className="gt-input"
                value="Collaborative Challenge 🤝"
                disabled
              />
            </div>
          </div>

          <div className="gt-form-group">
            <label className="gt-label">Description / Intent Statement</label>
            <textarea
              className="gt-textarea"
              rows={2}
              placeholder="Why this goal matters for our growth..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Friends Checklist */}
          <div className="gt-form-group">
            <label className="gt-label">Invite Friends to Participate *</label>
            {friends.length === 0 ? (
              <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Add friends on the Friends page first to create shared goals together!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                {friends.map(friend => {
                  const isSelected = selectedFriendIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => handleToggleFriend(friend.id)}
                      style={{
                        padding: '0.625rem 0.875rem',
                        background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-indigo), var(--primary-500))', color: '#fff', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {friend.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>
                          {friend.displayName} (@{friend.username})
                        </span>
                      </div>

                      <div className={`gt-checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Sparkles size={12} color="#ffffff" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ flex: 1 }}
              icon={<Sparkles size={16} />}
              disabled={!title.trim() || selectedFriendIds.length === 0}
            >
              Launch Goal 🚀
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
        }
      `}</style>
    </div>
  );
};
