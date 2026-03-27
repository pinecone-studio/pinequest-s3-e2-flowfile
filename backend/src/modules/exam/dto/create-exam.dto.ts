import { IsString, IsInt, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateExamDto {
  @IsString()
  teacherId: string;

  @IsString()
  title: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCopyPaste?: boolean;

  @IsOptional()
  @IsBoolean()
  requireFullscreen?: boolean;

  @IsOptional()
  @IsInt()
  maxTabSwitches?: number;

  @IsOptional()
  @IsString()
  startsAt?: string;

  @IsOptional()
  @IsString()
  endsAt?: string;
}