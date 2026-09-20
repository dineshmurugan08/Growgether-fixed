export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  streakCount: number;
  isPrivate?: boolean;
}

export type HabitCategory = 'mindset' | 'health' | 'productivity' | 'fitness' | 'social';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type HabitLogStatus = 'completed' | 'skipped';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays: number;
  reminderTime?: string;
  startDate: string;
  isArchived: boolean;
  isPrivate?: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedDate: string;
  completedAt?: string;
  status: HabitLogStatus;
  count: number;
  notes?: string;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompleted: number;
  totalSkipped: number;
  completedToday: boolean;
  skippedToday: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'focus' | 'work' | 'personal' | 'health' | 'social';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:mm"
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  estimatedMinutes?: number;
  isPrivate?: boolean;
  createdAt: string;
}

export type PlannerCategory = 'event' | 'study' | 'personal' | 'work' | 'health';

export interface PlannerBlock {
  id: string;
  userId: string;
  title: string;
  description?: string;
  blockDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: PlannerCategory;
  completed: boolean;
  isPrivate?: boolean;
  createdAt: string;
}

export interface UnifiedPlannerItem {
  id: string;
  type: 'event' | 'habit' | 'task';
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: string;
  completed: boolean;
  priority?: string;
  streakCount?: number;
  originalId: string;
}

export interface FriendActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  actionType: 'habit_completed' | 'streak_milestone' | 'goal_achieved';
  message: string;
  timestamp: string;
  cheerCount: number;
  hasCheered?: boolean;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type FriendshipState = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked_by_me' | 'blocked_by_them';

export interface FriendshipRecord {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'friend_request' | 'friend_accepted' | 'encouragement' | 'shared_goal';

export interface AppNotification {
  id: string;
  userId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserSearchResult {
  profile: UserProfile;
  friendshipState: FriendshipState;
}

export type SharedHabitMemberStatus = 'invited' | 'accepted';

export interface SharedHabitMember {
  userId: string;
  displayName: string;
  username: string;
  status: SharedHabitMemberStatus;
  joinedAt: string;
}

export interface SharedHabit {
  id: string;
  creatorId: string;
  originalHabitId: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  members: SharedHabitMember[];
  createdAt: string;
}

export interface ParticipantProgress {
  userId: string;
  displayName: string;
  username: string;
  status: SharedHabitMemberStatus;
  completionRate: number;
  completedToday: boolean;
  currentStreak: number;
}

export type SharedGoalStatus = 'active' | 'completed' | 'archived';
export type SharedGoalMemberStatus = 'invited' | 'accepted';

export interface SharedGoalMember {
  userId: string;
  displayName: string;
  username: string;
  status: SharedGoalMemberStatus;
  joinedAt: string;
}

export interface SharedGoal {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  targetHabitTitle: string;
  targetDays: number;
  startDate: string;
  endDate: string;
  status: SharedGoalStatus;
  members: SharedGoalMember[];
  createdAt: string;
}

export interface SharedGoalParticipantProgress {
  userId: string;
  displayName: string;
  username: string;
  status: SharedGoalMemberStatus;
  daysCompleted: number;
  daysElapsed: number;
  totalTargetDays: number;
  completedToday: boolean;
  percentage: number;
}

export type EncouragementEmoji = '🔥' | '💪' | '👏' | '🌱' | '❤️';

export interface EncouragementReaction {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  recipientId: string;
  emoji: EncouragementEmoji;
  text: string;
  createdAt: string;
}

export const ENCOURAGEMENT_OPTIONS: Array<{ emoji: EncouragementEmoji; text: string; label: string }> = [
  { emoji: '🔥', text: 'Keep going', label: '🔥 Keep going' },
  { emoji: '💪', text: "You've got this", label: "💪 You've got this" },
  { emoji: '👏', text: 'Great job', label: '👏 Great job' },
  { emoji: '🌱', text: 'Keep growing', label: '🌱 Keep growing' },
  { emoji: '❤️', text: 'Proud of you', label: '❤️ Proud of you' },
];
