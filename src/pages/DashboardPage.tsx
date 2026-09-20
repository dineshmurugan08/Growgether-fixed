import React, { useState, useEffect } from 'react';
import { Card, StatCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Checkbox } from '../components/common/Input';
import { habitsService } from '../services/habitsService';
import { tasksService } from '../services/tasksService';
import { friendsService } from '../services/friendsService';
import { motivationService } from '../services/motivationService';
import { Habit, TaskItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import {
  CheckCircle2,
  CheckSquare,
  Flame,
  Heart,
  Plus,
  Sparkles,
  ShieldCheck,
  Clock,
  Sun,
  Users,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showFreshStartBanner, setShowFreshStartBanner] = useState<boolean>(true);
  const [showFriendProgressBanner, setShowFriendProgressBanner] = useState<boolean>(true);

  // Toast state
  const [toastInfo, setToastInfo] = useState<{ show: boolean; title?: string; message: string; type?: any; streak?: number }>({
    show: false,
    message: '',
  });

  const [cheerCounts, setCheerCounts] = useState<{ [key: string]: { count: number; cheered: boolean } }>({
    fa1: { count: 5, cheered: false },
    fa2: { count: 3, cheered: true },
    fa3: { count: 8, cheered: false },
  });

  const loadData = () => {
    if (!userId) return;
    const userHabits = habitsService.getHabits(userId);
    const userTasks = tasksService.getTasks(userId);
    setHabits(userHabits);
    setTasks(userTasks);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const toggleHabit = (habitId: string) => {
    const result = habitsService.toggleHabitLog(userId, habitId, format(new Date(), 'yyyy-MM-dd'), 'completed');
    loadData();

    if (result.action === 'completed') {
      const stats = habitsService.getHabitStats(userId, habitId);
      const habitsStats = habits.map(h => habitsService.getHabitStats(userId, h.id));
      const completedCount = habitsStats.filter(s => s.completedToday).length + 1;

      const feedback = motivationService.getHabitCompletionFeedback(
        completedCount,
        habits.length,
        stats.currentStreak
      );

      setToastInfo({
        show: true,
        title: feedback.title,
        message: feedback.message,
        type: feedback.type,
        streak: stats.currentStreak,
      });
    }
  };

  const toggleTask = (task: TaskItem) => {
    if (task.status === 'completed') {
      tasksService.reopenTask(userId, task.id);
      loadData();
    } else {
      tasksService.completeTask(userId, task.id);
      loadData();

      const todayCompleted = tasks.filter(t => t.dueDate === format(new Date(), 'yyyy-MM-dd') && t.status === 'completed').length + 1;
      const feedback = motivationService.getTaskCompletionFeedback(todayCompleted);

      setToastInfo({
        show: true,
        title: feedback.title,
        message: feedback.message,
        type: feedback.type,
      });
    }
  };

  const handleCheer = (key: string, friendName: string = 'Maya Lin') => {
    setCheerCounts(prev => {
      const current = prev[key] || { count: 0, cheered: false };
      return {
        ...prev,
        [key]: {
          count: current.cheered ? current.count - 1 : current.count + 1,
          cheered: !current.cheered,
        },
      };
    });

    setToastInfo({
      show: true,
      title: 'Cheer Sent! 🔥',
      message: `Encouragement sent to ${friendName}! Keep each other going.`,
      type: 'friend_progress',
    });
  };

  const habitsStats = habits.map(h => ({
    habit: h,
    stats: habitsService.getHabitStats(userId, h.id),
  }));

  const completedHabitsTodayCount = habitsStats.filter(item => item.stats.completedToday).length;
  const todayTasks = tasks.filter(t => t.dueDate === format(new Date(), 'yyyy-MM-dd'));
  const completedTasksTodayCount = todayTasks.filter(t => t.status === 'completed').length;

  const totalTodayItems = habits.length + todayTasks.length;
  const totalTodayCompleted = completedHabitsTodayCount + completedTasksTodayCount;
  const progressPct = totalTodayItems > 0 ? Math.round((totalTodayCompleted / totalTodayItems) * 100) : 0;
  const maxStreak = Math.max(0, ...habitsStats.map(item => item.stats.currentStreak));

  return (
    <div className="gt-dashboard">
      {/* Motivational Toast */}
      {toastInfo.show && (
        <MotivationalToast
          title={toastInfo.title}
          message={toastInfo.message}
          type={toastInfo.type}
          streakCount={toastInfo.streak}
          onClose={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Header Banner */}
      <header className="gt-dashboard-header">
        <div>
          <div className="gt-welcome-pill">
            <Sparkles size={13} color="var(--primary-400)" />
            <span>Daily Commitment Center</span>
          </div>
          <h1 className="gt-dashboard-title">
            Welcome back, {user?.displayName || 'Grower'}! 👋
          </h1>
          <p className="gt-dashboard-subtitle">
            "Build yourself. Grow together." — You completed {totalTodayCompleted} of {totalTodayItems} commitments today.
          </p>
        </div>
      </header>

      {/* Banners Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Friend Progress Encouragement Banner */}
        {showFriendProgressBanner && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>🤝 Partner Milestone</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  "Your friend made progress. Send some encouragement."
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                size="sm"
                variant="soft"
                icon={<Heart size={14} color="#ec4899" fill="#ec4899" />}
                onClick={() => handleCheer('fa1', 'Maya Lin')}
              >
                Send Encouragement
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowFriendProgressBanner(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Missed Day / Fresh Start Banner */}
        {showFreshStartBanner && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Sun size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>🌅 Fresh Start</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  "Yesterday didn't go as planned. Today is a fresh start."
                </div>
              </div>
            </div>

            <Button size="sm" variant="ghost" onClick={() => setShowFreshStartBanner(false)}>
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="gt-stats-grid">
        <StatCard
          title="Daily Streak"
          value={`${maxStreak || 1} Days`}
          icon={<Flame size={20} className="gt-anim-streak-milestone" />}
          variant="amber"
          trend="Active Consistency 🔥"
        />

        <StatCard
          title="Today's Progress"
          value={`${totalTodayCompleted}/${totalTodayItems}`}
          icon={<ShieldCheck size={20} />}
          variant="emerald"
          trend={`${progressPct}% Total Done`}
        />

        <StatCard
          title="Action Tasks"
          value={`${completedTasksTodayCount}/${todayTasks.length}`}
          icon={<CheckSquare size={20} />}
          variant="purple"
          trend={`${tasks.filter(t => t.status !== 'completed').length} Total Pending`}
        />

        <StatCard
          title="Cheers"
          value="12 Given"
          icon={<Heart size={20} />}
          variant="emerald"
          trend="3 Friends Active"
        />
      </div>

      {/* Main Grid: Habits & Tasks + Circle Activity Feed */}
      <div className="gt-dashboard-main-grid">
        {/* Left Column: Today Habits & Action Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Today's Habits */}
          <Card emeraldGlow className="gt-dash-section-card">
            <div className="gt-card-header">
              <h3 className="gt-card-title">
                <CheckCircle2 size={18} color="var(--primary-400)" /> Today's Habit Stack
              </h3>
              <Badge variant="emerald">{completedHabitsTodayCount}/{habits.length} Done</Badge>
            </div>

            <div className="gt-habit-stack">
              {habitsStats.map(({ habit, stats }) => {
                const borderStyle = stats.completedToday ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)';
                const bgStyle = stats.completedToday ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)';

                return (
                  <div
                    key={habit.id}
                    className={stats.completedToday ? 'gt-anim-habit-complete' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      backgroundColor: bgStyle,
                      border: borderStyle,
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Checkbox
                      checked={stats.completedToday}
                      onChange={() => toggleHabit(habit.id)}
                      label={habit.title}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                      <Badge variant="amber" icon={<Flame size={11} />}>{stats.currentStreak}</Badge>
                      <Badge variant={stats.completedToday ? 'emerald' : 'cyan'}>{habit.frequency || 'Daily'}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Today Tasks Widget */}
          <Card className="gt-dash-section-card">
            <div className="gt-card-header">
              <h3 className="gt-card-title">
                <CheckSquare size={18} color="var(--cyan-teal)" /> Today's Focus Action Tasks
              </h3>
              <Badge variant="cyan">{completedTasksTodayCount}/{todayTasks.length} Done</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {todayTasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks set for today.</p>
              ) : (
                todayTasks.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={isDone ? 'gt-anim-task-complete' : ''}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        backgroundColor: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isDone ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Checkbox
                        checked={isDone}
                        onChange={() => toggleTask(task)}
                        label={task.title}
                      />
                      <Badge variant={task.priority === 'high' ? 'amber' : 'neutral'} style={{ fontSize: '0.7rem' }}>
                        {task.priority}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Friend Activity Stream */}
        <Card className="gt-dash-section-card">
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <Sparkles size={18} color="var(--purple-indigo)" /> Circle Activity Feed
            </h3>
            <Badge variant="purple">Live Realtime</Badge>
          </div>

          <div className="gt-activity-feed">
            <div className="gt-activity-card">
              <div className="gt-avatar-pink">M</div>
              <div className="gt-activity-body">
                <div>
                  <strong style={{ color: 'white' }}>Maya Lin</strong> hit a <strong>30-Day Streak</strong> on Evening Journaling! 🎉
                </div>
                <div className="gt-activity-meta">
                  <span>12 mins ago</span>
                  <button
                    className={`gt-cheer-btn ${cheerCounts.fa1?.cheered ? 'cheered' : ''}`}
                    onClick={() => handleCheer('fa1', 'Maya Lin')}
                  >
                    <Heart size={13} fill={cheerCounts.fa1?.cheered ? '#ec4899' : 'none'} />
                    <span>{cheerCounts.fa1?.cheered ? 'Cheered!' : 'Cheer'} ({cheerCounts.fa1?.count})</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="gt-activity-card">
              <div className="gt-avatar-blue">D</div>
              <div className="gt-activity-body">
                <div>
                  <strong style={{ color: 'white' }}>David Chen</strong> completed <strong>Morning 5K Workout</strong> 🏃‍♂️
                </div>
                <div className="gt-activity-meta">
                  <span>45 mins ago</span>
                  <button
                    className={`gt-cheer-btn ${cheerCounts.fa2?.cheered ? 'cheered' : ''}`}
                    onClick={() => handleCheer('fa2', 'David Chen')}
                  >
                    <Heart size={13} fill={cheerCounts.fa2?.cheered ? '#ec4899' : 'none'} />
                    <span>{cheerCounts.fa2?.cheered ? 'Cheered!' : 'Cheer'} ({cheerCounts.fa2?.count})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        .gt-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .gt-welcome-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.2rem 0.625rem;
          background: var(--primary-soft);
          border: 1px solid var(--border-emerald);
          border-radius: var(--radius-full);
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--primary-300);
          margin-bottom: 0.375rem;
        }

        .gt-dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.875rem;
        }

        .gt-dashboard-title {
          font-size: 1.65rem;
          margin-bottom: 0.15rem;
        }

        .gt-dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .gt-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .gt-dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 1024px) {
          .gt-dashboard-main-grid {
            grid-template-columns: 1.2fr 1fr;
          }
        }

        .gt-habit-stack {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .gt-activity-feed {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .gt-activity-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .gt-avatar-pink {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-avatar-blue {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-activity-body {
          flex: 1;
          font-size: 0.835rem;
          line-height: 1.35;
        }

        .gt-activity-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.375rem;
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .gt-cheer-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(236, 72, 153, 0.1);
          color: #ec4899;
          border: 1px solid rgba(236, 72, 153, 0.25);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.725rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gt-cheer-btn:hover, .gt-cheer-btn.cheered {
          background: rgba(236, 72, 153, 0.25);
          border-color: #ec4899;
        }
      `}</style>
    </div>
  );
};
