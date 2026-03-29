import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { NewExam, ExamStatus } from 'src/shared/types/exam.types';
import { ExamRepository } from './exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { QuestionRepository } from '../question/question.repository';

@Injectable()
export class ExamService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly questionRepo: QuestionRepository,
  ) {}

  async getAllExams() {
    return this.examRepo.findAllExams();
  }

  async getExamById(id: string) {
    const exam = await this.examRepo.findExamById(id);
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async getMyExams(teacherId: string) {
    return this.examRepo.findExamsByTeacher(teacherId);
  }

  async getExamsByTeacher(teacherId: string) {
    return this.examRepo.findExamsByTeacher(teacherId);
  }

  async createExam(teacherId: string, dto: CreateExamDto) {
    this.validateExamSchedule(dto.startsAt, dto.endsAt);

    const now = new Date().toISOString();

    const data: NewExam = {
      id: crypto.randomUUID(),
      teacherId,
      title: dto.title,
      subject: dto.subject,
      description: dto.description ?? null,
      status: 'draft',
      durationMinutes: dto.durationMinutes,
      shuffleQuestions: dto.shuffleQuestions ?? false,
      allowCopyPaste: dto.allowCopyPaste ?? false,
      requireFullscreen: dto.requireFullscreen ?? true,
      maxTabSwitches: dto.maxTabSwitches ?? 3,
      startsAt: dto.startsAt ?? null,
      endsAt: dto.endsAt ?? null,
      createdAt: now,
      updatedAt: now,
    };

    return this.examRepo.createExam(data);
  }

  async updateExamStatus(id: string, teacherId: string, status: ExamStatus) {
    const exam = await this.examRepo.findExamById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot update this exam');
    }

    if (exam.status === status) {
      return exam;
    }

    this.validateStatusTransition(exam.status, status);

    if (status === 'scheduled' || status === 'published') {
      this.validateExamSchedule(exam.startsAt, exam.endsAt);

      const questions = await this.questionRepo.findQuestionsByExam(id);

      if (questions.length === 0) {
        throw new BadRequestException(
          'Exam must have at least one question before it can be scheduled or published',
        );
      }
    }

    return this.examRepo.updateExamStatus(id, status);
  }

  async deleteExam(id: string, teacherId: string) {
    const exam = await this.examRepo.findExamById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot delete this exam');
    }

    return this.examRepo.deleteExam(id);
  }

  private validateExamSchedule(startsAt?: string | null, endsAt?: string | null) {
    if (!startsAt || !endsAt) {
      return;
    }

    if (new Date(startsAt) >= new Date(endsAt)) {
      throw new BadRequestException('Exam start time must be before end time');
    }
  }

  private validateStatusTransition(
    currentStatus: ExamStatus,
    nextStatus: ExamStatus,
  ) {
    const allowedTransitions: Record<ExamStatus, ExamStatus[]> = {
      draft: ['scheduled', 'published'],
      scheduled: ['published', 'closed'],
      published: ['closed'],
      closed: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot change exam status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }
}
