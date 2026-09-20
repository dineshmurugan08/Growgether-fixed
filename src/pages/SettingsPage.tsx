import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TextField, Checkbox } from '../components/common/Input';
import { Settings, User, Bell, Moon, Lock, Download, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState<'obsidian' | 'slate' | 'emerald'>('obsidian');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [friendNotifs, setFriendNotifs] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="gt-page">
      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Settings size={24} color="var(--text-secondary)" />
            <h1 style={{ fontSize: '1.85rem' }}>Settings & Preferences</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Manage notification alerts, appearance, privacy, and account settings.
          </p>
        </div>

        {savedSuccess && (
          <Badge variant="emerald" icon={<Shield size={12} />}>
            Preferences Saved Successfully ✓
          </Badge>
        )}
      </header>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Section 1: Appearance & Theme */}
          <Card>
            <div className="gt-card-header">
              <h3 className="gt-card-title">
                <Moon size={18} color="var(--purple-indigo)" /> Appearance Theme
              </h3>
              <Badge variant="purple">Interface Styling</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div
                className={`gt-theme-option ${activeTheme === 'obsidian' ? 'active' : ''}`}
                onClick={() => setActiveTheme('obsidian')}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#090d16', border: '2px solid var(--primary-500)' }} />
                <div>
                  <strong style={{ color: 'white', fontSize: '0.925rem' }}>Obsidian Dark (Default)</strong>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Deep cyber dark background with bio-emerald glows</div>
                </div>
              </div>

              <div
                className={`gt-theme-option ${activeTheme === 'slate' ? 'active' : ''}`}
                onClick={() => setActiveTheme('slate')}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0f172a', border: '2px solid var(--border-medium)' }} />
                <div>
                  <strong style={{ color: 'white', fontSize: '0.925rem' }}>Midnight Slate</strong>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Soft slate blue dark tone for high contrast readability</div>
                </div>
              </div>

              <div
                className={`gt-theme-option ${activeTheme === 'emerald' ? 'active' : ''}`}
                onClick={() => setActiveTheme('emerald')}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#042f2e', border: '2px solid var(--primary-400)' }} />
                <div>
                  <strong style={{ color: 'white', fontSize: '0.925rem' }}>Bio-Emerald Glow</strong>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Nature inspired teal and emerald backdrop</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Notification Controls */}
          <Card>
            <div className="gt-card-header">
              <h3 className="gt-card-title">
                <Bell size={18} color="var(--amber-gold)" /> Notification Alerts
              </h3>
              <Badge variant="amber">Reminders</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <Checkbox
                  checked={emailNotifs}
                  onChange={setEmailNotifs}
                  label="Daily Morning Habit Reminder Email"
                />
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginLeft: '34px', marginTop: '2px' }}>
                  Sent daily at 08:00 AM local time
                </p>
              </div>

              <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <Checkbox
                  checked={friendNotifs}
                  onChange={setFriendNotifs}
                  label="Accountability Partner Activity Alerts"
                />
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginLeft: '34px', marginTop: '2px' }}>
                  Receive notifications when friends cheer or reach streaks
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="button" variant="ghost">Discard Changes</Button>
          <Button type="submit" variant="primary" size="lg">Save All Preferences</Button>
        </div>
      </form>

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }

        .gt-theme-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-theme-option.active, .gt-theme-option:hover {
          border-color: var(--primary-500);
          background: rgba(16, 185, 129, 0.06);
        }
      `}</style>
    </div>
  );
};
