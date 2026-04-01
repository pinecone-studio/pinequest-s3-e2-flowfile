import { IsNotEmpty, IsString } from 'class-validator';

export class GetOfflineDraftDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}
