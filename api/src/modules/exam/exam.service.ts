import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import type { NewExam, ExamStatus } from 'src/shared/types/exam.types';
import type {
  AssignedExamSummary,
  Session,
} from 'src/shared/types/session.types';
import { ExamRepository } from './exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { QuestionRepository } from '../question/question.repository';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import { SessionRepository } from '../session/session.repository';
import { getSessionTiming } from 'src/shared/utils/exam-session';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ExamService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly notificationService: NotificationService,
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

  async getAssignedExams(studentId: string): Promise<AssignedExamSummary[]> {
    const enrollments =
      await this.enrollmentRepo.findEnrollmentsByStudent(studentId);

    if (enrollments.length === 0) {
      return [];
    }

    const [exams, sessions] = await Promise.all([
      this.examRepo.findExamsByIds(
        enrollments.map((enrollment) => enrollment.examId),
      ),
      this.sessionRepo.findSessionsByStudent(studentId),
    ]);

    const examById = new Map(exams.map((exam) => [exam.id, exam]));
    const latestSessionByExam = new Map<string, Session>();

    for (const session of sessions) {
      if (!latestSessionByExam.has(session.examId)) {
        latestSessionByExam.set(session.examId, session);
      }
    }

    const summaries: AssignedExamSummary[] = [];

    for (const enrollment of enrollments) {
      const exam = examById.get(enrollment.examId);

      if (!exam) {
        continue;
      }

      const session = latestSessionByExam.get(enrollment.examId) ?? null;

      summaries.push({
        exam,
        session,
        enrolledAt: enrollment.assignedAt,
        attemptStatus: this.getAssignedExamStatus(exam, session),
        timing: session?.startedAt ? getSessionTiming(exam, session) : null,
      });
    }

    return summaries;
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

    const updatedExam = await this.examRepo.updateExamStatus(id, status);

    if (status === 'scheduled' || status === 'published') {
      await this.notifyStudentsAboutAssignedExam(updatedExam);
    }

    return updatedExam;
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

  private validateExamSchedule(
    startsAt?: string | null,
    endsAt?: string | null,
  ) {
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

  private getAssignedExamStatus(
    exam: {
      status: ExamStatus;
      startsAt: string | null;
      endsAt: string | null;
    },
    session: Session | null,
  ): AssignedExamSummary['attemptStatus'] {
    if (session?.status === 'submitted') {
      return 'submitted';
    }

    if (session?.status === 'force_submitted') {
      return 'force_submitted';
    }

    if (session?.status === 'graded') {
      return 'submitted';
    }

    if (session?.status === 'in_progress') {
      return 'in_progress';
    }

    const now = new Date();

    if (exam.status === 'closed') {
      return 'closed';
    }

    if (exam.startsAt && now < new Date(exam.startsAt)) {
      return 'upcoming';
    }

    if (exam.endsAt && now > new Date(exam.endsAt)) {
      return 'closed';
    }

    if (exam.status === 'scheduled' || exam.status === 'published') {
      return 'ready';
    }

    return 'closed';
  }

  private async notifyStudentsAboutAssignedExam(exam: {
    id: string;
    title: string;
    startsAt: string | null;
  }) {
    const enrollments = await this.enrollmentRepo.findEnrollmentsByExam(exam.id);

    await Promise.all(
      enrollments.map((enrollment) =>
        this.notificationService.createNotification({
          recipientId: enrollment.studentId,
          examId: exam.id,
          title: 'New exam assigned',
          body: exam.startsAt
            ? `"${exam.title}" is scheduled for ${exam.startsAt}.`
            : `"${exam.title}" is now available.`,
          type: 'exam_published',
        }),
      ),
    );
  }
}
