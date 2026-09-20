import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SharedHabit } from '../../types';
import { sharedHabitsService } from '../../services/sharedHabitsService';
import { Heart, Users, Sparkles, CheckCircle2, LogOut, Flame } from 'lucide-react';

interface SharedHabitCardProps {
  sharedHabit: SharedHabit;
  currentUserId: string;
  onRefresh: () => void;
  onSendToast: (msg: string) => void;
}

export const SharedHabitCard: React.FC<SharedHabitCardProps> = ({
  sharedHabit,
  currentUserId,
  onRefresh,
  onSendToast,
}) => {
  const participants = sharedHabitsService.getParticipantProgress(sharedHabit);
  const myMember = sharedHabit.members.find(m => m.userId === currentUserId);
  const isInvited = myMember?.status === 'invited';

  const handleAccept = () => {
    sharedHabitsService.acceptSharedHabit(currentUserId, sharedHabit.id);
    onSendToast(`Accepted shared habit "${sharedHabit.title}"! You're both growing together! 🌱`);
    onRefresh();
  };

  const handleLeave = () => {
    if (window.confirm(`Are you sure you want to leave shared habit "${sharedHabit.title}"?`)) {
      sharedHabitsService.leaveSharedHabit(currentUserId, sharedHabit.id);
      onRefresh();
    }
  };

  const handleCheerParticipant = (partnerUserId: string, partnerName: string) => {
    sharedHabitsService.sendSharedHabitEncouragement(currentUserId, partnerUserId, sharedHabit.title);
    onSendToast(`Encouragement sent to ${partnerName}! Keep each other going! 🔥`);
  };

  return (
    <Card emeraldGlow style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.85) 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Badge variant="emerald" icon={<Users size={12} />}>Circle Shared Habit</Badge>
            <Badge variant="cyan" style={{ textTransform: 'capitalize' }}>{sharedHabit.category}</Badge>
            {isInvited && <Badge variant="amber">Invitation Pending</Badge>}
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
            {sharedHabit.title}
          </h3>
          {sharedHabit.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {sharedHabit.description}
            </p>
          )}
        </div>

        {/* Accept or Leave Header Action */}
        <div>
          {isInvited ? (
            <Button size="sm" variant="primary" icon={<CheckCircle2 size={14} />} onClick={handleAccept}>
              Accept Shared Habit
            </Button>
          ) : (
            <Button size="sm" variant="ghost" icon={<LogOut size={13} />} onClick={handleLeave}>
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Encouraging Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid var(--border-emerald)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--primary-300)',
          marginBottom: '1.25rem',
        }}
      >
        <Sparkles size={18} color="var(--primary-400)" />
        <span>"You're both making progress. Keep each other going."</span>
      </div>

      {/* Participants Progress Bar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {participants.map(p => {
          const isMe = p.userId === currentUserId;
          const barColor = isMe ? 'var(--primary-500)' : 'var(--cyan-teal)';

          return (
            <div key={p.userId} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {/* Top Row: Name, Status & % */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--purple-indigo))', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>
                    {p.displayName} {isMe && '(You)'}
                  </span>
                  {p.status === 'invited' && (
                    <span style={{ fontSize: '0.725rem', color: 'var(--amber-gold)', fontWeight: 600 }}>(Invited)</span>
                  )}
                  {p.completedToday && (
                    <Badge variant="emerald" style={{ fontSize: '0.65rem' }}>Done Today ✓</Badge>
                  )}
                </div>

                <div style={{ fontWeight: 800, color: isMe ? 'var(--primary-400)' : '#67e8f9' }}>
                  {p.completionRate}% <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>Consistency</span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${p.completionRate}%`,
                    background: `linear-gradient(90deg, ${barColor} 0%, rgba(16,185,129,0.7) 100%)`,
                    borderRadius: '5px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* Individual Cheer Action for Partner */}
              {!isMe && p.status === 'accepted' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <Button
                    size="sm"
                    variant="soft"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.6rem' }}
                    icon={<Heart size={12} color="#ec4899" fill="#ec4899" />}
                    onClick={() => handleCheerParticipant(p.userId, p.displayName)}
                  >
                    Cheer {p.displayName}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
