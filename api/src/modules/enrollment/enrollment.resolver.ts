import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EnrollmentService } from './enrollment.service';

@Resolver('Enrollment')
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Query(() => [Object])
  getEnrollmentsByExam(@Args('examId') examId: string) {
    return this.enrollmentService.getEnrollmentsByExam(examId);
  }

  @Query(() => [Object])
  getEnrollmentsByStudent(@Args('studentId') studentId: string) {
    return this.enrollmentService.getEnrollmentsByStudent(studentId);
  }

  @Mutation(() => Object)
  enrollStudent(
    @Args('examId') examId: string,
    @Args('studentId') studentId: string,
  ) {
    return this.enrollmentService.enrollStudent(examId, studentId);
  }

  @Mutation(() => Boolean)
  removeEnrollment(
    @Args('examId') examId: string,
    @Args('studentId') studentId: string,
  ) {
    return this.enrollmentService.removeEnrollment(examId, studentId);
  }
}
