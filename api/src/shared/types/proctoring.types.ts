export type ProctoringViolationType =
  | 'face_not_detected'
  | 'multiple_faces_detected'
  | 'tab_switch'
  | 'window_blur'
  | 'audio_detected'
  | 'device_changed'
  | 'looking_left'
  | 'looking_right'
  | 'looking_up'
  | 'looking_down';

export type ProctoringSeverity = 'low' | 'medium' | 'high';

export interface ProctoringViolation {
  id: string;
  teacherId: string;
  teacherName: string | null;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  assignmentId: string;
  classId: string | null;
  className: string | null;
  type: ProctoringViolationType;
  severity: ProctoringSeverity;
  details: string | null;
  metadataJson: string | null;
  createdAt: Date;
}

export type NewProctoringViolation = ProctoringViolation;
