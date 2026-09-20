import { AppNotification, NotificationType } from '../types';
import { securityGuard } from './securityGuard';

const NOTIFICATIONS_PREFIX = 'gt_notifications_v1_';

export interface CreateNotificationInput {
  userId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  type: NotificationType;
  title: string;
  message: string;
}

export const notificationsService = {
  getStorageKey(userId: string) {
    return `${NOTIFICATIONS_PREFIX}${userId}`;
  },

  // 1. Get all notifications for user with strict ownership verification
  getNotifications(userId: string): AppNotification[] {
    if (!userId) return [];
    securityGuard.assertOwner(userId, 'read notifications');

    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];
      const list: AppNotification[] = JSON.parse(raw);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  // 2. Get unread count
  getUnreadCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  },

  // 3. Add Notification (System or Friend event)
  addNotification(input: CreateNotificationInput): AppNotification {
    // Read direct storage without calling getNotifications ownership check so background events can trigger notifications safely
    let notifications: AppNotification[] = [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(input.userId));
      if (raw) notifications = JSON.parse(raw);
    } catch {}

    const newNotif: AppNotification = {
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: input.userId,
      senderId: input.senderId,
      senderUsername: input.senderUsername,
      senderDisplayName: input.senderDisplayName,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    localStorage.setItem(this.getStorageKey(input.userId), JSON.stringify(notifications));
    return newNotif;
  },

  // 4. Mark single notification as read with ownership check
  markAsRead(userId: string, notificationId: string) {
    securityGuard.assertOwner(userId, 'update notification status');
    const notifications = this.getNotifications(userId);
    const idx = notifications.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      notifications[idx].read = true;
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(notifications));
    }
  },

  // 5. Mark all as read with ownership check
  markAllAsRead(userId: string) {
    securityGuard.assertOwner(userId, 'update notification status');
    const notifications = this.getNotifications(userId).map(n => ({ ...n, read: true }));
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(notifications));
  },
};
