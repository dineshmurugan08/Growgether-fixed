import { Habit, HabitLog, HabitStats, HabitCategory, HabitFrequency } from '../types';
import { format, subDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { securityGuard } from './securityGuard';

const HABITS_PREFIX = 'gt_habits_v1_';
const LOGS_PREFIX = 'gt_habit_logs_v1_';

export interface CreateHabitInput {
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays: number;
  reminderTime?: string;
  startDate: string;
  isPrivate?: boolean;
}

// Initial seed habits created for new users
const SEED_HABITS: Omit<Habit, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: 'Morning Mindfulness & Breathwork',
    description: '10 minutes of guided meditation after waking up',
    category: 'mindset',
    frequency: 'daily',
    targetDays: 7,
    reminderTime: '08:00',
    startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    isArchived: false,
    isPrivate: true,
  },
  {
    title: 'Hydrate 2.5L Water Goal',
    description: 'Track daily water intake across 8 glasses',
    category: 'health',
    frequency: 'daily',
    targetDays: 7,
    reminderTime: '09:00',
    startDate: format(subDays(new Date(), 21), 'yyyy-MM-dd'),
    isArchived: false,
    isPrivate: true,
  },
  {
    title: '30 Min Deep Focus Reading',
    description: 'Read non-fiction, philosophy, or technical books',
    category: 'productivity',
    frequency: 'daily',
    targetDays: 5,
    reminderTime: '15:00',
    startDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    isArchived: false,
    isPrivate: true,
  },
];

export const habitsService = {
  // Helper: Storage keys per user
  getHabitsKey(userId: string) {
    return `${HABITS_PREFIX}${userId}`;
  },
  getLogsKey(userId: string) {
    return `${LOGS_PREFIX}${userId}`;
  },

  // 1. Get Habits for user with strict ownership verification
  getHabits(userId: string): Habit[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read habits');

    try {
      const raw = localStorage.getItem(this.getHabitsKey(userId));
      if (!raw) {
        // Seed default habits for this user if first time
        return this.seedUserHabits(userId);
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // Seed default habits
  seedUserHabits(userId: string): Habit[] {
    securityGuard.assertOwner(userId, 'seed user habits');
    const seeded: Habit[] = SEED_HABITS.map((h, i) => ({
      ...h,
      id: `h_${Date.now()}_${i}`,
      userId,
      isPrivate: true,
      createdAt: new Date().toISOString(),
    }));

    // Save habits
    localStorage.setItem(this.getHabitsKey(userId), JSON.stringify(seeded));

    // Seed past logs for realistic streak initialization
    const seedLogs: HabitLog[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    // Seed Habit 1 (14 day streak)
    for (let d = 0; d <= 14; d++) {
      const logDate = format(subDays(new Date(), d), 'yyyy-MM-dd');
      seedLogs.push({
        id: `l_${Date.now()}_h0_${d}`,
        habitId: seeded[0].id,
        userId,
        completedDate: logDate,
        status: 'completed',
        count: 1,
      });
    }

    // Seed Habit 2 (21 day streak)
    for (let d = 0; d <= 21; d++) {
      const logDate = format(subDays(new Date(), d), 'yyyy-MM-dd');
      seedLogs.push({
        id: `l_${Date.now()}_h1_${d}`,
        habitId: seeded[1].id,
        userId,
        completedDate: logDate,
        status: 'completed',
        count: 1,
      });
    }

    localStorage.setItem(this.getLogsKey(userId), JSON.stringify(seedLogs));
    return seeded;
  },

  // 2. Create Habit with DEFAULT isPrivate: true
  createHabit(userId: string, input: CreateHabitInput): Habit {
    securityGuard.assertOwner(userId, 'create habit');

    const habits = this.getHabits(userId);
    const newHabit: Habit = {
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      category: input.category,
      frequency: input.frequency,
      targetDays: input.targetDays || 7,
      reminderTime: input.reminderTime,
      startDate: input.startDate || format(new Date(), 'yyyy-MM-dd'),
      isArchived: false,
      isPrivate: input.isPrivate !== undefined ? input.isPrivate : true,
      createdAt: new Date().toISOString(),
    };

    habits.unshift(newHabit);
    localStorage.setItem(this.getHabitsKey(userId), JSON.stringify(habits));
    return newHabit;
  },

  // 3. Update Habit with ownership guard
  updateHabit(userId: string, habitId: string, updates: Partial<CreateHabitInput>): Habit {
    securityGuard.assertOwner(userId, 'update habit');

    const habits = this.getHabits(userId);
    const idx = habits.findIndex(h => h.id === habitId);
    if (idx === -1) throw new Error('Habit not found');

    const updated = {
      ...habits[idx],
      ...updates,
    };

    habits[idx] = updated;
    localStorage.setItem(this.getHabitsKey(userId), JSON.stringify(habits));
    return updated;
  },

  // 4. Delete Habit with ownership guard
  deleteHabit(userId: string, habitId: string) {
    securityGuard.assertOwner(userId, 'delete habit');

    const habits = this.getHabits(userId).filter(h => h.id !== habitId);
    localStorage.setItem(this.getHabitsKey(userId), JSON.stringify(habits));

    // Delete associated logs
    const logs = this.getAllLogs(userId).filter(l => l.habitId !== habitId);
    localStorage.setItem(this.getLogsKey(userId), JSON.stringify(logs));
  },

  // 5. Get All Logs for user with ownership guard
  getAllLogs(userId: string): HabitLog[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read habit logs');

    try {
      const raw = localStorage.getItem(this.getLogsKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // 6. Log Habit (Complete / Skip / Toggle)
  toggleHabitLog(
    userId: string,
    habitId: string,
    dateStr: string = format(new Date(), 'yyyy-MM-dd'),
    targetStatus: 'completed' | 'skipped' = 'completed'
  ): { log: HabitLog | null; action: 'completed' | 'skipped' | 'cleared' } {
    const logs = this.getAllLogs(userId);
    const existingIdx = logs.findIndex(l => l.habitId === habitId && l.completedDate === dateStr);

    let action: 'completed' | 'skipped' | 'cleared' = targetStatus;
    let resultLog: HabitLog | null = null;

    if (existingIdx !== -1) {
      const existing = logs[existingIdx];
      if (existing.status === targetStatus) {
        // Toggle off / clear log
        logs.splice(existingIdx, 1);
        action = 'cleared';
      } else {
        // Switch from completed <-> skipped
        logs[existingIdx].status = targetStatus;
        logs[existingIdx].completedAt = new Date().toISOString();
        resultLog = logs[existingIdx];
      }
    } else {
      // Create new log entry
      resultLog = {
        id: `l_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        habitId,
        userId,
        completedDate: dateStr,
        status: targetStatus,
        count: 1,
      };
      logs.push(resultLog);
    }

    localStorage.setItem(this.getLogsKey(userId), JSON.stringify(logs));
    return { log: resultLog, action };
  },

  // 7. Calculate Habit Stats & Streaks Engine
  getHabitStats(userId: string, habitId: string): HabitStats {
    const logs = this.getAllLogs(userId).filter(l => l.habitId === habitId);
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const todayLog = logs.find(l => l.completedDate === todayStr);
    const completedToday = todayLog?.status === 'completed';
    const skippedToday = todayLog?.status === 'skipped';

    const completedLogs = logs.filter(l => l.status === 'completed');
    const skippedLogs = logs.filter(l => l.status === 'skipped');

    // Set of completed dates
    const completedDatesSet = new Set(completedLogs.map(l => l.completedDate));
    const skippedDatesSet = new Set(skippedLogs.map(l => l.completedDate));

    // Calculate Current Streak
    let currentStreak = 0;
    let checkDate = new Date();

    // If today is not logged yet, start checking from yesterday without breaking current streak
    if (!completedDatesSet.has(todayStr) && !skippedDatesSet.has(todayStr)) {
      checkDate = subDays(new Date(), 1);
    }

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (completedDatesSet.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (skippedDatesSet.has(dateStr)) {
        // Skipped day preserves streak count without incrementing
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate Best Streak historically
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Sort all dates chronologically
    const allLoggedDates = Array.from(
      new Set([...completedLogs.map(l => l.completedDate), ...skippedLogs.map(l => l.completedDate)])
    ).sort();

    for (const dStr of allLoggedDates) {
      if (completedDatesSet.has(dStr)) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else if (!skippedDatesSet.has(dStr)) {
        tempStreak = 0;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Calculate Completion Rate (Last 30 days)
    let last30DaysCompleted = 0;
    for (let d = 0; d < 30; d++) {
      const dStr = format(subDays(new Date(), d), 'yyyy-MM-dd');
      if (completedDatesSet.has(dStr)) {
        last30DaysCompleted++;
      }
    }
    const completionRate = Math.round((last30DaysCompleted / 30) * 100);

    return {
      currentStreak,
      bestStreak,
      completionRate,
      totalCompleted: completedLogs.length,
      totalSkipped: skippedLogs.length,
      completedToday,
      skippedToday,
    };
  },
};
