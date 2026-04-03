import { Injectable } from '@nestjs/common';
import { EnrollmentRepository } from './enrollment.repository';
import { ExamRepository } from '../exam/exam.repository';
import { NotificationService } from '../notification/notification.service';
import { UserRepository } from 'src/database/repositories/user.repository';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly examRepo: ExamRepository,
    private readonly notificationService: NotificationService,
    private readonly userRepo: UserRepository,
  ) {}

  private async ensureStudentUser(studentId: string, studentName?: string) {
    const existingUser = await this.userRepo.findById(studentId);

    if (existingUser) {
      return existingUser;
    }

    const now = new Date().toISOString();
    const fallbackSuffix = studentId.slice(-6).toUpperCase();

    return this.userRepo.create({
      id: studentId,
      clerkUserId: `qr-${studentId}`,
      email: `${studentId.toLowerCase()}@qr.e-shalgalt.local`,
      name: studentName?.trim() || `QR сурагч ${fallbackSuffix}`,
      role: 'student',
      imageUrl: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  async enrollStudent(
    examId: string,
    studentId: string,
    metadata?: { studentName?: string },
  ) {
    await this.ensureStudentUser(studentId, metadata?.studentName);

    const existingEnrollment =
      await this.enrollmentRepo.findEnrollmentByExamAndStudent(examId, studentId);

    if (existingEnrollment) {
      return existingEnrollment;
    }

    const enrollment = await this.enrollmentRepo.enrollStudent(examId, studentId);
    const exam = await this.examRepo.findExamById(examId);

    if (exam && (exam.status === 'scheduled' || exam.status === 'published')) {
      await this.notificationService.createNotification({
        recipientId: studentId,
        examId,
        title: 'New exam assigned',
        body: exam.startsAt
          ? `"${exam.title}" is scheduled for ${exam.startsAt}.`
          : `"${exam.title}" is now available.`,
        type: 'exam_published',
      });
    }

    return enrollment;
  }

  async getEnrollmentsByExam(examId: string) {
    return this.enrollmentRepo.findEnrollmentsByExam(examId);
  }

  async getEnrollmentsByStudent(studentId: string) {
    return this.enrollmentRepo.findEnrollmentsByStudent(studentId);
  }

  async removeEnrollment(examId: string, studentId: string) {
    return this.enrollmentRepo.removeEnrollment(examId, studentId);
  }
}
