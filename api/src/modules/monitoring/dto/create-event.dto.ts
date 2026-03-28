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
  ])
  eventType: MonitoringEventType;

  @IsOptional()
  @IsString()
  metadataJson?: string;
}
