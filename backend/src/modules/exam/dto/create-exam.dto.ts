import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsISO8601,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
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
  @Min(0)
  maxTabSwitches?: number;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;
}
