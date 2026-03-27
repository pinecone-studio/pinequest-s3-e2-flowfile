import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { NewExam, ExamStatus } from 'src/shared/types/exam.types';
import { ExamRepository } from './exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';

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

  async getMyExams(teacherId: string) {
    return this.examRepo.findExamsByTeacher(teacherId);
  }

  async getExamsByTeacher(teacherId: string) {
    return this.examRepo.findExamsByTeacher(teacherId);
  }

  async createExam(teacherId: string, dto: CreateExamDto) {
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
}
