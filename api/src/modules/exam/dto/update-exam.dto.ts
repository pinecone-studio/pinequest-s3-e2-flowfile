import { IsEnum } from 'class-validator';

export class UpdateExamStatusDto {
  @IsEnum(['draft', 'scheduled', 'published', 'closed'])
  status: 'draft' | 'scheduled' | 'published' | 'closed';
}
