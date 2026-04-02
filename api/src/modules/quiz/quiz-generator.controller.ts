import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { QuizGeneratorService } from './quiz-generator.service';
import { CreateQuizInput } from './dto/create-quiz.input';
import { GeneratedQuiz } from './dto/quiz-question.object';

@Resolver()
export class QuizGeneratorResolver {
  constructor(private readonly quizGeneratorService: QuizGeneratorService) {}

  @Mutation(() => GeneratedQuiz)
  async generateQuiz(
    @Args('input') input: CreateQuizInput,
  ): Promise<GeneratedQuiz> {
    return this.quizGeneratorService.generateQuiz(input);
  }

  @Query(() => GeneratedQuiz, { nullable: true })
  async getQuiz(@Args('quizId') quizId: string) {
    return this.quizGeneratorService.getQuizById(quizId);
  }
}
