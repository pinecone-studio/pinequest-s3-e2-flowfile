import { IsOptional, IsString } from 'class-validator';

export class UploadAnswerAssetDto {
  @IsOptional()
  @IsString()
  kind?: string;
}
