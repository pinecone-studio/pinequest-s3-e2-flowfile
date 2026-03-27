import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/database/client';
import { examEnrollments } from 'src/database/schema';

@Injectable()
export class EnrollmentRepository {
  async enrollStudent(examId: string, studentId: string) {
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

  async findEnrollmentsByExam(examId: string) {
    return db.query.examEnrollments.findMany({
      where: eq(examEnrollments.examId, examId),
    });
  }

  async findEnrollmentsByStudent(studentId: string) {
    return db.query.examEnrollments.findMany({
      where: eq(examEnrollments.studentId, studentId),
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
