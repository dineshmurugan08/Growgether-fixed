import { PlannerBlock, PlannerCategory, UnifiedPlannerItem } from '../types';
import { habitsService } from './habitsService';
import { tasksService } from './tasksService';
import { format, parseISO, getDay, eachDayOfInterval } from 'date-fns';
import { securityGuard } from './securityGuard';

const PLANNER_PREFIX = 'gt_planner_events_v1_';

export interface CreateBlockInput {
  title: string;
  description?: string;
  blockDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: PlannerCategory;
  isPrivate?: boolean;
}

const SEED_BLOCKS: Omit<PlannerBlock, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: 'Deep Focus: Q3 Growth Architecture',
    description: 'Time-block for high impact system planning & code review',
    blockDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '11:00',
    category: 'work',
    completed: true,
    isPrivate: true,
  },
  {
    title: 'Algorithm & System Design Study Session',
    description: 'Review data structures, graph traversal, and dynamic programming',
    blockDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '14:00',
    endTime: '15:30',
    category: 'study',
    completed: false,
    isPrivate: true,
  },
  {
    title: 'Mindfulness Meditation & Reading',
    description: 'Evening decompression and self-reflection',
    blockDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '19:00',
    endTime: '19:45',
    category: 'personal',
    completed: false,
    isPrivate: true,
  },
];

export const plannerService = {
  getStorageKey(userId: string) {
    return `${PLANNER_PREFIX}${userId}`;
  },

  // 1. Get all blocks for user with strict ownership verification
  getBlocks(userId: string): PlannerBlock[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read planner events');

    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) {
        return this.seedUserBlocks(userId);
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // Seed default blocks
  seedUserBlocks(userId: string): PlannerBlock[] {
    securityGuard.assertOwner(userId, 'seed user planner events');

    const seeded: PlannerBlock[] = SEED_BLOCKS.map((b, i) => ({
      ...b,
      id: `pb_${Date.now()}_${i}`,
      userId,
      isPrivate: true,
      createdAt: new Date().toISOString(),
    }));

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(seeded));
    return seeded;
  },

  // 2. Create Block with DEFAULT isPrivate: true
  createBlock(userId: string, input: CreateBlockInput): PlannerBlock {
    securityGuard.assertOwner(userId, 'create planner event');

    const blocks = this.getBlocks(userId);
    const newBlock: PlannerBlock = {
      id: `pb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      blockDate: input.blockDate || format(new Date(), 'yyyy-MM-dd'),
      startTime: input.startTime || '09:00',
      endTime: input.endTime || '10:00',
      category: input.category || 'event',
      completed: false,
      isPrivate: input.isPrivate !== undefined ? input.isPrivate : true,
      createdAt: new Date().toISOString(),
    };

    blocks.push(newBlock);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(blocks));
    return newBlock;
  },

  // 3. Update Block with ownership guard
  updateBlock(userId: string, blockId: string, updates: Partial<PlannerBlock>): PlannerBlock {
    securityGuard.assertOwner(userId, 'update planner event');

    const blocks = this.getBlocks(userId);
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx === -1) throw new Error('Planner block not found');

    const updated = {
      ...blocks[idx],
      ...updates,
    };

    blocks[idx] = updated;
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(blocks));
    return updated;
  },

  // 4. Delete Block with ownership guard
  deleteBlock(userId: string, blockId: string) {
    securityGuard.assertOwner(userId, 'delete planner event');

    const blocks = this.getBlocks(userId).filter(b => b.id !== blockId);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(blocks));
  },

  // 5. Toggle Complete with ownership guard
  toggleBlockComplete(userId: string, blockId: string): PlannerBlock {
    securityGuard.assertOwner(userId, 'toggle planner event');

    const blocks = this.getBlocks(userId);
    const block = blocks.find(b => b.id === blockId);
    if (!block) throw new Error('Block not found');
    return this.updateBlock(userId, blockId, { completed: !block.completed });
  },

  // 6. Unified Resolver for Date with strict ownership verification
  getUnifiedItemsForDate(userId: string, dateStr: string): UnifiedPlannerItem[] {
    if (!userId || !dateStr) return [];
    securityGuard.assertOwner(userId, 'read planner timeline');

    const items: UnifiedPlannerItem[] = [];

    // A. Custom Planner Events
    const customBlocks = this.getBlocks(userId).filter(b => b.blockDate === dateStr);
    customBlocks.forEach(b => {
      items.push({
        id: `event_${b.id}`,
        type: 'event',
        title: b.title,
        description: b.description,
        date: b.blockDate,
        startTime: b.startTime,
        endTime: b.endTime,
        category: b.category,
        completed: b.completed,
        originalId: b.id,
      });
    });

    // B. Tasks for dateStr
    const tasks = tasksService.getTasks(userId).filter(t => t.dueDate === dateStr);
    tasks.forEach(t => {
      items.push({
        id: `task_${t.id}`,
        type: 'task',
        title: t.title,
        description: t.description,
        date: t.dueDate,
        startTime: t.dueTime || '10:00',
        endTime: t.dueTime ? undefined : '10:30',
        category: t.category,
        completed: t.status === 'completed',
        priority: t.priority,
        originalId: t.id,
      });
    });

    // C. Recurring Habits for dateStr
    const habits = habitsService.getHabits(userId);
    const dateObj = parseISO(dateStr);
    const dayOfWeek = getDay(dateObj); // 0 = Sun, 1 = Mon, ... 6 = Sat

    habits.forEach(h => {
      if (h.isArchived) return;

      // Frequency check
      let isScheduledToday = false;
      if (h.frequency === 'daily') isScheduledToday = true;
      else if (h.frequency === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) isScheduledToday = true;
      else if (h.frequency === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) isScheduledToday = true;
      else if (h.frequency === 'custom') isScheduledToday = true;

      // Start Date check
      if (h.startDate && dateStr < h.startDate) isScheduledToday = false;

      if (isScheduledToday) {
        const stats = habitsService.getHabitStats(userId, h.id);
        const logs = habitsService.getAllLogs(userId).filter(l => l.habitId === h.id);
        const logForDate = logs.find(l => l.completedDate === dateStr);
        const isCompleted = logForDate ? logForDate.status === 'completed' : false;

        items.push({
          id: `habit_${h.id}_${dateStr}`,
          type: 'habit',
          title: h.title,
          description: h.description,
          date: dateStr,
          startTime: h.reminderTime || '08:00',
          category: h.category,
          completed: isCompleted,
          streakCount: stats.currentStreak,
          originalId: h.id,
        });
      }
    });

    // Sort items chronologically by startTime
    return items.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  },

  // 7. Get Map of Unified Items for Date Range (for Week & Month view)
  getUnifiedItemsForRange(userId: string, startDateStr: string, endDateStr: string): Record<string, UnifiedPlannerItem[]> {
    const result: Record<string, UnifiedPlannerItem[]> = {};
    try {
      const days = eachDayOfInterval({
        start: parseISO(startDateStr),
        end: parseISO(endDateStr),
      });

      days.forEach(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        result[dateStr] = this.getUnifiedItemsForDate(userId, dateStr);
      });
    } catch {
      // Fallback
    }

    return result;
  },
};
