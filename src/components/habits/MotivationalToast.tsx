import React, { useEffect } from 'react';
import { Sparkles, Flame, CheckCircle2, X, Sun, Users, Target } from 'lucide-react';

interface MotivationalToastProps {
  title?: string;
  message: string;
  streakCount?: number;
  type?: 'task' | 'habit' | 'streak' | 'missed_day' | 'friend_progress' | 'goal';
  onClose: () => void;
}

export const MotivationalToast: React.FC<MotivationalToastProps> = ({
  title,
  message,
  streakCount = 1,
  type = 'habit',
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'streak':
        return <Flame size={20} color="#f59e0b" />;
      case 'missed_day':
        return <Sun size={20} color="#f59e0b" />;
      case 'friend_progress':
        return <Users size={20} color="#a855f7" />;
      case 'goal':
        return <Target size={20} color="#06b6d4" />;
      case 'task':
        return <CheckCircle2 size={20} color="var(--primary-400)" />;
      default:
        return <Sparkles size={20} color="var(--primary-400)" />;
    }
  };

  const getHeaderTitle = () => {
    if (title) return title;
    if (type === 'streak') return `🔥 ${streakCount} Day Streak Milestone`;
    if (type === 'missed_day') return '🌅 Fresh Start';
    if (type === 'friend_progress') return '🤝 Partner Progress';
    return '🌱 Step Forward';
  };

  return (
    <div className="gt-toast-container">
      <div className="gt-toast-content gt-anim-goal-complete">
        <div className="gt-toast-icon">
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff', marginBottom: '1px' }}>
            {getHeaderTitle()}
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            "{message}"
          </div>
        </div>
        <button className="gt-toast-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <style>{`
        .gt-toast-container {
          position: fixed;
          top: 80px;
          right: 24px;
          z-index: 2000;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateY(-16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .gt-toast-content {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          padding: 0.875rem 1.125rem;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-emerald);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          max-width: 380px;
        }

        .gt-toast-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          margin-left: 0.5rem;
        }

        .gt-toast-close:hover {
          color: white;
        }
      `}</style>
    </div>
  );
};
