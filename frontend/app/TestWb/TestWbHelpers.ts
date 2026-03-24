import { questionItems } from "./mockData";
import type { TestWbState } from "./types";

export const initialAnswers = Object.fromEntries(questionItems.map((item) => [item.id, ""]));

export function getNextIndex(currentIndex: number) {
  const lastIndex = questionItems.length - 1;

  return currentIndex >= lastIndex ? lastIndex : currentIndex + 1;
}

export function getPreviousIndex(currentIndex: number) {
  return currentIndex <= 0 ? 0 : currentIndex - 1;
}

export function getTestWbState(params: {
  currentAnswer: string;
  currentChoice: string | null;
  currentIndex: number;
  submitted: boolean;
}): TestWbState {
  const isLastQuestion = params.currentIndex === questionItems.length - 1;
  const isComplete = isLastQuestion && params.submitted;
  const isReady =
    params.currentChoice !== null || params.currentAnswer.trim().length > 0;

  return {
    currentAnswer: params.currentAnswer,
    currentChoice: params.currentChoice,
    isComplete,
    isLastQuestion,
    isReady,
    nextLabel: isLastQuestion ? "Шалгалт дуусгах" : "Дараагийн",
  };
}
