"use client";

import { useState } from "react";
import type { ReviewSubmission } from "../data";

export function GradingPanel({ submission }: { submission: ReviewSubmission }) {
  const [score, setScore] = useState(submission.score.toString());
  const [feedback, setFeedback] = useState(submission.feedbackDraft);
  const [savedState, setSavedState] = useState<"draft" | "submitted" | null>(null);

  function handleScoreChange(value: string) {
    if (value === "") {
      setScore("0");
      return;
    }

    const nextScore = Math.min(submission.scoreMax, Math.max(0, Number(value)));
    setScore(nextScore.toString());
  }

  return (
    <aside className="border-l border-slate-100 bg-[#eef3ff] px-6 py-10">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-2xl font-semibold text-slate-900">Grading Panel</p>
        <p className="mt-1 text-sm text-slate-500">Reviewing: {submission.grader}</p>
        <div className="mt-8 rounded-[22px] border border-teal-200 bg-[#fafeff] p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Assignment Score
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <input
              type="number"
              min={0}
              max={submission.scoreMax}
              value={score}
              onChange={(event) => handleScoreChange(event.target.value)}
              className="w-24 bg-transparent text-5xl font-semibold text-teal-950 outline-none"
            />
            <span className="pb-2 text-3xl font-semibold text-slate-300">
              /{submission.scoreMax}
            </span>
          </div>
          <div className="mt-4 h-1 rounded-full bg-teal-900" />
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Qualitative Feedback
          </p>
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={7}
            className="mt-3 w-full resize-none rounded-[18px] border border-transparent bg-[#f3f6ff] px-4 py-4 text-sm leading-7 text-slate-700 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setSavedState("submitted")}
          className="mt-6 w-full rounded-[14px] bg-teal-900 px-4 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,89,90,0.22)]"
        >
          Submit Grade
        </button>
        <button
          type="button"
          onClick={() => setSavedState("draft")}
          className="mt-4 w-full text-sm font-semibold text-slate-500"
        >
          Save as Draft
        </button>
        {savedState ? (
          <p className="mt-4 text-sm font-medium text-teal-700">
            {savedState === "submitted"
              ? "Grade submitted successfully."
              : "Draft feedback saved."}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
