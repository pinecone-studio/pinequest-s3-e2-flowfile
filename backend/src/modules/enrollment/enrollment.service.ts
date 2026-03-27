import { Injectable } from '@nestjs/common';
import { EnrollmentRepository } from './enrollment.repository';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async enrollStudent(examId: string, studentId: string) {
    return this.enrollmentRepo.enrollStudent(examId, studentId);
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
