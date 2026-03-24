import { ExamChoiceRow } from "./ExamChoiceRow";
import type { TeacherQuestion } from "./types";

type ExamChoiceEditorProps = {
  onAddOption: () => void;
  onOptionChange: (optionId: string, value: string) => void;
  onRemoveOption: (optionId: string) => void;
  onSelectCorrectOption: (optionId: string) => void;
  question: TeacherQuestion;
};

export function ExamChoiceEditor({
  onAddOption,
  onOptionChange,
  onRemoveOption,
  onSelectCorrectOption,
  question,
}: ExamChoiceEditorProps) {
  const canRemove = Boolean(question.options && question.options.length > 2);

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <ExamChoiceRow
          key={option.id}
          canRemove={canRemove}
          index={index}
          onOptionChange={onOptionChange}
          onRemoveOption={onRemoveOption}
          onSelectCorrectOption={onSelectCorrectOption}
          option={option}
        />
      ))}
      <button
        type="button"
        onClick={onAddOption}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500"
      >
        <span className="text-base">⊕</span>
        <span>Add New Option</span>
      </button>
    </div>
  );
}
