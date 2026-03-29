import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { NewQuestion, UpdateQuestion } from 'src/shared/types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { ExamRepository } from '../exam/exam.repository';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly examRepo: ExamRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}
  async getQuestionsByExam(examId: string, user?: AuthenticatedUser) {
    if (user) {
      await this.ensureExamAccess(examId, user);
    }

    return this.questionRepo.findQuestionsByExam(examId);
  }
  async getQuestionById(id: string, user?: AuthenticatedUser) {
    const question = await this.questionRepo.findQuestionById(id);
    if (!question) throw new NotFoundException('Question not found');

    if (user) {
      await this.ensureExamAccess(question.examId, user);
    }

    return question;
  }
  async createQuestion(data: NewQuestion, teacherId: string) {
    await this.ensureTeacherCanManageExam(data.examId, teacherId);
    return this.questionRepo.createQuestion(data);
  }
  async updateQuestion(id: string, data: UpdateQuestion, teacherId: string) {
    await this.getQuestionForTeacher(id, teacherId);
    return this.questionRepo.updateQuestion(id, data);
  }
  async deleteQuestion(id: string, teacherId: string) {
    await this.getQuestionForTeacher(id, teacherId);
    return this.questionRepo.deleteQuestion(id);
  }
  async reorderQuestions(examId: string, orderedIds: string[], teacherId: string) {
    await this.ensureTeacherCanManageExam(examId, teacherId);
    const existingQuestions = await this.questionRepo.findQuestionsByExam(examId);

    if (existingQuestions.length !== orderedIds.length) {
      throw new BadRequestException(
        'Ordered question list must include every question in the exam',
      );
    }

    const existingIds = new Set(existingQuestions.map((question) => question.id));
    const hasUnknownIds = orderedIds.some((id) => !existingIds.has(id));

    if (hasUnknownIds) {
      throw new BadRequestException('Question reorder payload contains invalid ids');
    }

    return this.questionRepo.reorderQuestions(examId, orderedIds);
  }
  async reorderOptions(id: string, orderedOptions: string[], teacherId: string) {
    await this.getQuestionForTeacher(id, teacherId);
    return this.questionRepo.reorderOptions(id, orderedOptions);
  }

  private async getQuestionForTeacher(id: string, teacherId: string) {
    const question = await this.questionRepo.findQuestionById(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.ensureTeacherCanManageExam(question.examId, teacherId);

    return question;
  }

  private async ensureExamAccess(examId: string, user: AuthenticatedUser) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (user.role === 'teacher') {
      if (exam.teacherId !== user.id) {
        throw new ForbiddenException('You cannot access questions for this exam');
      }

      return exam;
    }

    const enrollments = await this.enrollmentRepo.findEnrollmentsByStudent(user.id);
    const isEnrolled = enrollments.some((enrollment) => enrollment.examId === examId);

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this exam');
    }

    return exam;
  }

  private async ensureTeacherCanManageExam(examId: string, teacherId: string) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot modify this exam');
    }

    if (exam.status === 'published' || exam.status === 'closed') {
      throw new BadRequestException(
        'Questions cannot be modified after the exam is published',
      );
    }

    return exam;
  }
}
