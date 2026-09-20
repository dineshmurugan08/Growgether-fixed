import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SharedGoal } from '../../types';
import { sharedGoalsService } from '../../services/sharedGoalsService';
import { Target, Sparkles, Heart, CheckCircle2, LogOut, Flame } from 'lucide-react';

interface SharedGoalCardProps {
  goal: SharedGoal;
  currentUserId: string;
  onRefresh: () => void;
  onSendToast: (msg: string) => void;
}

export const SharedGoalCard: React.FC<SharedGoalCardProps> = ({
  goal,
  currentUserId,
  onRefresh,
  onSendToast,
}) => {
  const { daysElapsed, totalTargetDays, isCompleted, participants } = sharedGoalsService.getGoalProgress(goal);
  const myMember = goal.members.find(m => m.userId === currentUserId);
  const isInvited = myMember?.status === 'invited';

  const handleAccept = () => {
    sharedGoalsService.acceptSharedGoal(currentUserId, goal.id);
    onSendToast(`Accepted shared goal "${goal.title}"! Let's reach 30 days together! 🎯`);
    onRefresh();
  };

  const handleLeave = () => {
    if (window.confirm(`Leave shared goal "${goal.title}"?`)) {
      sharedGoalsService.leaveSharedGoal(currentUserId, goal.id);
      onRefresh();
    }
  };

  const handleCheerParticipant = (partnerUserId: string, partnerName: string) => {
    sharedGoalsService.sendGoalEncouragement(currentUserId, partnerUserId, goal.title);
    onSendToast(`Cheer sent to ${partnerName}! Keep each other going! 🔥`);
  };

  return (
    <Card emeraldGlow style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(15,23,42,0.85) 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Badge variant="purple" icon={<Target size={12} />}>Shared Goal Challenge</Badge>
            <Badge variant="emerald">
              DAY {daysElapsed} / {totalTargetDays}
            </Badge>
            {isCompleted && <Badge variant="amber">Milestone Reached! 🎉</Badge>}
            {isInvited && <Badge variant="amber">Invitation Pending</Badge>}
          </div>

          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
            {goal.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--primary-300)', marginTop: '0.2rem', fontWeight: 600 }}>
            Target: {goal.targetHabitTitle}
          </p>
          {goal.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {goal.description}
            </p>
          )}
        </div>

        <div>
          {isInvited ? (
            <Button size="sm" variant="primary" icon={<CheckCircle2 size={14} />} onClick={handleAccept}>
              Accept Goal Invite
            </Button>
          ) : (
            <Button size="sm" variant="ghost" icon={<LogOut size={13} />} onClick={handleLeave}>
              Leave Goal
            </Button>
          )}
        </div>
      </div>

      {/* Collaborative Encouraging Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#c4b5fd',
          marginBottom: '1.25rem',
        }}
      >
        <Sparkles size={18} color="#a855f7" />
        <span>"Every check-in moves the circle closer to 30 days of growth together."</span>
      </div>

      {/* Roster & Individual Day Completion (Dinesh: 16/18, Arun: 15/18) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Participant Progress Breakdown
        </div>

        {participants.map(p => {
          const isMe = p.userId === currentUserId;
          const barColor = isMe ? 'var(--primary-500)' : 'var(--purple-indigo)';

          return (
            <div key={p.userId} style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-indigo), var(--primary-500))', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <strong style={{ color: 'white', fontSize: '0.9rem' }}>
                    {p.displayName} {isMe && '(You)'}
                  </strong>
                  {p.status === 'invited' && (
                    <span style={{ fontSize: '0.725rem', color: 'var(--amber-gold)' }}>(Pending Invite)</span>
                  )}
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isMe ? 'var(--primary-400)' : '#c4b5fd' }}>
                  {p.daysCompleted} / {daysElapsed} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>Days Logged</span>
                </div>
              </div>

              {/* Bar track */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((p.daysCompleted / totalTargetDays) * 100))}%`,
                    background: `linear-gradient(90deg, ${barColor} 0%, var(--primary-400) 100%)`,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {!isMe && p.status === 'accepted' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <Button
                    size="sm"
                    variant="soft"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.55rem' }}
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
