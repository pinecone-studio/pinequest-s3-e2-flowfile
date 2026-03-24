import { AtomFigure } from "./QuestionCanvasParts";
import type { QuestionItem } from "./types";

function HelperText({ text }: { text: string }) {
  return <p className="text-sm font-medium text-slate-900">{text}</p>;
}

function MathBlock({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-[16px] bg-[#eef3ff] px-4 py-3 text-base leading-8 text-slate-900">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function QuestionCanvasMeta({ question }: { question: QuestionItem }) {
  return (
    <>
      {question.helperText ? <HelperText text={question.helperText} /> : null}
      {question.visual === "atom" ? <AtomFigure /> : null}
      {question.mathLines ? <MathBlock lines={question.mathLines} /> : null}
    </>
  );
}
