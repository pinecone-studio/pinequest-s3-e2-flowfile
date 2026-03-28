import { IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;
}
