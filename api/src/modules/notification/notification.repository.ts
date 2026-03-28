import { Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { notifications } from 'src/database/schema';
import type { NewNotification } from 'src/shared/types';

@Injectable()
export class NotificationRepository {
  async createNotification(data: NewNotification) {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();

    return notification;
  }

  async findNotificationsByUser(userId: string) {
    return db.query.notifications.findMany({
      where: eq(notifications.recipientId, userId),
      orderBy: desc(notifications.createdAt),
    });
  }

  async findNotificationById(id: string) {
    return db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });
  }

  async markAsRead(id: string) {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    return notification;
  }

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, userId));

    return this.findNotificationsByUser(userId);
  }

  async findUnreadCount(userId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false),
        ),
      );

    return result?.count ?? 0;
  }
}
