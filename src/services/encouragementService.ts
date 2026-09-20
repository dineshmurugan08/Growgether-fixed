import { EncouragementReaction, EncouragementEmoji, ENCOURAGEMENT_OPTIONS } from '../types';
import { authService } from './authService';
import { notificationsService } from './notificationsService';
import { format, subMinutes, subHours } from 'date-fns';

const ENCOURAGEMENTS_STORAGE_KEY = 'gt_encouragements_v1_store';

export const encouragementService = {
  getStorageRecords(): EncouragementReaction[] {
    try {
      const raw = localStorage.getItem(ENCOURAGEMENTS_STORAGE_KEY);
      if (!raw) return this.seedDemoEncouragements();
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStorageRecords(records: EncouragementReaction[]) {
    localStorage.setItem(ENCOURAGEMENTS_STORAGE_KEY, JSON.stringify(records));
  },

  // Seed demo initial encouragements
  seedDemoEncouragements(): EncouragementReaction[] {
    const demo: EncouragementReaction[] = [
      {
        id: 'enc_demo_1',
        senderId: 'usr_dinesh_101',
        senderUsername: 'dinesh_eee',
        senderDisplayName: 'Dinesh',
        recipientId: 'usr_demo_123',
        emoji: '🔥',
        text: 'Keep going',
        createdAt: subMinutes(new Date(), 15).toISOString(),
      },
      {
        id: 'enc_demo_2',
        senderId: 'usr_maya_102',
        senderUsername: 'maya_grows',
        senderDisplayName: 'Maya Lin',
        recipientId: 'usr_demo_123',
        emoji: '❤️',
        text: 'Proud of you',
        createdAt: subHours(new Date(), 1).toISOString(),
      },
    ];

    localStorage.setItem(ENCOURAGEMENTS_STORAGE_KEY, JSON.stringify(demo));
    return demo;
  },

  // 1. Send Encouragement reaction
  sendEncouragement(
    senderId: string,
    recipientId: string,
    emoji: EncouragementEmoji,
    text: string
  ): EncouragementReaction {
    const allUsers = authService.getStoredUsers();
    const sender = allUsers.find(u => u.id === senderId);

    const newEnc: EncouragementReaction = {
      id: `enc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderUsername: sender?.username || 'user',
      senderDisplayName: sender?.displayName || 'Partner',
      recipientId,
      emoji,
      text,
      createdAt: new Date().toISOString(),
    };

    const records = this.getStorageRecords();
    records.unshift(newEnc);
    this.saveStorageRecords(records);

    // Notify recipient
    if (sender) {
      notificationsService.addNotification({
        userId: recipientId,
        senderId: sender.id,
        senderUsername: sender.username,
        senderDisplayName: sender.displayName,
        type: 'encouragement',
        title: `${emoji} Encouragement Received!`,
        message: `${sender.displayName}: "${emoji} ${text}"`,
      });
    }

    return newEnc;
  },

  // 2. Get received encouragements for recipient
  getReceivedEncouragements(recipientId: string): EncouragementReaction[] {
    if (!recipientId) return [];
    const all = this.getStorageRecords();
    return all
      .filter(e => e.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 3. Get encouragement count
  getEncouragementCount(recipientId: string): number {
    return this.getReceivedEncouragements(recipientId).length;
  },
};
