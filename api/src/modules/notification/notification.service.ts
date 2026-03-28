import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import type { NewNotification } from 'src/shared/types';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async createNotification(data: Omit<NewNotification, 'id' | 'isRead' | 'createdAt'>) {
    const now = new Date().toISOString();

    return this.notificationRepo.createNotification({
      id: crypto.randomUUID(),
      recipientId: data.recipientId,
      examId: data.examId ?? null,
      sessionId: data.sessionId ?? null,
      title: data.title,
      body: data.body,
      type: data.type,
      isRead: false,
      createdAt: now,
    });
  }

  async getNotificationsByUser(userId: string) {
    return this.notificationRepo.findNotificationsByUser(userId);
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findNotificationById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    return this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    return {
      userId,
      unreadCount: await this.notificationRepo.findUnreadCount(userId),
    };
  }
}
