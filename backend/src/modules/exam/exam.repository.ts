import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { exams } from 'src/database/schema';
import type { ExamStatus, NewExam } from 'src/shared/types';

@Injectable()
export class ExamRepository {
  async findAllExams(filters?: { status?: ExamStatus }) {
    return db.query.exams.findMany({
      where: filters?.status ? eq(exams.status, filters.status) : undefined,
    });
  }

  async findExamById(id: string) {
    return db.query.exams.findFirst({
      where: eq(exams.id, id),
    });
  }

  async findExamByIdAndTeacherId(id: string, teacherId: string) {
    return db.query.exams.findFirst({
      where: and(eq(exams.id, id), eq(exams.teacherId, teacherId)),
    });
  }

  async findExamsByTeacher(teacherId: string) {
    return db.query.exams.findMany({
      where: eq(exams.teacherId, teacherId),
    });
  }

  async createExam(data: NewExam) {
    const [exam] = await db.insert(exams).values(data).returning();
    return exam;
  }

  async updateExamStatus(id: string, status: ExamStatus) {
    const [exam] = await db
      .update(exams)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(exams.id, id))
      .returning();

    return exam;
  }

  async deleteExam(id: string) {
    const [exam] = await db.delete(exams).where(eq(exams.id, id)).returning();

    return exam;
  }
}
