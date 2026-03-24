"use client";

import type { QuestionItem } from "./types";

type QuestionCanvasProps = {
  answer: string;
  canGoPrevious: boolean;
  isComplete: boolean;
  isReady: boolean;
  nextLabel: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelectChoice: (id: string) => void;
  question: QuestionItem;
  selectedChoiceId: string | null;
};

function AtomFigure() {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-3">
      <div className="mx-auto flex h-32 max-w-[200px] items-center justify-center rounded-[16px] bg-[radial-gradient(circle_at_top,_#ffffff,_#eef4ff)]">
        <div className="relative h-24 w-32">
          <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 shadow-[0_0_0_10px_rgba(244,63,94,0.15)]" />
          <div className="absolute inset-2 rounded-full border border-slate-300" />
          <div className="absolute inset-2 rotate-[60deg] rounded-full border border-slate-300" />
          <div className="absolute inset-2 -rotate-[60deg] rounded-full border border-slate-300" />
          <div className="absolute left-1 top-7 h-3 w-3 rounded-full bg-sky-500" />
          <div className="absolute right-3 top-3 h-3 w-3 rounded-full bg-sky-500" />
          <div className="absolute bottom-2 right-7 h-3 w-3 rounded-full bg-sky-500" />
        </div>
      </div>
    </div>
  );
}

function ChoiceList({
  onSelectChoice,
  question,
  selectedChoiceId,
}: Pick<
  QuestionCanvasProps,
  "onSelectChoice" | "question" | "selectedChoiceId"
>) {
  return (
    <div className="space-y-3">
      {question.choices?.map((choice) => {
        const isSelected = choice.id === selectedChoiceId;

        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onSelectChoice(choice.id)}
            className={`flex w-full items-start gap-3 rounded-[14px] border px-3 py-3 text-left transition ${
              isSelected
                ? "border-teal-400 bg-teal-50 shadow-[0_8px_20px_rgba(13,148,136,0.12)]"
                : "border-transparent bg-[#eef3ff]"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#dce7ff] text-xs font-bold text-slate-700">
              {choice.label}
            </span>
            <span className="text-sm leading-6 text-slate-800">{choice.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function CompletionNotice() {
  return (
    <div className="rounded-[16px] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
      Бүх даалгавар дууслаа.
    </div>
  );
}

function NavigationBar({
  canGoPrevious,
  isComplete,
  isReady,
  nextLabel,
  onNext,
  onPrevious,
}: Pick<
  QuestionCanvasProps,
  "canGoPrevious" | "isComplete" | "isReady" | "nextLabel" | "onNext" | "onPrevious"
>) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[390px] px-6 pb-5">
      <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/80 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-[12px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Өмнөх
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isReady || isComplete}
          className="rounded-[12px] bg-teal-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export function QuestionCanvas(props: QuestionCanvasProps) {
  const rows = props.question.kind === "essay" ? 7 : 4;

  return (
    <>
      <section className="rounded-[28px] bg-white px-4 pb-32 pt-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-teal-900">
            <span>0:20</span>
            <span className="font-normal text-slate-400">үлдсэн</span>
          </div>
          <span>X</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg leading-8 font-semibold text-slate-700">
            {props.question.prompt}
          </h2>
          {props.question.helperText ? (
            <p className="text-sm font-medium text-slate-900">
              {props.question.helperText}
            </p>
          ) : null}
          {props.question.visual === "atom" ? <AtomFigure /> : null}
          {props.question.mathLines ? (
            <div className="rounded-[16px] bg-[#eef3ff] px-4 py-3 text-base leading-8 text-slate-900">
              {props.question.mathLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
          {props.question.kind === "choice" ? (
            <ChoiceList
              onSelectChoice={props.onSelectChoice}
              question={props.question}
              selectedChoiceId={props.selectedChoiceId}
            />
          ) : (
            <textarea
              value={props.answer}
              onChange={(event) => props.onAnswerChange(event.target.value)}
              rows={rows}
              placeholder={props.question.placeholder}
              className="w-full resize-none rounded-[16px] border border-transparent bg-[#eef3ff] px-4 py-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:bg-white"
            />
          )}
          {props.isComplete ? <CompletionNotice /> : null}
        </div>
      </section>
      <NavigationBar
        canGoPrevious={props.canGoPrevious}
        isComplete={props.isComplete}
        isReady={props.isReady}
        nextLabel={props.nextLabel}
        onNext={props.onNext}
        onPrevious={props.onPrevious}
      />
    </>
  );
}
