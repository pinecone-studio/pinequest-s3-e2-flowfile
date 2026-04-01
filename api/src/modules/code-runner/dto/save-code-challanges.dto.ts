import { Allow, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveCodeChallengeItemDto {
  @IsOptional()
  @Allow()
  id?: unknown;

  @IsOptional()
  @Allow()
  questionId?: unknown;

  @IsOptional()
  @Allow()
  functionName?: unknown;

  @IsOptional()
  @Allow()
  hiddenTestCases?: unknown;
}

export class SaveCodeChallengesDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveCodeChallengeItemDto)
  challenges?: SaveCodeChallengeItemDto[];
}
