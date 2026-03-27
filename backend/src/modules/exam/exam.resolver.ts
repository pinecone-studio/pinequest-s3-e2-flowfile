/*import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Resolver('Exam')
export class ExamResolver {
  constructor(private readonly examService: ExamService) {}

  @Query(() => [Object])
  getAllExams() {
    return this.examService.getAllExams();
  }

  @Query(() => Object)
  getExamById(@Args('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Query(() => [Object])
  getExamsByTeacher(@Args('teacherId') teacherId: string) {
    return this.examService.getExamsByTeacher(teacherId);
  }

  @Mutation(() => Object)
  createExam(@Args('data') data: CreateExamDto) {
    return this.examService.createExam({
      ...data,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  @Mutation(() => Object)
  updateExamStatus(
    @Args('id') id: string,
    @Args('status') status: string,
  ) {
    return this.examService.updateExamStatus(id, status as any);
  }

  @Mutation(() => Object)
  deleteExam(@Args('id') id: string) {
    return this.examService.deleteExam(id);
  }
}*/
