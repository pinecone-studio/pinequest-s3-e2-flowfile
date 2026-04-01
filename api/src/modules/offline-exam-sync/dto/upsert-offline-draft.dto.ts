import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
} from 'class-validator';

export class UpsertOfflineDraftDto {
  @IsString()
  @IsNotEmpty()
  draftKey: string;

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
  answers: Record<string, string | string[]>;

  @IsArray()
  markedForReview: string[];

  @IsInt()
  @Min(0)
  currentIndex: number;

  @IsDateString()
  startedAt: string;

  @IsDateString()
  updatedAt: string;
}
