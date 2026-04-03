import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('student', 'teacher')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  getMyNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getNotificationsByUser(user.id);
  }

  @Get('user/:userId')
  getNotificationsByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.getNotificationsByUserForRecipient(
      userId,
      user.id,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.markAsReadForRecipient(id, user.id);
  }

  @Patch('me/read-all')
  markMyNotificationsAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.markAllAsReadForRecipient(user.id);
  }

  @Patch('user/:userId/read-all')
  markAllAsRead(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.getNotificationsByUserForRecipient(
      userId,
      user.id,
    ).then(() => this.notificationService.markAllAsReadForRecipient(user.id));
  }

  @Get('me/unread-count')
  getMyUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.getUnreadCountForRecipient(user.id);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.getNotificationsByUserForRecipient(
      userId,
      user.id,
    ).then(() => this.notificationService.getUnreadCountForRecipient(user.id));
  }
}
