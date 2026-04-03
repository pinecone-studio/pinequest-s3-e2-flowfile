import { IsInt, Min } from 'class-validator';

export class GradeSessionDto {
  @IsInt()
  @Min(0)
  score: number;
}
