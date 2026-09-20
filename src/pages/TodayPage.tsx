import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Checkbox } from '../components/common/Input';
import { habitsService } from '../services/habitsService';
import { tasksService } from '../services/tasksService';
import { motivationService } from '../services/motivationService';
import { Habit, TaskItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import { Sun, CheckCircle2, Flame, Clock, Sparkles, CheckSquare, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const TodayPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showFreshStartBanner, setShowFreshStartBanner] = useState<boolean>(true);
  
  // Toast state
  const [toastInfo, setToastInfo] = useState<{ show: boolean; title?: string; message: string; type?: any; streak?: number }>({
    show: false,
    message: '',
  });

  const loadData = () => {
    if (!userId) return;
    const userHabits = habitsService.getHabits(userId);
    const todayTasks = tasksService.getTodayTasks(userId);
    setHabits(userHabits);
    setTasks(todayTasks);
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
      const completedHabitsCount = habitsStats.filter(s => s.completedToday).length + 1;

      // Evaluate contextual habit feedback
      const feedback = motivationService.getHabitCompletionFeedback(
        completedHabitsCount,
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

      const todayCompletedCount = tasks.filter(t => t.status === 'completed').length + 1;
      const feedback = motivationService.getTaskCompletionFeedback(todayCompletedCount);

      setToastInfo({
        show: true,
        title: feedback.title,
        message: feedback.message,
        type: feedback.type,
      });
    }
  };

  const habitsStats = habits.map(h => ({
    habit: h,
    stats: habitsService.getHabitStats(userId, h.id),
  }));

  const completedHabitsCount = habitsStats.filter(item => item.stats.completedToday).length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  const totalItems = habits.length + tasks.length;
  const totalCompleted = completedHabitsCount + completedTasksCount;
  const progressPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="gt-page">
      {/* Toast Notification */}
      {toastInfo.show && (
        <MotivationalToast
          title={toastInfo.title}
          message={toastInfo.message}
          type={toastInfo.type}
          streakCount={toastInfo.streak}
          onClose={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}

      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sun size={24} color="var(--amber-gold)" />
            <h1 style={{ fontSize: '1.85rem' }}>Today Focus</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Single-day habits & task execution engine
          </p>
        </div>
      </header>

      {/* Contextual Missed Day Banner: "Yesterday didn't go as planned. Today is a fresh start." */}
      {showFreshStartBanner && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Sun size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>🌅 Fresh Start</div>
              <div style={{ fontSize: '0.835rem', color: 'var(--text-secondary)' }}>
                "Yesterday didn't go as planned. Today is a fresh start."
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowFreshStartBanner(false)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Progress Ring Banner */}
      <Card emeraldGlow style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Badge variant="emerald" icon={<Sparkles size={12} />}>Daily Commitment Ring</Badge>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {totalCompleted} of {totalItems} Daily Commitments Done
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {completedHabitsCount} habits completed • {completedTasksCount} tasks completed. Keep building momentum!
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: `conic-gradient(var(--primary-500) ${progressPct}%, rgba(255,255,255,0.1) 0%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>
                {progressPct}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Today's Habits Stack */}
        <Card>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <CheckCircle2 size={18} color="var(--primary-400)" /> Today Habits
            </h3>
            <Badge variant="emerald">{completedHabitsCount}/{habits.length} Done</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {habitsStats.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>No habits scheduled for today.</p>
            ) : (
              habitsStats.map(({ habit, stats }) => {
                const itemBorder = stats.completedToday ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)';
                const itemBg = stats.completedToday ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)';
                return (
                  <div
                    key={habit.id}
                    className={`gt-habit-item-row ${stats.completedToday ? 'gt-anim-habit-complete' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: itemBg,
                      border: itemBorder,
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Checkbox
                      checked={stats.completedToday}
                      onChange={() => toggleHabit(habit.id)}
                      label={habit.title}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <Badge variant="amber" className="gt-anim-streak-milestone" icon={<Flame size={12} />}>
                        {stats.currentStreak} Days
                      </Badge>
                      <Badge variant={stats.completedToday ? 'emerald' : 'cyan'}>
                        {habit.reminderTime ? `${habit.reminderTime}` : 'Daily'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Today's Action Items Tasks */}
        <Card>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <CheckSquare size={18} color="var(--cyan-teal)" /> Today Action Tasks
            </h3>
            <Badge variant="cyan">{completedTasksCount}/{tasks.length} Done</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>No action items due today.</p>
            ) : (
              tasks.map(task => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`gt-task-item-row ${isDone ? 'gt-anim-task-complete' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isDone ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Checkbox
                      checked={isDone}
                      onChange={() => toggleTask(task)}
                      label={task.title}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <Badge variant={task.priority === 'high' ? 'amber' : task.priority === 'medium' ? 'purple' : 'neutral'}>
                        {task.priority}
                      </Badge>
                      {task.dueTime && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
      `}</style>
    </div>
  );
};
