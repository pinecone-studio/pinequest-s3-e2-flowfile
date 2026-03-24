"use client";

import {
  ChoiceList,
  CompletionNotice,
  NavigationBar,
} from "./QuestionCanvasParts";
import { QuestionCanvasMeta } from "./QuestionCanvasMeta";
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

function AnswerInput(props: QuestionCanvasProps) {
  const rows = props.question.kind === "essay" ? 7 : 4;

  if (props.question.kind === "choice") {
    return (
      <ChoiceList
        onSelectChoice={props.onSelectChoice}
        question={props.question}
        selectedChoiceId={props.selectedChoiceId}
      />
    );
  }

  return (
    <textarea
      value={props.answer}
      onChange={(event) => props.onAnswerChange(event.target.value)}
      rows={rows}
      placeholder={props.question.placeholder}
      className="w-full resize-none rounded-[16px] border border-transparent bg-[#eef3ff] px-4 py-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:bg-white"
    />
  );
}

function QuestionBody(props: QuestionCanvasProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg leading-8 font-semibold text-slate-700">
        {props.question.prompt}
      </h2>
      <QuestionCanvasMeta question={props.question} />
      <AnswerInput {...props} />
      {props.isComplete ? <CompletionNotice /> : null}
    </div>
  );
}

export function QuestionCanvas(props: QuestionCanvasProps) {
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
        <QuestionBody {...props} />
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
