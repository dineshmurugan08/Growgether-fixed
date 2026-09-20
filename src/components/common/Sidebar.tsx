import React from 'react';
import {
  LayoutDashboard,
  Sun,
  ShieldCheck,
  Calendar,
  Users,
  TrendingUp,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';

export type TabId = 'dashboard' | 'today' | 'habits' | 'planner' | 'friends' | 'progress' | 'profile' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'today', label: 'Today', icon: <Sun size={18} /> },
    { id: 'habits', label: 'Habits', icon: <ShieldCheck size={18} /> },
    { id: 'planner', label: 'Planner', icon: <Calendar size={18} /> },
    { id: 'friends', label: 'Friends', icon: <Users size={18} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="gt-desktop-sidebar">
      <div>
        <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Navigation
          </span>
        </div>

        <nav className="gt-sidebar-nav-group">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`gt-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="gt-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div style={{ padding: '0.875rem', background: 'var(--primary-soft)', border: '1px solid var(--border-emerald)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={16} color="var(--primary-400)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-200)' }}>Daily Philosophy</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          "Build yourself. Grow together."
        </p>
      </div>
    </aside>
  );
};
