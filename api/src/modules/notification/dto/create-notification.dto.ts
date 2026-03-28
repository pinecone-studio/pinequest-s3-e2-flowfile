import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { NotificationType } from 'src/shared/types';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum([
    'suspicious_event',
    'exam_started',
    'exam_submitted',
    'exam_published',
  ])
  type: NotificationType;
}
