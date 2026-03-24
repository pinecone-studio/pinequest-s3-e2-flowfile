import type { ExamSummary, TeacherQuestion, TeacherQuestionType } from "./types";

const defaultChoiceOptions = [
  { id: "a", text: "Option A" },
  { id: "b", text: "Option B", isCorrect: true },
  { id: "c", text: "Option C" },
  { id: "d", text: "Option D" },
];

export function createQuestion(questionNumber: number): TeacherQuestion {
  return {
    id: `q${questionNumber}`,
    inExam: false,
    label: `Q${questionNumber}`,
    preview: "New question",
    points: 5,
    prompt: "Type your question here...",
    timerMinutes: 5,
    timerSeconds: 0,
    type: "text",
  };
}

export function createQuestionPreview(prompt: string) {
  const compact = prompt.replace(/<[^>]*>/g, " ").trim().replace(/\s+/g, " ");

  return compact.length > 28 ? `${compact.slice(0, 28)}...` : compact || "Untitled question";
}

export function getQuestionTypeUpdate(
  question: TeacherQuestion,
  nextType: TeacherQuestionType,
) {
  if (nextType === "choice") {
    return {
      ...question,
      options: question.options ?? defaultChoiceOptions,
      type: nextType,
    };
  }

  return {
    ...question,
    type: nextType,
  };
}

export function getStoredExamPayload(summary: ExamSummary) {
  return JSON.stringify({
    examTitle: "Advanced Calculus Midterm",
    lastSavedAt: "Today, 14:20",
    section: "Differentiation Foundations",
    totalMinutes: summary.totalMinutes,
    totalPoints: summary.totalPoints,
  });
}

export function getInitialContent(questions: TeacherQuestion[]) {
  return Object.fromEntries(questions.map((question) => [question.id, question.prompt]));
}

export function updateQuestion(
  questions: TeacherQuestion[],
  questionId: string,
  updater: (question: TeacherQuestion) => TeacherQuestion,
) {
  return questions.map((question) =>
    question.id === questionId ? updater(question) : question,
  );
}

export function createChoiceOption(optionCount: number) {
  const optionLabel = String.fromCharCode(65 + optionCount);

  return {
    id: `option-${optionCount + 1}`,
    text: `Option ${optionLabel}`,
  };
}
