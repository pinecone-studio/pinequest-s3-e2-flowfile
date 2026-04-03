jest.mock('./proctoring.repository', () => ({
  ProctoringRepository: class ProctoringRepository {},
}));
jest.mock('./proctoring.gateway', () => ({
  ProctoringGateway: class ProctoringGateway {},
}));
jest.mock('../exam/exam.repository', () => ({
  ExamRepository: class ExamRepository {},
}));
jest.mock('../session/session.repository', () => ({
  SessionRepository: class SessionRepository {},
}));
jest.mock('../../database/repositories/user.repository', () => ({
  UserRepository: class UserRepository {},
}));
jest.mock('../monitoring/monitoring.repository', () => ({
  MonitoringRepository: class MonitoringRepository {},
}));
jest.mock('../notification/notification.service', () => ({
  NotificationService: class NotificationService {},
}));

import { ProctoringService } from './proctoring.service';

describe('ProctoringService', () => {
  const makeMocks = () => ({
    proctoringRepo: {
      findViolationsByTeacherId: jest.fn(),
      findRecentViolation: jest.fn(),
      createViolation: jest.fn(),
    },
    proctoringGateway: {
      emitViolationToTeacher: jest.fn(),
    },
    examRepo: {
      findExamById: jest.fn(),
    },
    sessionRepo: {
      findSessionById: jest.fn(),
      findSessionByStudentAndExam: jest.fn(),
      flagSession: jest.fn(),
    },
    userRepo: {
      findById: jest.fn(),
    },
    monitoringRepo: {
      createEvent: jest.fn(),
    },
    notificationService: {
      createNotification: jest.fn(),
    },
  });

  it('creates a look-direction violation and notifies the teacher immediately', async () => {
    const mocks = makeMocks();
    const service = new ProctoringService(
      mocks.proctoringRepo as never,
      mocks.proctoringGateway as never,
      mocks.examRepo as never,
      mocks.sessionRepo as never,
      mocks.userRepo as never,
      mocks.monitoringRepo as never,
      mocks.notificationService as never,
    );

    mocks.examRepo.findExamById.mockResolvedValue({
      id: 'exam-1',
      teacherId: 'teacher-1',
      title: 'Algebra Midterm',
    });
    mocks.sessionRepo.findSessionById.mockResolvedValue({
      id: 'session-1',
      examId: 'exam-1',
      studentId: 'student-1',
      status: 'in_progress',
      isFlagged: false,
    });
    mocks.userRepo.findById
      .mockResolvedValueOnce({
        id: 'student-1',
        name: 'Bat',
        role: 'student',
      })
      .mockResolvedValueOnce({
        id: 'teacher-1',
        name: 'Teacher Naraa',
        role: 'teacher',
      });
    mocks.proctoringRepo.findRecentViolation.mockResolvedValue(undefined);
    mocks.proctoringRepo.createViolation.mockImplementation(async (payload) => payload);
    mocks.monitoringRepo.createEvent.mockResolvedValue(undefined);
    mocks.notificationService.createNotification.mockResolvedValue(undefined);
    mocks.sessionRepo.flagSession.mockResolvedValue(undefined);
    mocks.proctoringGateway.emitViolationToTeacher.mockResolvedValue(undefined);

    const result = await service.createViolation(
      {
        examId: 'exam-1',
        sessionId: 'session-1',
        assignmentId: 'assignment-1',
        type: 'looking_left',
      },
      {
        id: 'student-1',
        clerkUserId: 'clerk-student-1',
        email: 'student@example.com',
        role: 'student',
        name: 'Bat',
      },
    );

    expect(mocks.proctoringRepo.createViolation).toHaveBeenCalledWith(
      expect.objectContaining({
        teacherId: 'teacher-1',
        teacherName: 'Teacher Naraa',
        studentId: 'student-1',
        studentName: 'Bat',
        examId: 'exam-1',
        examTitle: 'Algebra Midterm',
        assignmentId: 'assignment-1',
        type: 'looking_left',
        severity: 'medium',
      }),
    );
    expect(mocks.monitoringRepo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        studentId: 'student-1',
        examId: 'exam-1',
        eventType: 'looking_left',
      }),
    );
    expect(mocks.notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'teacher-1',
        examId: 'exam-1',
        sessionId: 'session-1',
        title: 'Proctoring alert',
        type: 'suspicious_event',
      }),
    );
    expect(mocks.sessionRepo.flagSession).toHaveBeenCalledWith('session-1');
    expect(mocks.proctoringGateway.emitViolationToTeacher).toHaveBeenCalledWith(
      'teacher-1',
      expect.objectContaining({
        type: 'looking_left',
      }),
    );
    expect(result.violation).toEqual(
      expect.objectContaining({
        teacherId: 'teacher-1',
        studentId: 'student-1',
        type: 'looking_left',
      }),
    );
  });

  it('suppresses duplicate alerts inside the cooldown window', async () => {
    const mocks = makeMocks();
    const service = new ProctoringService(
      mocks.proctoringRepo as never,
      mocks.proctoringGateway as never,
      mocks.examRepo as never,
      mocks.sessionRepo as never,
      mocks.userRepo as never,
      mocks.monitoringRepo as never,
      mocks.notificationService as never,
    );

    const existingViolation = {
      id: 'violation-existing',
      teacherId: 'teacher-1',
      teacherName: 'Teacher Naraa',
      studentId: 'student-1',
      studentName: 'Bat',
      examId: 'exam-1',
      examTitle: 'Algebra Midterm',
      assignmentId: 'assignment-1',
      classId: null,
      className: null,
      type: 'looking_up',
      severity: 'medium',
      details: null,
      metadataJson: null,
      createdAt: new Date('2026-04-03T10:00:00.000Z'),
    };

    mocks.examRepo.findExamById.mockResolvedValue({
      id: 'exam-1',
      teacherId: 'teacher-1',
      title: 'Algebra Midterm',
    });
    mocks.sessionRepo.findSessionById.mockResolvedValue({
      id: 'session-1',
      examId: 'exam-1',
      studentId: 'student-1',
      status: 'in_progress',
      isFlagged: false,
    });
    mocks.userRepo.findById
      .mockResolvedValueOnce({
        id: 'student-1',
        name: 'Bat',
        role: 'student',
      })
      .mockResolvedValueOnce({
        id: 'teacher-1',
        name: 'Teacher Naraa',
        role: 'teacher',
      });
    mocks.proctoringRepo.findRecentViolation.mockResolvedValue(existingViolation);

    const result = await service.createViolation(
      {
        examId: 'exam-1',
        sessionId: 'session-1',
        assignmentId: 'assignment-1',
        type: 'looking_up',
      },
      {
        id: 'student-1',
        clerkUserId: 'clerk-student-1',
        email: 'student@example.com',
        role: 'student',
        name: 'Bat',
      },
    );

    expect(result.violation).toBe(existingViolation);
    expect(mocks.proctoringRepo.createViolation).not.toHaveBeenCalled();
    expect(mocks.monitoringRepo.createEvent).not.toHaveBeenCalled();
    expect(mocks.notificationService.createNotification).not.toHaveBeenCalled();
    expect(mocks.proctoringGateway.emitViolationToTeacher).not.toHaveBeenCalled();
  });
});
