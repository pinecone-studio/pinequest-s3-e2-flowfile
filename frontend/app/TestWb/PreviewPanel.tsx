type PreviewPanelProps = {
  currentIndex: number;
  total: number;
};

export function PreviewPanel({ currentIndex, total }: PreviewPanelProps) {
  return (
    <div className="rounded-[20px] bg-[#f3f7ff] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase">
          Явц
        </p>
        <p className="text-sm font-medium text-slate-600">
          {currentIndex + 1} / {total}
        </p>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div
          className="h-full rounded-full bg-teal-700 transition-all"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
