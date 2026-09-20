import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsService } from '../../services/notificationsService';
import { NotificationsModal } from '../notifications/NotificationsModal';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const userId = user?.id || 'guest_user';

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const refreshUnreadCount = () => {
    if (!userId) return;
    const count = notificationsService.getUnreadCount(userId);
    setUnreadCount(count);
  };

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 4000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <header className="gt-navbar">
      <div className="gt-navbar-left">
        <div className="gt-logo-icon">
          <Sparkles size={20} />
        </div>
        <div className="gt-brand-text">
          <span className="gt-brand-name">Growgether</span>
          <span className="gt-brand-motto">Build yourself. Grow together.</span>
        </div>
      </div>

      <div className="gt-navbar-search">
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search habits, tasks, or friends..."
            className="gt-nav-search-input"
          />
        </div>
      </div>

      <div className="gt-navbar-right">
        {user && (
          <Badge variant="amber" icon={<Flame size={14} />}>
            {user.streakCount} Day Streak
          </Badge>
        )}

        <button
          className="gt-icon-btn"
          title="Notifications"
          onClick={() => setIsNotifOpen(true)}
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {user && (
          <button className="gt-icon-btn" title="Log Out" onClick={logout}>
            <LogOut size={16} />
          </button>
        )}

        <div className="gt-user-avatar" title={user?.displayName || 'User Profile'}>
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onRefreshUnreadCount={refreshUnreadCount}
      />

      <style>{`
        .gt-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          padding-top: max(0.75rem, env(safe-area-inset-top));
          background: rgba(9, 13, 22, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 1000;
          min-height: 65px;
          height: calc(65px + env(safe-area-inset-top));
        }

        .gt-navbar-left {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-shrink: 0;
        }

        .gt-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 16px var(--primary-glow);
          flex-shrink: 0;
        }

        .gt-brand-text {
          display: flex;
          flex-direction: column;
        }

        .gt-brand-name {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.15rem;
          background: linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .gt-brand-motto {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .gt-brand-motto {
            display: none;
          }
        }

        .gt-navbar-search {
          display: none;
          flex: 1;
          justify-content: center;
          margin: 0 1rem;
        }

        @media (min-width: 768px) {
          .gt-navbar-search {
            display: flex;
          }
        }

        .gt-nav-search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          font-size: 0.825rem;
          background: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
        }

        .gt-nav-search-input:focus {
          background: var(--bg-input-focus);
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-soft);
        }

        .gt-navbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .gt-navbar-right {
            gap: 0.35rem;
          }
        }

        .gt-icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .gt-icon-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .gt-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--purple-indigo) 0%, var(--rose-pink) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
          flex-shrink: 0;
        }
      `}</style>
    </header>
  );
};
