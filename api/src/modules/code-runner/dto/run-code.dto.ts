import { Allow, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RunCodeRunnerDto {
  @IsOptional()
  @Allow()
  functionName?: unknown;

  @IsOptional()
  @Allow()
  publicTestCases?: unknown;

  @IsOptional()
  @Allow()
  challengeId?: unknown;
}

export class RunCodeDto {
  @IsOptional()
  @Allow()
  code?: unknown;

  @IsOptional()
  @Allow()
  mode?: unknown;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunCodeRunnerDto)
  runner?: RunCodeRunnerDto;
}
