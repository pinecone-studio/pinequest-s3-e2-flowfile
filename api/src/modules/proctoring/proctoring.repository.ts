import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from 'src/database/client';
import { proctoringViolations } from 'src/database/schema/proctoring-violations.schema';
import type {
  NewProctoringViolation,
  ProctoringViolation,
} from 'src/shared/types/proctoring.types';

@Injectable()
export class ProctoringRepository {
  async findViolationsByTeacherId(
    teacherId: string,
    limit = 12,
  ): Promise<ProctoringViolation[]> {
    return (await db.query.proctoringViolations.findMany({
      where: eq(proctoringViolations.teacherId, teacherId),
      orderBy: desc(proctoringViolations.createdAt),
      limit,
    })) as ProctoringViolation[];
  }

  async createViolation(
    data: NewProctoringViolation,
  ): Promise<ProctoringViolation> {
    const [violation] = await db
      .insert(proctoringViolations)
      .values(data)
      .returning();

    return violation as ProctoringViolation;
  }

  async findViolationById(
    id: string,
  ): Promise<ProctoringViolation | undefined> {
    return (await db.query.proctoringViolations.findFirst({
      where: eq(proctoringViolations.id, id),
    })) as ProctoringViolation | undefined;
  }

  async findRecentViolation(params: {
    teacherId: string;
    studentId: string;
    assignmentId: string;
    type: NewProctoringViolation['type'];
    since: Date;
  }): Promise<ProctoringViolation | undefined> {
    return (await db.query.proctoringViolations.findFirst({
      where: and(
        eq(proctoringViolations.teacherId, params.teacherId),
        eq(proctoringViolations.studentId, params.studentId),
        eq(proctoringViolations.assignmentId, params.assignmentId),
        eq(proctoringViolations.type, params.type),
        gte(proctoringViolations.createdAt, params.since),
      ),
      orderBy: desc(proctoringViolations.createdAt),
    })) as ProctoringViolation | undefined;
  }
}
