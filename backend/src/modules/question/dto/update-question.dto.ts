import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import type { QuestionInputType } from 'src/shared/types';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum([
    'mcq',
    'short_text',
    'rich_text',
    'math_formula',
    'chem_formula',
    'handwritten',
    'voice_record',
  ])
  inputType?: QuestionInputType;

  @IsOptional()
  @IsString()
  subjectHint?: string;

  @IsOptional()
  @IsInt()
  points?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  optionsJson?: string;

  @IsOptional()
  @IsString()
  correctAnswer?: string;
}
