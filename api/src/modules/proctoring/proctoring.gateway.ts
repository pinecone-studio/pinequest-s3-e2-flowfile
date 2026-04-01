import { Injectable } from '@nestjs/common';
import type { ProctoringViolation } from 'src/shared/types/proctoring.types';

@Injectable()
export class ProctoringGateway {
  emitViolationToTeacher(teacherId: string, violation: ProctoringViolation) {
    console.log(
      `[proctoring] emit violation to teacher ${teacherId}`,
      violation.id,
    );
  }
}
