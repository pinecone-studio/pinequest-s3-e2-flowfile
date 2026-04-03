import { IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  studentName?: string;
}
