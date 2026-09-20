import { UserProfile, FriendshipRecord, FriendshipState, UserSearchResult, FriendActivity } from '../types';
import { authService, hashPassword } from './authService';
import { notificationsService } from './notificationsService';
import { securityGuard } from './securityGuard';

const FRIENDSHIPS_STORAGE_KEY = 'gt_friendships_v1_store';

const SEED_FRIEND_PROFILES: Array<UserProfile & { passwordHash: string }> = [
  {
    id: 'usr_dinesh_101',
    username: 'dinesh_eee',
    displayName: 'Dinesh',
    bio: 'Electrical Engineering & Daily Productivity Explorer ⚡',
    streakCount: 18,
    passwordHash: '',
  },
  {
    id: 'usr_maya_102',
    username: 'maya_grows',
    displayName: 'Maya Lin',
    bio: 'Mindfulness, Journaling & Sustainable Growth 🌱',
    streakCount: 30,
    passwordHash: '',
  },
  {
    id: 'usr_david_103',
    username: 'david_chen',
    displayName: 'David Chen',
    bio: 'Marathon Runner & Morning Habit Enthusiast 🏃‍♂️',
    streakCount: 22,
    passwordHash: '',
  },
  {
    id: 'usr_sophia_104',
    username: 'sophia_t',
    displayName: 'Sophia Taylor',
    bio: 'Deep Focus & Reading Goals 📚',
    streakCount: 12,
    passwordHash: '',
  },
];

export const friendsService = {
  // Ensure demo accounts (like dinesh_eee) exist in registered user pool
  async ensureSeedAccounts() {
    const existing = authService.getStoredUsers();
    let updated = false;

    for (const seedProfile of SEED_FRIEND_PROFILES) {
      const exists = existing.some(u => u.username.toLowerCase() === seedProfile.username.toLowerCase());
      if (!exists) {
        const passwordHash = await hashPassword('password123');
        existing.push({ ...seedProfile, passwordHash });
        updated = true;
      }
    }

    if (updated) {
      authService.saveUsers(existing);
    }
  },

  getFriendshipRecords(): FriendshipRecord[] {
    try {
      const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveFriendshipRecords(records: FriendshipRecord[]) {
    localStorage.setItem(FRIENDSHIPS_STORAGE_KEY, JSON.stringify(records));
  },

  // 1. Compute Friendship State between User A and User B
  getFriendshipState(userId: string, targetUserId: string): FriendshipState {
    if (userId === targetUserId) return 'none';
    const records = this.getFriendshipRecords();
    const record = records.find(
      r => (r.requesterId === userId && r.receiverId === targetUserId) ||
           (r.requesterId === targetUserId && r.receiverId === userId)
    );

    if (!record) return 'none';

    if (record.status === 'blocked') {
      return record.blockedBy === userId ? 'blocked_by_me' : 'blocked_by_them';
    }

    if (record.status === 'accepted') {
      return 'accepted';
    }

    if (record.status === 'pending') {
      return record.requesterId === userId ? 'pending_sent' : 'pending_received';
    }

    return 'none';
  },

  // 2. Search registered users by User ID (username) or display name
  async searchUsers(currentUserId: string, query: string): Promise<UserSearchResult[]> {
    securityGuard.assertOwner(currentUserId, 'search users');
    await this.ensureSeedAccounts();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const allUsers = authService.getStoredUsers();
    
    // Filter users: exclude current user and password hashes
    const matches = allUsers.filter(u =>
      u.id !== currentUserId &&
      (u.username.toLowerCase().includes(cleanQuery) || u.displayName.toLowerCase().includes(cleanQuery))
    );

    return matches.map(u => {
      // Strip password hash for strict security
      const publicProfile = securityGuard.sanitizeProfile(u);
      const state = this.getFriendshipState(currentUserId, u.id);
      return {
        profile: publicProfile,
        friendshipState: state,
      };
    });
  },

  // 3. Send Friend Request with ownership guard
  sendFriendRequest(senderId: string, targetUserId: string) {
    securityGuard.assertOwner(senderId, 'send friend request');
    if (senderId === targetUserId) return;
    const records = this.getFriendshipRecords();

    // Check existing
    const existingIdx = records.findIndex(
      r => (r.requesterId === senderId && r.receiverId === targetUserId) ||
           (r.requesterId === targetUserId && r.receiverId === senderId)
    );

    const now = new Date().toISOString();

    if (existingIdx !== -1) {
      records[existingIdx] = {
        ...records[existingIdx],
        requesterId: senderId,
        receiverId: targetUserId,
        status: 'pending',
        updatedAt: now,
      };
    } else {
      records.push({
        id: `fs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        requesterId: senderId,
        receiverId: targetUserId,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
    }

    this.saveFriendshipRecords(records);

    // Fetch sender profile info for notification
    const sender = authService.getStoredUsers().find(u => u.id === senderId);
    if (sender) {
      notificationsService.addNotification({
        userId: targetUserId,
        senderId: sender.id,
        senderUsername: sender.username,
        senderDisplayName: sender.displayName,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${sender.displayName} (@${sender.username}) sent you an accountability friend request!`,
      });
    }
  },

  // 4. Accept Friend Request
  acceptFriendRequest(receiverId: string, requesterId: string) {
    const records = this.getFriendshipRecords();
    const idx = records.findIndex(
      r => r.requesterId === requesterId && r.receiverId === receiverId && r.status === 'pending'
    );

    if (idx !== -1) {
      records[idx].status = 'accepted';
      records[idx].updatedAt = new Date().toISOString();
      this.saveFriendshipRecords(records);

      // Trigger Notification to requester
      const receiver = authService.getStoredUsers().find(u => u.id === receiverId);
      if (receiver) {
        notificationsService.addNotification({
          userId: requesterId,
          senderId: receiver.id,
          senderUsername: receiver.username,
          senderDisplayName: receiver.displayName,
          type: 'friend_accepted',
          title: 'Friend Request Accepted 🎉',
          message: `${receiver.displayName} (@${receiver.username}) accepted your friend request! You can now grow together.`,
        });
      }
    }
  },

  // 5. Reject Friend Request
  rejectFriendRequest(receiverId: string, requesterId: string) {
    const records = this.getFriendshipRecords().filter(
      r => !(r.requesterId === requesterId && r.receiverId === receiverId && r.status === 'pending')
    );
    this.saveFriendshipRecords(records);
  },

  // 6. Remove Friend
  removeFriend(userId: string, friendId: string) {
    const records = this.getFriendshipRecords().filter(
      r => !((r.requesterId === userId && r.receiverId === friendId) ||
             (r.requesterId === friendId && r.receiverId === userId))
    );
    this.saveFriendshipRecords(records);
  },

  // 7. Block User
  blockUser(userId: string, targetUserId: string) {
    const records = this.getFriendshipRecords();
    const idx = records.findIndex(
      r => (r.requesterId === userId && r.receiverId === targetUserId) ||
           (r.requesterId === targetUserId && r.receiverId === userId)
    );

    const now = new Date().toISOString();

    if (idx !== -1) {
      records[idx].status = 'blocked';
      records[idx].blockedBy = userId;
      records[idx].updatedAt = now;
    } else {
      records.push({
        id: `fs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        requesterId: userId,
        receiverId: targetUserId,
        status: 'blocked',
        blockedBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    this.saveFriendshipRecords(records);
  },

  // 8. Unblock User
  unblockUser(userId: string, targetUserId: string) {
    const records = this.getFriendshipRecords().filter(
      r => !(r.status === 'blocked' && r.blockedBy === userId &&
             ((r.requesterId === userId && r.receiverId === targetUserId) ||
              (r.requesterId === targetUserId && r.receiverId === userId)))
    );
    this.saveFriendshipRecords(records);
  },

  // 9. Get Accepted Friends Roster for user
  getFriendsList(userId: string): UserProfile[] {
    const records = this.getFriendshipRecords().filter(
      r => r.status === 'accepted' && (r.requesterId === userId || r.receiverId === userId)
    );

    const allUsers = authService.getStoredUsers();
    const friendIds = records.map(r => (r.requesterId === userId ? r.receiverId : r.requesterId));

    return allUsers
      .filter(u => friendIds.includes(u.id))
      .map(({ passwordHash: _, ...publicProfile }) => publicProfile);
  },

  // 10. Get Pending Incoming Requests
  getPendingRequests(userId: string): Array<{ record: FriendshipRecord; requester: UserProfile }> {
    const records = this.getFriendshipRecords().filter(
      r => r.status === 'pending' && r.receiverId === userId
    );

    const allUsers = authService.getStoredUsers();

    return records.map(record => {
      const u = allUsers.find(user => user.id === record.requesterId);
      const requesterProfile: UserProfile = u
        ? { id: u.id, username: u.username, displayName: u.displayName, bio: u.bio, streakCount: u.streakCount }
        : { id: record.requesterId, username: 'user', displayName: 'Accountability Member', streakCount: 1 };
      
      return {
        record,
        requester: requesterProfile,
      };
    });
  },

  // 11. Send Encouragement / Cheer Notification to a friend
  sendEncouragement(senderId: string, friendId: string, message: string = 'Sent you a high-five cheer! Keep growing! 🔥') {
    const sender = authService.getStoredUsers().find(u => u.id === senderId);
    if (sender) {
      notificationsService.addNotification({
        userId: friendId,
        senderId: sender.id,
        senderUsername: sender.username,
        senderDisplayName: sender.displayName,
        type: 'encouragement',
        title: 'Accountability Cheer Received! 🔥',
        message: `${sender.displayName} (@${sender.username}): "${message}"`,
      });
    }
  },

  // Mock Feed Activities
  async getActivities(): Promise<FriendActivity[]> {
    return Promise.resolve([
      {
        id: 'fa1',
        userId: 'usr_maya_102',
        userName: 'Maya Lin',
        actionType: 'streak_milestone',
        message: 'Hit a 30-Day Streak on Evening Journaling! 🎉',
        timestamp: '10 mins ago',
        cheerCount: 5,
        hasCheered: true,
      },
      {
        id: 'fa2',
        userId: 'usr_david_103',
        userName: 'David Chen',
        actionType: 'habit_completed',
        message: 'Completed Morning 5K Workout 🏃‍♂️',
        timestamp: '45 mins ago',
        cheerCount: 3,
        hasCheered: false,
      },
    ]);
  },
};
