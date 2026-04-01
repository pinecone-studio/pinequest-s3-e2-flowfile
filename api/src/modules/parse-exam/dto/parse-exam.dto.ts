import { IsOptional, IsString } from 'class-validator';

export class ParseExamDto {
  @IsOptional()
  @IsString()
  fileText?: string;

  @IsOptional()
  @IsString()
  fileBuffer?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  courseLabel?: string;
}
