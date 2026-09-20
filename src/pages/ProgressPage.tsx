import React, { useState, useEffect } from 'react';
import { Card, StatCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SharedGoal } from '../types';
import { sharedGoalsService } from '../services/sharedGoalsService';
import { analyticsService, DailyMetrics, WeeklyMetrics, MonthlyMetrics } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { SharedGoalCard } from '../components/goals/SharedGoalCard';
import { CreateGoalModal } from '../components/goals/CreateGoalModal';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import { ConsistencyChart } from '../components/analytics/ConsistencyChart';
import {
  Flame,
  Trophy,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Plus,
  CheckSquare,
  Sun,
  Activity,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(7);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastStreak, setToastStreak] = useState<number>(1);

  // Metrics state
  const [daily, setDaily] = useState<DailyMetrics>({
    tasksCompleted: 0,
    tasksTotal: 0,
    habitsCompleted: 0,
    habitsTotal: 0,
    completionPercentage: 0,
  });
  const [weekly, setWeekly] = useState<WeeklyMetrics>({
    habitConsistencyPercentage: 0,
    tasksCompletedCount: 0,
    currentStreak: 0,
  });
  const [monthly, setMonthly] = useState<MonthlyMetrics>({
    completionPercentage: 0,
    bestStreak: 0,
    totalHabitsCompleted: 0,
    totalTasksCompleted: 0,
  });

  const loadData = () => {
    if (!userId) return;
    const goals = sharedGoalsService.getSharedGoals(userId);
    setSharedGoals(goals);

    setDaily(analyticsService.getDailyMetrics(userId));
    setWeekly(analyticsService.getWeeklyMetrics(userId));
    setMonthly(analyticsService.getMonthlyMetrics(userId));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const trendData = analyticsService.getTrendChartData(userId, timeframe);

  const heatmapItems = Array.from({ length: 28 }).map((_, i) => {
    const opacity = i % 5 === 0 ? 0.2 : i % 3 === 0 ? 0.8 : i % 2 === 0 ? 1.0 : 0.5;
    const dayNum = i + 1;
    const textColor = opacity > 0.5 ? '#ffffff' : '#64748b';
    const bg = 'rgba(16, 185, 129, ' + opacity + ')';
    return (
      <div
        key={dayNum}
        style={{
          aspectRatio: '1',
          borderRadius: '6px',
          backgroundColor: bg,
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          color: textColor,
          fontWeight: 600,
        }}
      >
        {dayNum}
      </div>
    );
  });

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
            <BarChart3 size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '1.85rem' }}>Analytics & Progress</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Clean visual feedback on your daily momentum, weekly consistency, and long-term milestones.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsGoalModalOpen(true)}
        >
          Create Shared Goal 🎯
        </Button>
      </header>

      {/* Consistency Trend Chart (7, 30, 90 Days switcher) */}
      <ConsistencyChart
        data={trendData}
        timeframeDays={timeframe}
        onTimeframeChange={days => setTimeframe(days)}
      />

      {/* 1. DAILY SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sun size={20} color="var(--amber-gold)" /> DAILY Overview
          </h2>
          <Badge variant="amber">Today's Progress</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Tasks Completed"
            value={`${daily.tasksCompleted} / ${daily.tasksTotal}`}
            icon={<CheckSquare size={22} />}
            variant="emerald"
            trend={daily.tasksTotal > 0 ? `${Math.round((daily.tasksCompleted / daily.tasksTotal) * 100)}% of today's plan` : 'No tasks for today'}
          />

          <StatCard
            title="Habits Completed"
            value={`${daily.habitsCompleted} / ${daily.habitsTotal}`}
            icon={<CheckCircle2 size={22} />}
            variant="emerald"
            trend={daily.habitsTotal > 0 ? `${Math.round((daily.habitsCompleted / daily.habitsTotal) * 100)}% done today` : 'No active habits'}
          />

          <StatCard
            title="Daily Completion Rate"
            value={`${daily.completionPercentage}%`}
            icon={<Activity size={22} />}
            variant="emerald"
            trend="Combined Habits + Tasks"
          />
        </div>
      </section>

      {/* 2. WEEKLY SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary-400)" /> WEEKLY Performance
          </h2>
          <Badge variant="emerald">Last 7 Days</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Habit Consistency"
            value={`${weekly.habitConsistencyPercentage}%`}
            icon={<Target size={22} />}
            variant="emerald"
            trend="7-day completion rate"
          />

          <StatCard
            title="Tasks Completed"
            value={`${weekly.tasksCompletedCount}`}
            icon={<CheckSquare size={22} />}
            variant="emerald"
            trend="In past 7 days"
          />

          <StatCard
            title="Current Streak"
            value={`${weekly.currentStreak} Days`}
            icon={<Flame size={22} />}
            variant="amber"
            trend="Active streak count"
          />
        </div>
      </section>

      {/* 3. MONTHLY SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--purple-indigo)" /> MONTHLY Summary
          </h2>
          <Badge variant="purple">30-Day Metrics</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Completion Percentage"
            value={`${monthly.completionPercentage}%`}
            icon={<Activity size={22} />}
            variant="purple"
            trend="Overall monthly rate"
          />

          <StatCard
            title="Best Streak"
            value={`${monthly.bestStreak} Days`}
            icon={<Flame size={22} />}
            variant="amber"
            trend="Personal record"
          />

          <StatCard
            title="Total Habits Completed"
            value={`${monthly.totalHabitsCompleted}`}
            icon={<Target size={22} />}
            variant="emerald"
            trend="30-day aggregate"
          />

          <StatCard
            title="Total Tasks Completed"
            value={`${monthly.totalTasksCompleted}`}
            icon={<Award size={22} />}
            variant="emerald"
            trend="30-day aggregate"
          />
        </div>
      </section>

      {/* Shared Goals Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--purple-indigo)" /> Circle Shared Goals ({sharedGoals.length})
          </h2>
          <Badge variant="purple">Milestone Challenges</Badge>
        </div>

        {sharedGoals.length === 0 ? (
          <Card style={{ padding: '2.5rem', textAlign: 'center' }}>
            <Target size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>No active shared goals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Launch a 30-day consistency challenge with friends to build daily focus together.
            </p>
            <Button icon={<Plus size={16} />} onClick={() => setIsGoalModalOpen(true)}>
              Create Shared Goal
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sharedGoals.map(goal => (
              <SharedGoalCard
                key={goal.id}
                goal={goal}
                currentUserId={userId}
                onRefresh={loadData}
                onSendToast={msg => setToastMessage(msg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Heatmap Preview & Milestones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
        <Card>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <Calendar size={18} color="var(--primary-400)" /> Monthly Consistency Heatmap
            </h3>
            <Badge variant="emerald">September 2026</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginTop: '1rem' }}>
            {heatmapItems}
          </div>
        </Card>

        {/* Milestones Card */}
        <Card>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <Award size={18} color="var(--amber-gold)" /> Self-Growth Milestones
            </h3>
            <Badge variant="amber">Unlocked Badges</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--amber-soft)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-gold)', fontWeight: 800 }}>
                🔥
              </div>
              <div>
                <strong style={{ fontSize: '0.925rem' }}>Two Weeks of Fire</strong>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Completed 14 consecutive daily check-ins</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--purple-soft)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-indigo)', fontWeight: 800 }}>
                🤝
              </div>
              <div>
                <strong style={{ fontSize: '0.925rem' }}>Circle Champion</strong>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Sent 25 supportive cheers to accountability partners</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onGoalCreated={loadData}
      />

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
      `}</style>
    </div>
  );
};
