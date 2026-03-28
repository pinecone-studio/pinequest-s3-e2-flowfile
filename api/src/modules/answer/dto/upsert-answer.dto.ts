import { IsOptional, IsString } from 'class-validator';

export class UpsertAnswerDto {
  @IsString()
  sessionId: string;

  @IsString()
  questionId: string;

  @IsOptional()
  @IsString()
  textAnswer?: string;

  @IsOptional()
  @IsString()
  formulaAnswerJson?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
