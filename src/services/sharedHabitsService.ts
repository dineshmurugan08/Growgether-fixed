import { SharedHabit, SharedHabitMember, ParticipantProgress, Habit } from '../types';
import { habitsService } from './habitsService';
import { authService } from './authService';
import { notificationsService } from './notificationsService';
import { securityGuard } from './securityGuard';
import { format, subDays } from 'date-fns';

const SHARED_HABITS_STORAGE_KEY = 'gt_shared_habits_v1_store';

export const sharedHabitsService = {
  getStorageRecords(): SharedHabit[] {
    try {
      const raw = localStorage.getItem(SHARED_HABITS_STORAGE_KEY);
      if (!raw) return this.seedDemoSharedHabits();
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStorageRecords(records: SharedHabit[]) {
    localStorage.setItem(SHARED_HABITS_STORAGE_KEY, JSON.stringify(records));
  },

  // Pre-seed realistic demo shared habit: "Study 2 hours / Deep Reading" with Dinesh
  seedDemoSharedHabits(): SharedHabit[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    const demoShared: SharedHabit[] = [
      {
        id: 'sh_demo_101',
        creatorId: 'usr_dinesh_101',
        originalHabitId: 'h_dinesh_study',
        title: 'Study 2 hours & Deep Focus Block',
        description: 'Daily 2-hour focused learning & study block. Keep each other accountable!',
        category: 'productivity',
        frequency: 'daily',
        createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        members: [
          {
            userId: 'usr_dinesh_101',
            displayName: 'Dinesh',
            username: 'dinesh_eee',
            status: 'accepted',
            joinedAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
          },
          {
            userId: 'usr_demo_123',
            displayName: 'Alex Rivers',
            username: 'alex_grower',
            status: 'accepted',
            joinedAt: format(subDays(new Date(), 9), 'yyyy-MM-dd'),
          },
        ],
      },
    ];

    localStorage.setItem(SHARED_HABITS_STORAGE_KEY, JSON.stringify(demoShared));
    return demoShared;
  },

  // 1. Get all shared habits for user with strict ownership verification
  getSharedHabits(userId: string): SharedHabit[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read shared habits');
    const all = this.getStorageRecords();
    return all.filter(sh => sh.members.some(m => m.userId === userId));
  },

  // 2. Create Shared Habit by inviting friends to an existing habit
  createSharedHabit(creatorId: string, habitId: string, invitedFriendIds: string[]): SharedHabit {
    const creatorHabits = habitsService.getHabits(creatorId);
    const targetHabit = creatorHabits.find(h => h.id === habitId);
    if (!targetHabit) throw new Error('Original habit not found.');

    const allUsers = authService.getStoredUsers();
    const creatorUser = allUsers.find(u => u.id === creatorId);

    const members: SharedHabitMember[] = [
      {
        userId: creatorId,
        displayName: creatorUser?.displayName || 'Creator',
        username: creatorUser?.username || 'user',
        status: 'accepted',
        joinedAt: new Date().toISOString(),
      },
    ];

    // Add invited members
    invitedFriendIds.forEach(friendId => {
      const friendUser = allUsers.find(u => u.id === friendId);
      if (friendUser) {
        members.push({
          userId: friendUser.id,
          displayName: friendUser.displayName,
          username: friendUser.username,
          status: 'invited',
          joinedAt: new Date().toISOString(),
        });

        // Trigger Notification
        if (creatorUser) {
          notificationsService.addNotification({
            userId: friendUser.id,
            senderId: creatorUser.id,
            senderUsername: creatorUser.username,
            senderDisplayName: creatorUser.displayName,
            type: 'shared_goal',
            title: 'Shared Habit Invite 🤝',
            message: `${creatorUser.displayName} invited you to join shared habit "${targetHabit.title}". Keep each other going!`,
          });
        }
      }
    });

    const newShared: SharedHabit = {
      id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      creatorId,
      originalHabitId: targetHabit.id,
      title: targetHabit.title,
      description: targetHabit.description,
      category: targetHabit.category,
      frequency: targetHabit.frequency,
      members,
      createdAt: new Date().toISOString(),
    };

    const records = this.getStorageRecords();
    records.unshift(newShared);
    this.saveStorageRecords(records);
    return newShared;
  },

  // 3. Accept Shared Habit Invite
  acceptSharedHabit(userId: string, sharedHabitId: string) {
    const records = this.getStorageRecords();
    const idx = records.findIndex(sh => sh.id === sharedHabitId);
    if (idx === -1) return;

    const memberIdx = records[idx].members.findIndex(m => m.userId === userId);
    if (memberIdx !== -1) {
      records[idx].members[memberIdx].status = 'accepted';
      this.saveStorageRecords(records);

      // Auto-clone habit to accepting user's personal habit list if not existing
      const userHabits = habitsService.getHabits(userId);
      const exists = userHabits.some(h => h.title.toLowerCase() === records[idx].title.toLowerCase());

      if (!exists) {
        habitsService.createHabit(userId, {
          title: records[idx].title,
          description: records[idx].description || 'Shared accountability habit',
          category: records[idx].category,
          frequency: records[idx].frequency,
          targetDays: 7,
          reminderTime: '09:00',
          startDate: format(new Date(), 'yyyy-MM-dd'),
        });
      }

      // Notify creator
      const acceptor = authService.getStoredUsers().find(u => u.id === userId);
      if (acceptor) {
        notificationsService.addNotification({
          userId: records[idx].creatorId,
          senderId: acceptor.id,
          senderUsername: acceptor.username,
          senderDisplayName: acceptor.displayName,
          type: 'shared_goal',
          title: 'Shared Habit Accepted 🎉',
          message: `${acceptor.displayName} (@${acceptor.username}) accepted your shared habit "${records[idx].title}". You're both making progress!`,
        });
      }
    }
  },

  // 4. Leave Shared Habit
  leaveSharedHabit(userId: string, sharedHabitId: string) {
    const records = this.getStorageRecords();
    const idx = records.findIndex(sh => sh.id === sharedHabitId);
    if (idx === -1) return;

    records[idx].members = records[idx].members.filter(m => m.userId !== userId);

    // If zero members left or creator leaves, cleanup
    if (records[idx].members.length === 0 || records[idx].creatorId === userId) {
      records.splice(idx, 1);
    }

    this.saveStorageRecords(records);
  },

  // 5. Get Side-by-Side Participant Progress (Non-competitive completion rate)
  getParticipantProgress(sharedHabit: SharedHabit): ParticipantProgress[] {
    return sharedHabit.members.map(member => {
      const userHabits = habitsService.getHabits(member.userId);

      // Find user's matching habit
      let matchingHabit = userHabits.find(h => h.id === sharedHabit.originalHabitId);
      if (!matchingHabit) {
        matchingHabit = userHabits.find(h => h.title.toLowerCase() === sharedHabit.title.toLowerCase());
      }

      if (matchingHabit) {
        const stats = habitsService.getHabitStats(member.userId, matchingHabit.id);
        const completionRate = stats.completionRate || (member.userId === 'usr_dinesh_101' ? 80 : 70);
        return {
          userId: member.userId,
          displayName: member.displayName,
          username: member.username,
          status: member.status,
          completionRate: Math.max(10, Math.min(100, completionRate)),
          completedToday: stats.completedToday,
          currentStreak: stats.currentStreak || 1,
        };
      }

      // Default calculation for display
      const defaultRate = member.userId === 'usr_dinesh_101' ? 80 : 70;
      return {
        userId: member.userId,
        displayName: member.displayName,
        username: member.username,
        status: member.status,
        completionRate: defaultRate,
        completedToday: false,
        currentStreak: 1,
      };
    });
  },

  // 6. Send Encouragement for Shared Habit
  sendSharedHabitEncouragement(senderId: string, recipientUserId: string, habitTitle: string) {
    const sender = authService.getStoredUsers().find(u => u.id === senderId);
    if (sender) {
      notificationsService.addNotification({
        userId: recipientUserId,
        senderId: sender.id,
        senderUsername: sender.username,
        senderDisplayName: sender.displayName,
        type: 'encouragement',
        title: 'Shared Habit Cheer! 🔥',
        message: `${sender.displayName}: "You're both making progress! Keep each other going on '${habitTitle}'!"`,
      });
    }
  },
};
