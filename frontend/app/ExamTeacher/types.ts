export type TeacherQuestionType = "choice" | "text";

export type ExamOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type TeacherQuestion = {
  id: string;
  inExam: boolean;
  label: string;
  options?: ExamOption[];
  points: number;
  preview: string;
  prompt: string;
  timerMinutes: number;
  timerSeconds: number;
  type: TeacherQuestionType;
};

export type ExamSummary = {
  totalMinutes: number;
  totalPoints: number;
};

export type ExamSettings = {
  lockNavigation: boolean;
  randomizeOrder: boolean;
};
