"use client";

import { ExamChoiceEditor } from "./ExamChoiceEditor";
import { ExamResponseSelector } from "./ExamResponseSelector";
import { RichTextEditor } from "./RichTextEditor";
import type { TeacherQuestion, TeacherQuestionType } from "./types";

type ExamCanvasProps = {
  content: string;
  onAddToExam: () => void;
  onAddOption: () => void;
  onChangeContent: (value: string) => void;
  onDiscard: () => void;
  onOptionChange: (optionId: string, value: string) => void;
  onRemoveOption: (optionId: string) => void;
  onSelectCorrectOption: (optionId: string) => void;
  onSelectType: (type: TeacherQuestionType) => void;
  question: TeacherQuestion;
};

export function ExamCanvas(props: ExamCanvasProps) {
  const isChoice = props.question.type === "choice";

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[#dff8f4] px-3 py-1 text-xs font-semibold text-teal-700">
            {props.question.label}
          </span>
          <h2 className="mt-3 text-[1.75rem] font-semibold text-slate-900">
            Configuration
          </h2>
        </div>
        <p className="text-xs font-medium text-slate-400">Draft saved 2m ago</p>
      </div>
      <div className="mt-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Question Content
        </p>
        <RichTextEditor onChange={props.onChangeContent} value={props.content} />
      </div>
      <div className="mt-6 rounded-[22px] bg-[#f7faff] p-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Response Mechanism
        </p>
        <ExamResponseSelector
          onSelectType={props.onSelectType}
          selectedType={props.question.type}
        />
        <div className="mt-5 min-h-52 rounded-[18px] bg-[#f3f7ff] p-4">
          {isChoice ? (
            <ExamChoiceEditor
              onAddOption={props.onAddOption}
              onOptionChange={props.onOptionChange}
              onRemoveOption={props.onRemoveOption}
              onSelectCorrectOption={props.onSelectCorrectOption}
              question={props.question}
            />
          ) : (
            <div className="rounded-[16px] border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-400">
              Student answers will be collected in a rich text response box.
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={props.onDiscard}
          className="text-sm font-semibold text-rose-500"
        >
          Discard Question
        </button>
        <button
          type="button"
          onClick={props.onAddToExam}
          className="rounded-[14px] bg-teal-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(13,89,90,0.2)]"
        >
          {props.question.inExam ? "Updated in Exam" : "Add Question to Exam"}
        </button>
      </div>
    </section>
  );
}
