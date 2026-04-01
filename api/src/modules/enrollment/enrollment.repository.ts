import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/database/client';
import { examEnrollments } from 'src/database/schema/exams.schema';
import type { Enrollment } from 'src/shared/types/enrollment.types';

@Injectable()
export class EnrollmentRepository {
  async enrollStudent(examId: string, studentId: string): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(examEnrollments)
      .values({
        id: crypto.randomUUID(),
        examId,
        studentId,
        assignedAt: new Date().toISOString(),
      })
      .returning();
    return enrollment;
  }

  async findEnrollmentsByExam(examId: string): Promise<Enrollment[]> {
    return db.query.examEnrollments.findMany({
      where: eq(examEnrollments.examId, examId),
    });
  }

  async findEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return db.query.examEnrollments.findMany({
      where: eq(examEnrollments.studentId, studentId),
    });
  }

  async findEnrollmentByExamAndStudent(
    examId: string,
    studentId: string,
  ): Promise<Enrollment | undefined> {
    return db.query.examEnrollments.findFirst({
      where: and(
        eq(examEnrollments.examId, examId),
        eq(examEnrollments.studentId, studentId),
      ),
    });
  }

  async removeEnrollment(examId: string, studentId: string) {
    await db
      .delete(examEnrollments)
      .where(
        and(
          eq(examEnrollments.examId, examId),
          eq(examEnrollments.studentId, studentId),
        ),
      );
  }
}
