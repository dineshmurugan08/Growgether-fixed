import React from 'react';
import {
  LayoutDashboard,
  Sun,
  ShieldCheck,
  Users,
  User,
} from 'lucide-react';
import { TabId } from './Sidebar';

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'today', label: 'Today', icon: <Sun size={20} /> },
    { id: 'habits', label: 'Habits', icon: <ShieldCheck size={20} /> },
    { id: 'friends', label: 'Friends', icon: <Users size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <nav className="gt-mobile-bottom-bar">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`gt-mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="gt-mobile-icon-wrapper">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
