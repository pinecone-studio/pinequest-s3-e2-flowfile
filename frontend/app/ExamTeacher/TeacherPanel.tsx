import type { ExamSummary } from "./types";

type TeacherPanelProps = {
  lockNavigation: boolean;
  onChangePoints: (value: number) => void;
  onChangeSummary: (field: keyof ExamSummary, value: number) => void;
  onChangeTimer: (field: "timerMinutes" | "timerSeconds", value: number) => void;
  onToggleSetting: (field: "lockNavigation" | "randomizeOrder") => void;
  points: number;
  randomize: boolean;
  summary: ExamSummary;
  timerMinutes: number;
  timerSeconds: number;
};

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="rounded-[16px] bg-slate-50 p-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase">{label}</p>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full bg-transparent text-2xl font-semibold text-slate-900 outline-none"
      />
    </label>
  );
}

function ToggleRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-center justify-between"
    >
      <span className="text-sm text-white/90">{label}</span>
      <span
        className={`relative flex h-7 w-12 items-center rounded-full p-1 transition-all duration-300 ${
          checked
            ? "bg-teal-300 shadow-[0_0_0_4px_rgba(94,234,212,0.12)]"
            : "bg-white/20 group-hover:bg-white/30"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export function TeacherPanel(props: TeacherPanelProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Question Parameters
        </p>
        <div className="mt-4 grid gap-3">
          <NumberField
            label="Timer Minutes"
            onChange={(value) => props.onChangeTimer("timerMinutes", value)}
            value={props.timerMinutes}
          />
          <NumberField
            label="Timer Seconds"
            onChange={(value) => props.onChangeTimer("timerSeconds", value)}
            value={props.timerSeconds}
          />
          <NumberField
            label="Points"
            onChange={props.onChangePoints}
            value={props.points}
          />
        </div>
      </div>
      <div className="rounded-[24px] bg-teal-950 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
          Global Options
        </p>
        <div className="mt-4 space-y-4">
          <ToggleRow
            checked={props.randomize}
            label="Randomize Order"
            onToggle={() => props.onToggleSetting("randomizeOrder")}
          />
          <ToggleRow
            checked={props.lockNavigation}
            label="Lock Question Navigation"
            onToggle={() => props.onToggleSetting("lockNavigation")}
          />
        </div>
      </div>
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Exam Summary
        </p>
        <div className="mt-4 grid gap-3">
          <NumberField
            label="Total Minutes"
            onChange={(value) => props.onChangeSummary("totalMinutes", value)}
            value={props.summary.totalMinutes}
          />
          <NumberField
            label="Total Points"
            onChange={(value) => props.onChangeSummary("totalPoints", value)}
            value={props.summary.totalPoints}
          />
        </div>
      </div>
    </aside>
  );
}
