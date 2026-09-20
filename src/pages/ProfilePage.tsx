import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TextField } from '../components/common/Input';
import { User, Flame, Shield, Sparkles, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="gt-page">
      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <User size={24} color="var(--purple-indigo)" />
            <h1 style={{ fontSize: '1.85rem' }}>Profile & Account</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Personal growth philosophy, User ID, and session security.
          </p>
        </div>

        <Button variant="secondary" icon={<LogOut size={16} />} onClick={logout}>
          Log Out of Session
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <Card emeraldGlow>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-indigo) 0%, var(--rose-pink) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '2px' }}>{user?.displayName || 'Alex Rivers'}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600 }}>@{user?.username || 'alex_grower'}</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Badge variant="amber" icon={<Flame size={12} />}>{user?.streakCount || 14} Day Streak</Badge>
                <Badge variant="emerald">Authenticated Member</Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TextField label="Display Name" defaultValue={user?.displayName || 'Alex Rivers'} />
            <TextField label="Unique User ID" value={`@${user?.username || 'alex_grower'}`} disabled />
            <div className="gt-form-group">
              <label className="gt-label">Personal Growth Philosophy</label>
              <textarea
                className="gt-textarea"
                rows={3}
                defaultValue={user?.bio || 'Building consistency one day at a time 🌱. Focused on deep work, mindfulness, and staying accountable.'}
              />
            </div>
            <Button variant="primary">Update Profile</Button>
          </div>
        </Card>

        {/* Safeguards & Session Security */}
        <Card>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <Shield size={18} color="var(--primary-400)" /> Streak Freeze Wallet
            </h3>
            <Badge variant="amber">2 Tokens Available</Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Life happens. Streak Freeze tokens protect your daily habit streak if you miss a check-in during emergency or rest days.
          </p>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Auto-Activate on Missed Day</strong>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Protects streak automatically at midnight</div>
            </div>
            <Badge variant="emerald">Active</Badge>
          </div>

          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <LogOut size={18} color="var(--rose-pink)" /> Session Security
            </h3>
          </div>
          <Button variant="secondary" icon={<LogOut size={14} />} onClick={logout} style={{ width: '100%' }}>
            Sign Out of Current Device
          </Button>
        </Card>
      </div>

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; }
      `}</style>
    </div>
  );
};
