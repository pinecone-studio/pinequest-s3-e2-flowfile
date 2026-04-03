import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { MonitoringEventType } from 'src/shared/types';

export class CreateEventDto {
  @IsString()
  sessionId: string;

  @IsString()
  studentId: string;

  @IsString()
  examId: string;

  @IsEnum([
    'tab_switch',
    'fullscreen_exit',
    'copy_attempt',
    'paste_attempt',
    'return_to_exam',
    'window_blur',
    'devtools_open',
    'face_not_detected',
    'multiple_faces_detected',
    'audio_detected',
    'device_changed',
    'looking_left',
    'looking_right',
    'looking_up',
    'looking_down',
  ])
  eventType: MonitoringEventType;

  @IsOptional()
  @IsString()
  metadataJson?: string;
}
