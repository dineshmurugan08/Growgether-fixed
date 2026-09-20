import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Habit, UserProfile } from '../../types';
import { habitsService } from '../../services/habitsService';
import { friendsService } from '../../services/friendsService';
import { sharedHabitsService } from '../../services/sharedHabitsService';
import { useAuth } from '../../context/AuthContext';
import { X, Users, Sparkles, CheckSquare, Heart } from 'lucide-react';

interface ShareHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: () => void;
}

export const ShareHabitModal: React.FC<ShareHabitModalProps> = ({
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);

  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && userId) {
      const userHabits = habitsService.getHabits(userId).filter(h => !h.isArchived);
      const userFriends = friendsService.getFriendsList(userId);

      setHabits(userHabits);
      setFriends(userFriends);

      if (userHabits.length > 0) {
        setSelectedHabitId(userHabits[0].id);
      }
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
    if (!selectedHabitId || selectedFriendIds.length === 0) return;

    sharedHabitsService.createSharedHabit(userId, selectedHabitId, selectedFriendIds);
    onShareSuccess();
    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--primary-soft)', border: '1px solid var(--border-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Share Habit & Grow Together</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Invite an accountability partner to build consistency side-by-side
              </span>
            </div>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Select Existing Habit */}
          <div className="gt-form-group">
            <label className="gt-label">Select Your Habit to Share *</label>
            {habits.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active habits found. Create a habit first!</p>
            ) : (
              <select
                className="gt-select"
                value={selectedHabitId}
                onChange={e => setSelectedHabitId(e.target.value)}
                required
              >
                {habits.map(h => (
                  <option key={h.id} value={h.id}>
                    🌱 {h.title} ({h.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Friends */}
          <div className="gt-form-group">
            <label className="gt-label">Select Accountability Partners *</label>
            {friends.length === 0 ? (
              <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You have no connected friends yet. Add friends on the Friends page first!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '180px', overflowY: 'auto' }}>
                {friends.map(friend => {
                  const isSelected = selectedFriendIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => handleToggleFriend(friend.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--purple-indigo))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                          {friend.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: 'white', fontSize: '0.9rem' }}>{friend.displayName}</strong>
                          <span style={{ fontSize: '0.775rem', color: 'var(--primary-400)', marginLeft: '0.375rem' }}>
                            @{friend.username}
                          </span>
                        </div>
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
              disabled={!selectedHabitId || selectedFriendIds.length === 0}
            >
              Invite Friends 🤝
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
          max-width: 480px;
          padding: 1.75rem;
        }
      `}</style>
    </div>
  );
};
