import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsService, CreateHabitInput } from '../services/habitsService';
import { tasksService, CreateTaskInput } from '../services/tasksService';
import { plannerService, CreateBlockInput } from '../services/plannerService';
import { sharedGoalsService, CreateSharedGoalInput } from '../services/sharedGoalsService';
import { notificationsService } from '../services/notificationsService';
import { Habit, TaskItem, UnifiedPlannerItem, SharedGoal, AppNotification } from '../types';

// 1. Custom Hook for Habits
export function useHabits(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Habit[]>({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => Promise.resolve(habitsService.createHabit(userId, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ habitId, updates }: { habitId: string; updates: Partial<CreateHabitInput> }) =>
      Promise.resolve(habitsService.updateHabit(userId, habitId, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (habitId: string) => Promise.resolve(habitsService.deleteHabit(userId, habitId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  return {
    habits: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
  };
}

// 2. Custom Hook for Tasks
export function useTasks(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<TaskItem[]>({
    queryKey: ['tasks', userId],
    queryFn: () => tasksService.getTasks(userId),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => Promise.resolve(tasksService.createTask(userId, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<TaskItem> }) =>
      Promise.resolve(tasksService.updateTask(userId, taskId, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => Promise.resolve(tasksService.deleteTask(userId, taskId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner'] });
    },
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
}

// 3. Custom Hook for Planner
export function usePlanner(userId: string, dateStr: string) {
  const queryClient = useQueryClient();

  const query = useQuery<UnifiedPlannerItem[]>({
    queryKey: ['planner', userId, dateStr],
    queryFn: () => plannerService.getUnifiedItemsForDate(userId, dateStr),
    enabled: !!userId && !!dateStr,
  });

  const createBlockMutation = useMutation({
    mutationFn: (input: CreateBlockInput) => Promise.resolve(plannerService.createBlock(userId, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', userId] });
    },
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createBlock: createBlockMutation.mutateAsync,
  };
}

// 4. Custom Hook for Shared Goals
export function useSharedGoals(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<SharedGoal[]>({
    queryKey: ['sharedGoals', userId],
    queryFn: () => sharedGoalsService.getSharedGoals(userId),
    enabled: !!userId,
  });

  const createGoalMutation = useMutation({
    mutationFn: (input: CreateSharedGoalInput) => Promise.resolve(sharedGoalsService.createSharedGoal(userId, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedGoals', userId] });
    },
  });

  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createGoal: createGoalMutation.mutateAsync,
  };
}

// 5. Custom Hook for Notifications
export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<AppNotification[]>({
    queryKey: ['notifications', userId],
    queryFn: () => notificationsService.getNotifications(userId),
    enabled: !!userId,
  });

  return {
    notifications: query.data || [],
    unreadCount: (query.data || []).filter(n => !n.read).length,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
