type ExamTeacherHeaderProps = {
  onFinalize: () => void;
  onSaveDraft: () => void;
};

export function ExamTeacherHeader({
  onFinalize,
  onSaveDraft,
}: ExamTeacherHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold text-slate-900">
          Advanced Calculus Midterm
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Drafting Section A: Differentiation Foundations
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-[14px] bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onFinalize}
          className="rounded-[14px] bg-teal-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(13,89,90,0.25)]"
        >
          Finalize Exam
        </button>
      </div>
    </div>
  );
}
