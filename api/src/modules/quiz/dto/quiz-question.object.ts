import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class QuizOption {
  @Field()
  label: string; // А, Б, В, Г

  @Field()
  text: string;
}

@ObjectType()
export class QuizQuestion {
  @Field(() => Int)
  index: number;

  @Field()
  question: string;

  @Field(() => [QuizOption])
  options: QuizOption[];

  @Field(() => Int)
  correctIndex: number;

  @Field()
  concept: string; // Which concept this question tests — for teacher dashboard
}

@ObjectType()
export class GeneratedQuiz {
  @Field()
  quizId: string;

  @Field()
  moduleName: string;

  @Field()
  className: string;

  @Field()
  subject: string;

  @Field()
  qrCodeUrl: string; // e.g. https://yourapp.com/quiz/<quizId>

  @Field(() => [QuizQuestion])
  questions: QuizQuestion[];

  @Field()
  expiresAt: string; // ISO timestamp — 24hr from creation
}