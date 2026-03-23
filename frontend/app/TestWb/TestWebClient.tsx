"use client";

import { useState } from "react";
import { questionItems } from "./mockData";
import { PreviewPanel } from "./PreviewPanel";
import { QuestionCanvas } from "./QuestionCanvas";

const initialAnswers = Object.fromEntries(questionItems.map((item) => [item.id, ""]));

function getNextIndex(currentIndex: number) {
  const lastIndex = questionItems.length - 1;

  return currentIndex >= lastIndex ? lastIndex : currentIndex + 1;
}

function getPreviousIndex(currentIndex: number) {
  return currentIndex <= 0 ? 0 : currentIndex - 1;
}

export function TestWebClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});

  const currentQuestion = questionItems[currentIndex];
  const currentAnswer = answers[currentQuestion.id] ?? "";
  const currentChoice = selectedChoices[currentQuestion.id] ?? null;
  const isLastQuestion = currentIndex === questionItems.length - 1;
  const isComplete = isLastQuestion && Boolean(submittedIds[currentQuestion.id]);
  const isReady =
    currentQuestion.kind === "choice"
      ? currentChoice !== null
      : currentAnswer.trim().length > 0;
  const nextLabel = isLastQuestion ? "Шалгалт дуусгах" : "Дараагийн";

  function handleAnswerChange(value: string) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
  }

  function handleChoiceSelect(id: string) {
    setSelectedChoices((current) => ({ ...current, [currentQuestion.id]: id }));
  }

  function handlePrevious() {
    setCurrentIndex((current) => getPreviousIndex(current));
  }

  function handleNext() {
    if (!isReady || isComplete) {
      return;
    }

    setSubmittedIds((current) => ({ ...current, [currentQuestion.id]: true }));

    if (!isLastQuestion) {
      setCurrentIndex((current) => getNextIndex(current));
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eaf2ff_0%,_#f7fbff_45%,_#eefaf4_100%)] px-3 py-6 text-slate-900">
      <div className="mx-auto max-w-[390px] pb-28">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-[#fcfdff] p-3 shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
          <div className="mb-3 flex items-center justify-between px-2 pt-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-teal-700 uppercase">
                TestWb
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">
                10 жилийн шалгалт
              </h1>
            </div>
            <div className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-medium text-slate-600">
              Mobile
            </div>
          </div>
          <div className="space-y-3 rounded-[28px] bg-white p-3">
            <PreviewPanel currentIndex={currentIndex} total={questionItems.length} />
            <QuestionCanvas
              answer={currentAnswer}
              canGoPrevious={currentIndex > 0}
              isComplete={isComplete}
              isReady={isReady}
              nextLabel={nextLabel}
              onAnswerChange={handleAnswerChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSelectChoice={handleChoiceSelect}
              question={currentQuestion}
              selectedChoiceId={currentChoice}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
