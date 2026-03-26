import { Injectable, NotFoundException } from '@nestjs/common';

import { NewExam, ExamStatus } from 'src/shared/types/exam.types';
import { ExamRepository } from './exam.repository';

@Injectable()
export class ExamService {
  constructor(private readonly examRepo: ExamRepository) {}

  async getAllExams() {
    return this.examRepo.findAllExams();
  }

  async getExamById(id: string) {
    const exam = await this.examRepo.findExamById(id);
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async getExamsByTeacher(teacherId: string) {
    return this.examRepo.findExamsByTeacher(teacherId);
  }

  async createExam(data: NewExam) {
    return this.examRepo.createExam(data);
  }

  async updateExamStatus(id: string, status: ExamStatus) {
    await this.getExamById(id); // throws if not found
    return this.examRepo.updateExamStatus(id, status);
  }

  async deleteExam(id: string) {
    await this.getExamById(id); // throws if not found
    return this.examRepo.deleteExam(id);
  }
}
