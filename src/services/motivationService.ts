export interface MotivationalFeedback {
  title: string;
  message: string;
  type: 'task' | 'habit' | 'streak' | 'missed_day' | 'friend_progress' | 'goal';
}

export const motivationService = {
  // 1. Task completion feedback based on count completed today
  getTaskCompletionFeedback(tasksTodayCompletedCount: number): MotivationalFeedback {
    if (tasksTodayCompletedCount === 1) {
      return {
        title: 'Task Completed',
        message: 'Nice start. One step forward.',
        type: 'task',
      };
    }
    if (tasksTodayCompletedCount === 3) {
      return {
        title: 'Building Momentum',
        message: "You're building momentum.",
        type: 'task',
      };
    }
    return {
      title: 'Action Item Complete',
      message: 'Focus session accomplished. Keep going.',
      type: 'task',
    };
  },

  // 2. Habit completion feedback
  getHabitCompletionFeedback(
    completedHabitsCount: number,
    totalHabitsCount: number,
    streakCount: number
  ): MotivationalFeedback {
    // All daily habits completed
    if (totalHabitsCount > 0 && completedHabitsCount >= totalHabitsCount) {
      return {
        title: 'Daily Stack Complete',
        message: 'Day complete. You showed up for yourself.',
        type: 'habit',
      };
    }

    // 30-day streak milestone
    if (streakCount >= 30) {
      return {
        title: '30-Day Milestone 🔥',
        message: 'Thirty days. This is becoming part of you.',
        type: 'streak',
      };
    }

    // 7-day streak milestone
    if (streakCount >= 7 && streakCount < 10) {
      return {
        title: '7-Day Streak 🔥',
        message: 'Seven days of consistency.',
        type: 'streak',
      };
    }

    return {
      title: 'Habit Logged',
      message: 'Consistency fuels your growth.',
      type: 'habit',
    };
  },

  // 3. Missed day / Fresh start feedback
  getMissedDayFeedback(): MotivationalFeedback {
    return {
      title: 'Fresh Start',
      message: "Yesterday didn't go as planned. Today is a fresh start.",
      type: 'missed_day',
    };
  },

  // 4. Friend progress feedback
  getFriendProgressFeedback(friendName: string): MotivationalFeedback {
    return {
      title: 'Circle Milestone',
      message: `${friendName} made progress. Send some encouragement.`,
      type: 'friend_progress',
    };
  },
};
