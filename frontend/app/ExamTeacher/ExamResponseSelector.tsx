import type { TeacherQuestionType } from "./types";

type ExamResponseSelectorProps = {
  onSelectType: (type: TeacherQuestionType) => void;
  selectedType: TeacherQuestionType;
};

function TypeCard({
  icon,
  active,
  label,
  onClick,
  subtitle,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-[16px] border p-4 text-left transition ${
        active
          ? "border-teal-700 bg-white shadow-[0_10px_24px_rgba(13,89,90,0.08)]"
          : "border-transparent bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">{icon}</span>
        <span
          className={`h-4 w-4 rounded-full border ${
            active ? "border-teal-700 shadow-[inset_0_0_0_4px_#0f766e]" : "border-slate-300"
          }`}
        />
      </div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </button>
  );
}

export function ExamResponseSelector({
  onSelectType,
  selectedType,
}: ExamResponseSelectorProps) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <TypeCard
        active={selectedType === "text"}
        icon="☰"
        label="Text Box"
        onClick={() => onSelectType("text")}
        subtitle="Open-ended student response"
      />
      <TypeCard
        active={selectedType === "choice"}
        icon="▦"
        label="Multiple Choice"
        onClick={() => onSelectType("choice")}
        subtitle="Single correct option"
      />
    </div>
  );
}
