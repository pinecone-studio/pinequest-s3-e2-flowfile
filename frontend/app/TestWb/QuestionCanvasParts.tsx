"use client";

import type { QuestionItem } from "./types";

type ChoiceListProps = {
  onSelectChoice: (id: string) => void;
  question: QuestionItem;
  selectedChoiceId: string | null;
};

type NavigationBarProps = {
  canGoPrevious: boolean;
  isComplete: boolean;
  isReady: boolean;
  nextLabel: string;
  onNext: () => void;
  onPrevious: () => void;
};

export function AtomFigure() {
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

export function ChoiceList({
  onSelectChoice,
  question,
  selectedChoiceId,
}: ChoiceListProps) {
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

export function CompletionNotice() {
  return (
    <div className="rounded-[16px] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
      Бүх даалгавар дууслаа.
    </div>
  );
}

export function NavigationBar(props: NavigationBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[390px] px-6 pb-5">
      <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/80 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={props.onPrevious}
          disabled={!props.canGoPrevious}
          className="rounded-[12px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Өмнөх
        </button>
        <button
          type="button"
          onClick={props.onNext}
          disabled={!props.isReady || props.isComplete}
          className="rounded-[12px] bg-teal-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {props.nextLabel}
        </button>
      </div>
    </div>
  );
}
