import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateQuizInput {
  @Field()
  moduleName: string;

  @Field()
  className: string;

  @Field()
  subject: string;

  @Field()
  lessonContent: string; // Монгол эсвэл Англи хэлээр оруулж болно

  @Field(() => Int)
  questionCount: number; // 3–5

  @Field()
  questionType: string; // 'mcq' | 'truefalse' | 'mixed'
}