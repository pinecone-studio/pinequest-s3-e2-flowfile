import type { TeacherQuestion } from "./types";

type QuestionSidebarProps = {
  activeId: string;
  onCreateQuestion: () => void;
  onSelect: (id: string) => void;
  questions: TeacherQuestion[];
};

export function QuestionSidebar({
  activeId,
  onCreateQuestion,
  onSelect,
  questions,
}: QuestionSidebarProps) {
  return (
    <aside className="rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Exam Questions
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {questions.length} total
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((question) => {
          const isActive = question.id === activeId;

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelect(question.id)}
              className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                isActive
                  ? "border-teal-700 bg-teal-50"
                  : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-400">{question.label}</p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                    question.inExam
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {question.inExam ? "Added" : "Draft"}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                {question.preview}
              </p>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onCreateQuestion}
        className="mt-4 w-full rounded-[18px] border border-dashed border-teal-200 bg-[#f4fbfb] px-4 py-3 text-sm font-semibold text-teal-700"
      >
        + New Question
      </button>
    </aside>
  );
}
