import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteOfflineDraftDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}
