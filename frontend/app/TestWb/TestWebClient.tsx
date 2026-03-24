"use client";

import { useState } from "react";
import { questionItems } from "./mockData";
import { PreviewPanel } from "./PreviewPanel";
import { QuestionCanvas } from "./QuestionCanvas";
import { TestWbHeader } from "./TestWbHeader";
import { getNextIndex, getPreviousIndex, getTestWbState, initialAnswers } from "./TestWbHelpers";

export function TestWebClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});
  const currentQuestion = questionItems[currentIndex];
  const currentAnswer = answers[currentQuestion.id] ?? "";
  const currentChoice = selectedChoices[currentQuestion.id] ?? null;
  const state = getTestWbState({
    currentAnswer,
    currentChoice,
    currentIndex,
    submitted: submittedIds[currentQuestion.id] ?? false,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eaf2ff_0%,_#f7fbff_45%,_#eefaf4_100%)] px-3 py-6 text-slate-900">
      <div className="mx-auto max-w-[390px] pb-28">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-[#fcfdff] p-3 shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
          <TestWbHeader />
          <div className="space-y-3 rounded-[28px] bg-white p-3">
            <PreviewPanel currentIndex={currentIndex} total={questionItems.length} />
            <QuestionCanvas
              answer={state.currentAnswer}
              canGoPrevious={currentIndex > 0}
              isComplete={state.isComplete}
              isReady={state.isReady}
              nextLabel={state.nextLabel}
              onAnswerChange={(value) =>
                setAnswers((current) => ({ ...current, [currentQuestion.id]: value }))
              }
              onNext={() => {
                if (!state.isReady || state.isComplete) {
                  return;
                }

                setSubmittedIds((current) => ({ ...current, [currentQuestion.id]: true }));

                if (!state.isLastQuestion) {
                  setCurrentIndex((current) => getNextIndex(current));
                }
              }}
              onPrevious={() => setCurrentIndex((current) => getPreviousIndex(current))}
              onSelectChoice={(id) =>
                setSelectedChoices((current) => ({ ...current, [currentQuestion.id]: id }))
              }
              question={currentQuestion}
              selectedChoiceId={state.currentChoice}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
