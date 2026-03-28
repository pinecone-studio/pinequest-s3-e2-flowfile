import { IsArray, IsString } from 'class-validator';

export class ReorderOptionsDto {
  @IsArray()
  @IsString({ each: true })
  options: string[];
}
