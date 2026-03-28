import { IsString } from 'class-validator';

export class StartSessionDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;
}
