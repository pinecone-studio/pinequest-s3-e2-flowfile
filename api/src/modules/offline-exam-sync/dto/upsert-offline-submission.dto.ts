import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertOfflineSubmissionDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsObject()
  attempt: Record<string, unknown>;

  @IsObject()
  result: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  queuedAt?: string;
}
