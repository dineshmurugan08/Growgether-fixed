import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AppNotification } from '../../types';
import { notificationsService } from '../../services/notificationsService';
import { useAuth } from '../../context/AuthContext';
import { X, Bell, UserPlus, CheckCircle2, Flame, Target, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshUnreadCount?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onRefreshUnreadCount,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = () => {
    if (!userId) return;
    const list = notificationsService.getNotifications(userId);
    setNotifications(list);
    if (onRefreshUnreadCount) onRefreshUnreadCount();
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleMarkAsRead = (notificationId: string) => {
    notificationsService.markAsRead(userId, notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationsService.markAllAsRead(userId);
    loadNotifications();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={18} color="#a855f7" />;
      case 'friend_accepted':
        return <CheckCircle2 size={18} color="var(--primary-400)" />;
      case 'encouragement':
        return <Flame size={18} color="#f59e0b" />;
      case 'shared_goal':
        return <Target size={18} color="#06b6d4" />;
      default:
        return <Bell size={18} color="var(--primary-400)" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--purple-soft)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Circle Notifications</h3>
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                  {unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" icon={<CheckCheck size={14} />} onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
            <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem' }}>No notifications yet. Connect with friends to share accountability!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                style={{
                  padding: '0.875rem 1rem',
                  background: notif.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(139, 92, 246, 0.08)',
                  border: notif.read ? '1px solid var(--border-subtle)' : '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ marginTop: '2px' }}>{getNotifIcon(notif.type)}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                    )}
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                    {notif.message}
                  </p>

                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          )}
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
          max-width: 480px;
          padding: 1.75rem;
        }
      `}</style>
    </div>
  );
};
