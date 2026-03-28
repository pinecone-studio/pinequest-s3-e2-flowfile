import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Resolver('Question')
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Object])
  getQuestionsByExam(@Args('examId') examId: string) {
    return this.questionService.getQuestionsByExam(examId);
  }

  @Query(() => Object)
  getQuestionById(@Args('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  @Mutation(() => Object)
  createQuestion(@Args('data') data: CreateQuestionDto) {
    return this.questionService.createQuestion({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  @Mutation(() => Object)
  updateQuestion(
    @Args('id') id: string,
    @Args('data') data: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(id, data);
  }

  @Mutation(() => Object)
  deleteQuestion(@Args('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }

  @Mutation(() => [Object])
  reorderQuestions(
    @Args('examId') examId: string,
    @Args('orderedIds', { type: () => [String] }) orderedIds: string[],
  ) {
    return this.questionService.reorderQuestions(examId, orderedIds);
  }

  @Mutation(() => Object)
  reorderOptions(
    @Args('id') id: string,
    @Args('options', { type: () => [String] }) options: string[],
  ) {
    return this.questionService.reorderOptions(id, options);
  }
}
