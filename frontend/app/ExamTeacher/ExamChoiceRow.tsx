import type { TeacherQuestion } from "./types";

function getOptionRowClass(isCorrect: boolean) {
  return isCorrect
    ? "border-teal-700 shadow-[0_8px_18px_rgba(13,89,90,0.08)]"
    : "border-slate-200";
}

function getBadgeClass(isCorrect: boolean) {
  return isCorrect
    ? "bg-teal-950 text-white"
    : "bg-[#eef4ff] text-slate-600";
}

function getSelectClass(isCorrect: boolean) {
  return isCorrect
    ? "border-teal-700 bg-white shadow-[inset_0_0_0_5px_#0f766e]"
    : "border-slate-300 bg-white";
}

function getCheckClass(isCorrect: boolean) {
  return isCorrect ? "text-teal-700" : "text-slate-300";
}

type ExamChoiceRowProps = {
  canRemove: boolean;
  index: number;
  onOptionChange: (optionId: string, value: string) => void;
  onRemoveOption: (optionId: string) => void;
  onSelectCorrectOption: (optionId: string) => void;
  option: NonNullable<TeacherQuestion["options"]>[number];
};

export function ExamChoiceRow(props: ExamChoiceRowProps) {
  const isCorrect = props.option.isCorrect ?? false;

  return (
    <div
      className={`grid grid-cols-[14px_40px_minmax(0,1fr)_28px_28px_20px] items-center gap-3 rounded-[14px] border bg-white px-3 py-3 transition ${getOptionRowClass(isCorrect)}`}
    >
      <span className="text-slate-300">⋮</span>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-sm font-semibold ${getBadgeClass(isCorrect)}`}
      >
        {String.fromCharCode(65 + props.index)}
      </span>
      <input
        type="text"
        value={props.option.text}
        onChange={(event) => props.onOptionChange(props.option.id, event.target.value)}
        placeholder="Type option text..."
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
      />
      <button
        type="button"
        onClick={() => props.onSelectCorrectOption(props.option.id)}
        className={`h-5 w-5 rounded-full border transition ${getSelectClass(isCorrect)}`}
      />
      <span className={`text-sm ${getCheckClass(isCorrect)}`}>✓</span>
      {props.canRemove ? (
        <button
          type="button"
          onClick={() => props.onRemoveOption(props.option.id)}
          className="text-sm text-rose-500 transition hover:text-rose-600"
        >
          🗑
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
