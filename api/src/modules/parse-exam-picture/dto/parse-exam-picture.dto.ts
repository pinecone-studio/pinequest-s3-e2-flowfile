import { IsOptional, IsString } from 'class-validator';

export class ParseExamPictureDto {
  @IsOptional()
  @IsString()
  ocrText?: string;

  @IsOptional()
  @IsString()
  fileText?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  courseLabel?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
