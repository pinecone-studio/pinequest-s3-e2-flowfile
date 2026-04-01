import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProctoringRepository } from './proctoring.repository';
import { CreateProctoringViolationDto } from './dto/create-proctoring-violation.dto';
import { ListProctoringViolationsDto } from './dto/list-proctoring-violations.dto';
import { ProctoringGateway } from './proctoring.gateway';
import type {
  NewProctoringViolation,
  ProctoringSeverity,
  ProctoringViolationType,
} from 'src/shared/types/proctoring.types';

const PROCTORING_DEFAULT_SEVERITY: Record<
  ProctoringViolationType,
  ProctoringSeverity
> = {
  face_not_detected: 'medium',
  multiple_faces_detected: 'high',
  tab_switch: 'medium',
  window_blur: 'medium',
  audio_detected: 'low',
  device_changed: 'high',
};

@Injectable()
export class ProctoringService {
  constructor(
    private readonly proctoringRepo: ProctoringRepository,
    private readonly proctoringGateway: ProctoringGateway,
  ) {}

  async listViolations(query: ListProctoringViolationsDto) {
    try {
      const violations = await this.proctoringRepo.findViolationsByTeacherId(
        query.teacherId,
        query.limit ?? 12,
      );

      return { violations };
    } catch (error) {
      console.error('[proctoring] failed to list violations', error);
      throw new InternalServerErrorException(
        'Failed to load proctoring alerts',
      );
    }
  }

  async createViolation(body: CreateProctoringViolationDto) {
    try {
      const payload: NewProctoringViolation = {
        id: crypto.randomUUID(),
        teacherId: body.teacherId,
        teacherName: body.teacherName ?? null,
        studentId: body.studentId,
        studentName: body.studentName,
        examId: body.examId,
        examTitle: body.examTitle,
        assignmentId: body.assignmentId,
        classId: body.classId ?? null,
        className: body.className ?? null,
        type: body.type,
        severity: body.severity ?? PROCTORING_DEFAULT_SEVERITY[body.type],
        details: body.details ?? null,
        metadataJson: body.metadata ? JSON.stringify(body.metadata) : null,
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      };

      const violation = await this.proctoringRepo.createViolation(payload);

      await this.proctoringGateway.emitViolationToTeacher(
        violation.teacherId,
        violation,
      );

      return { violation };
    } catch (error) {
      console.error('[proctoring] failed to create violation', error);
      throw new InternalServerErrorException(
        'Failed to store proctoring alert',
      );
    }
  }
}
