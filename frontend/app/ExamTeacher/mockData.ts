import type { ExamSettings, ExamSummary, TeacherQuestion } from "./types";

export const teacherQuestions: TeacherQuestion[] = [
  {
    id: "q1",
    inExam: true,
    label: "Q1",
    preview: "Cell structure basics",
    type: "choice",
    points: 10,
    prompt: "Photosynthesis mainly takes place in which part of the plant cell?",
    timerMinutes: 10,
    timerSeconds: 0,
    options: [
      { id: "a", text: "Nucleus" },
      { id: "b", text: "Chloroplast", isCorrect: true },
      { id: "c", text: "Ribosome" },
      { id: "d", text: "Golgi body" },
    ],
  },
  {
    id: "q2",
    inExam: false,
    label: "Q2",
    preview: "Chain rule applications",
    type: "text",
    points: 10,
    prompt: "Explain the chain rule in differentiation and provide one simple example.",
    timerMinutes: 8,
    timerSeconds: 30,
  },
  {
    id: "q3",
    inExam: false,
    label: "Q3",
    preview: "Implicit differentiation",
    type: "text",
    points: 15,
    prompt: "Write a short explanation of implicit differentiation and when it is useful.",
    timerMinutes: 12,
    timerSeconds: 0,
  },
  {
    id: "q4",
    inExam: true,
    label: "Q4",
    preview: "Derivative rules",
    type: "choice",
    points: 10,
    prompt: "Select the correct statement about the derivative of sin(x).",
    timerMinutes: 10,
    timerSeconds: 0,
    options: [
      { id: "a", text: "d/dx sin(x) = -sin(x)" },
      { id: "b", text: "d/dx sin(x) = cos(x)", isCorrect: true },
      { id: "c", text: "d/dx sin(x) = tan(x)" },
      { id: "d", text: "d/dx sin(x) = sec(x)" },
    ],
  },
];

export const initialExamSettings: ExamSettings = {
  lockNavigation: true,
  randomizeOrder: false,
};

export const initialExamSummary: ExamSummary = {
  totalMinutes: 45,
  totalPoints: 100,
};
