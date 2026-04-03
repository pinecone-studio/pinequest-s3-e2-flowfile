import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const PROCTORING_VIOLATION_TYPES = [
  'face_not_detected',
  'multiple_faces_detected',
  'tab_switch',
  'window_blur',
  'audio_detected',
  'device_changed',
  'looking_left',
  'looking_right',
  'looking_up',
  'looking_down',
] as const;

export enum ProctoringSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateProctoringViolationDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  teacherName?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  studentName?: string;

  @IsString()
  examId: string;

  @IsOptional()
  @IsString()
  examTitle?: string;

  @IsOptional()
  @IsString()
  assignmentId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsEnum(PROCTORING_VIOLATION_TYPES)
  type: (typeof PROCTORING_VIOLATION_TYPES)[number];

  @IsOptional()
  @IsEnum(ProctoringSeverity)
  severity?: ProctoringSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  details?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;

  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
