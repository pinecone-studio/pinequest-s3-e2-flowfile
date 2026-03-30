import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from 'src/database/client';
import { exams } from 'src/database/schema/exams.schema';
import type { Exam, ExamStatus, NewExam } from 'src/shared/types/exam.types';

@Injectable()
export class ExamRepository {
  async findAllExams(filters?: { status?: ExamStatus }): Promise<Exam[]> {
    return db.query.exams.findMany({
      where: filters?.status ? eq(exams.status, filters.status) : undefined,
    });
  }

  async findExamById(id: string): Promise<Exam | undefined> {
    return db.query.exams.findFirst({
      where: eq(exams.id, id),
    });
  }

  async findExamByIdAndTeacherId(
    id: string,
    teacherId: string,
  ): Promise<Exam | undefined> {
    return db.query.exams.findFirst({
      where: and(eq(exams.id, id), eq(exams.teacherId, teacherId)),
    });
  }

  async findExamsByTeacher(teacherId: string): Promise<Exam[]> {
    return db.query.exams.findMany({
      where: eq(exams.teacherId, teacherId),
    });
  }

  async findExamsByIds(ids: string[]): Promise<Exam[]> {
    if (ids.length === 0) {
      return [];
    }

    return db.query.exams.findMany({
      where: inArray(exams.id, ids),
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
