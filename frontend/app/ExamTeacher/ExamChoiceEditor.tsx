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
  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <div
          key={option.id}
          className={`grid grid-cols-[14px_40px_minmax(0,1fr)_28px_28px_20px] items-center gap-3 rounded-[14px] border bg-white px-3 py-3 transition ${
            option.isCorrect
              ? "border-teal-700 shadow-[0_8px_18px_rgba(13,89,90,0.08)]"
              : "border-slate-200"
          }`}
        >
          <span className="text-slate-300">⋮</span>
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-sm font-semibold ${
              option.isCorrect
                ? "bg-teal-950 text-white"
                : "bg-[#eef4ff] text-slate-600"
            }`}
          >
            {String.fromCharCode(65 + index)}
          </span>
          <div className="min-w-0">
            <input
              type="text"
              value={option.text}
              onChange={(event) => onOptionChange(option.id, event.target.value)}
              placeholder="Type option text..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => onSelectCorrectOption(option.id)}
            className={`h-5 w-5 rounded-full border transition ${
              option.isCorrect
                ? "border-teal-700 bg-white shadow-[inset_0_0_0_5px_#0f766e]"
                : "border-slate-300 bg-white"
            }`}
          />
          <span
            className={`text-sm ${option.isCorrect ? "text-teal-700" : "text-slate-300"}`}
          >
            ✓
          </span>
          {question.options && question.options.length > 2 ? (
            <button
              type="button"
              onClick={() => onRemoveOption(option.id)}
              className="text-sm text-rose-500 transition hover:text-rose-600"
            >
              🗑
            </button>
          ) : (
            <span />
          )}
        </div>
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
