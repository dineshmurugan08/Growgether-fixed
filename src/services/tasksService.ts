import { TaskItem, TaskPriority, TaskCategory, TaskStatus } from '../types';
import { format, addDays } from 'date-fns';
import { securityGuard } from './securityGuard';

const TASKS_PREFIX = 'gt_tasks_v1_';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes?: number;
  isPrivate?: boolean;
}

const SEED_TASKS: Omit<TaskItem, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: 'Finalize Q3 Personal Growth Milestones',
    description: 'Review quarterly habit consistency and set focus blocks for upcoming sprint',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    dueTime: '11:00',
    priority: 'high',
    category: 'focus',
    status: 'in_progress',
    estimatedMinutes: 45,
    isPrivate: true,
  },
  {
    title: 'Schedule Weekly Accountability Sync with Maya',
    description: 'Prepare goal progress sheet and cheer partner milestones',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    dueTime: '14:30',
    priority: 'medium',
    category: 'social',
    status: 'todo',
    estimatedMinutes: 30,
    isPrivate: true,
  },
  {
    title: 'Organize Workspace & Clear Desktop Files',
    description: 'Declutter workspace to prepare for evening focus session',
    dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    dueTime: '17:00',
    priority: 'low',
    category: 'personal',
    status: 'todo',
    estimatedMinutes: 20,
    isPrivate: true,
  },
];

export const tasksService = {
  getStorageKey(userId: string) {
    return `${TASKS_PREFIX}${userId}`;
  },

  // 1. Get all tasks for user with strict ownership verification
  getTasks(userId: string): TaskItem[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read tasks');

    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) {
        return this.seedUserTasks(userId);
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // Seed default tasks for user
  seedUserTasks(userId: string): TaskItem[] {
    securityGuard.assertOwner(userId, 'seed user tasks');

    const seeded: TaskItem[] = SEED_TASKS.map((t, i) => ({
      ...t,
      id: `t_${Date.now()}_${i}`,
      userId,
      isPrivate: true,
      createdAt: new Date().toISOString(),
    }));

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(seeded));
    return seeded;
  },

  // 2. Create Task with DEFAULT isPrivate: true
  createTask(userId: string, input: CreateTaskInput): TaskItem {
    securityGuard.assertOwner(userId, 'create task');

    const tasks = this.getTasks(userId);
    const newTask: TaskItem = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      dueDate: input.dueDate || format(new Date(), 'yyyy-MM-dd'),
      dueTime: input.dueTime,
      priority: input.priority || 'medium',
      category: input.category || 'focus',
      status: 'todo',
      estimatedMinutes: input.estimatedMinutes,
      isPrivate: input.isPrivate !== undefined ? input.isPrivate : true,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(tasks));
    return newTask;
  },

  // 3. Update Task with ownership guard
  updateTask(userId: string, taskId: string, updates: Partial<TaskItem>): TaskItem {
    securityGuard.assertOwner(userId, 'update task');

    const tasks = this.getTasks(userId);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');

    const updated = {
      ...tasks[idx],
      ...updates,
    };

    tasks[idx] = updated;
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(tasks));
    return updated;
  },

  // 4. Delete Task with ownership guard
  deleteTask(userId: string, taskId: string) {
    securityGuard.assertOwner(userId, 'delete task');

    const tasks = this.getTasks(userId).filter(t => t.id !== taskId);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(tasks));
  },

  // 5. Complete Task
  completeTask(userId: string, taskId: string): TaskItem {
    return this.updateTask(userId, taskId, { status: 'completed' });
  },

  // 6. Reopen Task
  reopenTask(userId: string, taskId: string): TaskItem {
    return this.updateTask(userId, taskId, { status: 'todo' });
  },

  // 7. Reschedule Task
  rescheduleTask(userId: string, taskId: string, newDate: string, newTime?: string): TaskItem {
    return this.updateTask(userId, taskId, {
      dueDate: newDate,
      dueTime: newTime,
    });
  },

  // 8. Get Today's tasks
  getTodayTasks(userId: string): TaskItem[] {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return this.getTasks(userId).filter(t => t.dueDate === todayStr);
  },
};

