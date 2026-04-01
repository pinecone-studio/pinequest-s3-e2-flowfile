import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
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
    return db.query.proctoringViolations.findMany({
      where: eq(proctoringViolations.teacherId, teacherId),
      orderBy: desc(proctoringViolations.createdAt),
      limit,
    });
  }

  async createViolation(
    data: NewProctoringViolation,
  ): Promise<ProctoringViolation> {
    const [violation] = await db
      .insert(proctoringViolations)
      .values(data)
      .returning();

    return violation;
  }

  async findViolationById(
    id: string,
  ): Promise<ProctoringViolation | undefined> {
    return db.query.proctoringViolations.findFirst({
      where: eq(proctoringViolations.id, id),
    });
  }
}
