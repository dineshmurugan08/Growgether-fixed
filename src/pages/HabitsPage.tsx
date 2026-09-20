import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/Input';
import { Habit, HabitCategory, SharedHabit } from '../types';
import { habitsService, CreateHabitInput } from '../services/habitsService';
import { sharedHabitsService } from '../services/sharedHabitsService';
import { useAuth } from '../context/AuthContext';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { HabitDetailModal } from '../components/habits/HabitDetailModal';
import { ShareHabitModal } from '../components/habits/ShareHabitModal';
import { SharedHabitCard } from '../components/habits/SharedHabitCard';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import {
  ShieldCheck,
  Flame,
  Plus,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Droplets,
  Zap,
  Info,
  Users,
  Share2,
} from 'lucide-react';
import { format } from 'date-fns';

const MOTIVATIONAL_QUOTES = [
  "Consistency is your superpower. Every small action builds your future.",
  "You showed up today! That is where transformation begins.",
  "Streak preserved! Keeping your commitment strong day by day.",
  "Deep focus and daily routines shape your trajectory.",
];

export const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sharedHabits, setSharedHabits] = useState<SharedHabit[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitDetail, setSelectedHabitDetail] = useState<Habit | null>(null);

  // Motivational toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastStreak, setToastStreak] = useState<number>(1);

  // Load user habits & shared habits
  const loadData = () => {
    if (!userId) return;
    const userHabits = habitsService.getHabits(userId);
    const userShared = sharedHabitsService.getSharedHabits(userId);
    setHabits(userHabits);
    setSharedHabits(userShared);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Handle Create / Edit submission
  const handleFormSubmit = (data: CreateHabitInput) => {
    if (editingHabit) {
      habitsService.updateHabit(userId, editingHabit.id, data);
    } else {
      habitsService.createHabit(userId, data);
    }
    loadData();
    setEditingHabit(null);
  };

  // Handle Delete
  const handleDeleteHabit = (habitId: string) => {
    habitsService.deleteHabit(userId, habitId);
    loadData();
  };

  // Handle Toggle Complete
  const handleToggleComplete = (habitId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = habitsService.toggleHabitLog(userId, habitId, format(new Date(), 'yyyy-MM-dd'), 'completed');
    loadData();

    if (result.action === 'completed') {
      const stats = habitsService.getHabitStats(userId, habitId);
      const randomMsg = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setToastStreak(stats.currentStreak);
      setToastMessage(randomMsg);
    }
  };

  // Handle Toggle Skip
  const handleToggleSkip = (habitId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    habitsService.toggleHabitLog(userId, habitId, format(new Date(), 'yyyy-MM-dd'), 'skipped');
    loadData();
  };

  // Filtered personal habits
  const filteredHabits = habits.filter(h => {
    const matchesCat = categoryFilter === 'all' || h.category === categoryFilter;
    const matchesSearch = !searchQuery.trim() ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: HabitCategory) => {
    switch (category) {
      case 'mindset': return <Sparkles size={18} color="var(--primary-400)" />;
      case 'health': return <Droplets size={18} color="var(--cyan-teal)" />;
      case 'productivity': return <BookOpen size={18} color="var(--purple-indigo)" />;
      default: return <Zap size={18} color="var(--amber-gold)" />;
    }
  };

  return (
    <div className="gt-page">
      {/* Toast Notification */}
      {toastMessage && (
        <MotivationalToast
          message={toastMessage}
          streakCount={toastStreak}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={24} color="var(--primary-400)" />
            <h1 style={{ fontSize: '1.85rem' }}>Habit Engine & Accountability</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Build daily consistency, preserve streaks, and grow side-by-side with accountability partners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            icon={<Share2 size={16} />}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share Habit with Friend
          </Button>

          <Button
            icon={<Plus size={16} />}
            onClick={() => { setEditingHabit(null); setIsFormModalOpen(true); }}
          >
            Create New Habit
          </Button>
        </div>
      </header>

      {/* Main Tab Bar: Personal vs Circle Shared Habits */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`gt-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          My Personal Habits ({habits.length})
        </button>
        <button
          className={`gt-tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          🤝 Circle Shared Habits ({sharedHabits.length})
        </button>
      </div>

      {/* TAB 1: Personal Habits */}
      {activeTab === 'personal' && (
        <>
          {/* Filter & Search Bar */}
          <div className="gt-habits-toolbar">
            <div className="gt-category-bar">
              <button
                className={`gt-cat-tab ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All ({habits.length})
              </button>
              <button
                className={`gt-cat-tab ${categoryFilter === 'mindset' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('mindset')}
              >
                🧠 Mindset
              </button>
              <button
                className={`gt-cat-tab ${categoryFilter === 'productivity' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('productivity')}
              >
                ⚡ Productivity
              </button>
              <button
                className={`gt-cat-tab ${categoryFilter === 'health' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('health')}
              >
                🌱 Health
              </button>
            </div>

            <SearchInput
              style={{ maxWidth: '280px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Habit Cards Grid */}
          {filteredHabits.length === 0 ? (
            <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <ShieldCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No habits found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Start building your daily routine by creating your first habit.
              </p>
              <Button icon={<Plus size={16} />} onClick={() => { setEditingHabit(null); setIsFormModalOpen(true); }}>
                Create Habit Now
              </Button>
            </Card>
          ) : (
            <div className="gt-habits-cards-grid">
              {filteredHabits.map(habit => {
                const stats = habitsService.getHabitStats(userId, habit.id);

                return (
                  <Card
                    key={habit.id}
                    emeraldGlow={stats.completedToday}
                    className="gt-habit-card"
                    onClick={() => setSelectedHabitDetail(habit)}
                  >
                    <div className="gt-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="gt-habit-icon-wrap">
                          {getCategoryIcon(habit.category)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem' }}>{habit.title}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {habit.frequency.toUpperCase()} • {habit.targetDays}d/wk
                          </span>
                        </div>
                      </div>

                      <Badge variant="amber" icon={<Flame size={12} />}>
                        {stats.currentStreak} Days
                      </Badge>
                    </div>

                    {habit.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                        {habit.description}
                      </p>
                    )}

                    {/* Progress bar preview */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                      <span>30-Day Consistency</span>
                      <span style={{ color: 'var(--primary-300)', fontWeight: 600 }}>{stats.completionRate}%</span>
                    </div>

                    {/* Card Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                      <Button
                        variant={stats.completedToday ? 'soft' : 'primary'}
                        style={{ flex: 1 }}
                        icon={<CheckCircle2 size={16} />}
                        onClick={e => handleToggleComplete(habit.id, e)}
                      >
                        {stats.completedToday ? 'Completed ✓' : 'Mark Complete'}
                      </Button>

                      <Button
                        variant={stats.skippedToday ? 'secondary' : 'ghost'}
                        size="sm"
                        icon={<RotateCcw size={14} />}
                        onClick={e => handleToggleSkip(habit.id, e)}
                        title="Skip today without breaking streak"
                      >
                        {stats.skippedToday ? 'Skipped' : 'Skip'}
                      </Button>

                      <Button
                        variant="ghost"
                        iconOnly
                        icon={<Info size={16} />}
                        onClick={() => setSelectedHabitDetail(habit)}
                        title="View Habit History & Calendar"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Shared Circle Habits */}
      {activeTab === 'shared' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sharedHabits.length === 0 ? (
            <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No shared habits yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Select an existing habit and invite a friend to participate. "You're both making progress. Keep each other going."
              </p>
              <Button icon={<Share2 size={16} />} onClick={() => setIsShareModalOpen(true)}>
                Share Habit with Friend
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {sharedHabits.map(sh => (
                <SharedHabitCard
                  key={sh.id}
                  sharedHabit={sh}
                  currentUserId={userId}
                  onRefresh={loadData}
                  onSendToast={msg => setToastMessage(msg)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingHabit={editingHabit}
      />

      {/* Share Habit Modal */}
      <ShareHabitModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShareSuccess={loadData}
      />

      {/* Habit Detail Modal */}
      <HabitDetailModal
        isOpen={!!selectedHabitDetail}
        habit={selectedHabitDetail}
        onClose={() => setSelectedHabitDetail(null)}
        onEdit={h => { setEditingHabit(h); setIsFormModalOpen(true); }}
        onDelete={handleDeleteHabit}
        onToggleComplete={handleToggleComplete}
        onToggleSkip={handleToggleSkip}
      />

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }

        .gt-tab-btn {
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-tab-btn:hover {
          color: #ffffff;
          border-color: var(--border-emerald);
        }

        .gt-tab-btn.active {
          background: var(--primary-soft);
          border-color: var(--border-emerald);
          color: var(--primary-400);
        }

        .gt-habits-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .gt-category-bar {
          display: flex;
          gap: 0.375rem;
          overflow-x: auto;
        }

        .gt-cat-tab {
          padding: 0.45rem 0.875rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 0.825rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .gt-cat-tab.active, .gt-cat-tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--border-medium);
        }

        .gt-habits-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .gt-habit-card {
          padding: 1.25rem;
          cursor: pointer;
        }

        .gt-habit-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
