"use client";

import Link from "next/link";
import { useState } from "react";
import { reviewSubmissions } from "../data";
import type { ReviewSubmission } from "../data";

type ReviewDetailClientProps = {
  submission: ReviewSubmission;
};

function getStatusClass(status: ReviewSubmission["status"]) {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "graded") {
    return "bg-slate-100 text-slate-500";
  }

  if (status === "in-progress") {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-slate-100 text-slate-400";
}

function SubmissionSidebar({ currentId }: { currentId: string }) {
  return (
    <aside className="border-r border-slate-100 bg-[#fcfdff] px-5 py-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
        Class Submissions
      </p>
      <Link
        href="/TeacherReview"
        className="mt-6 inline-flex text-sm font-semibold text-teal-700"
      >
        ← Back to list
      </Link>
      <div className="mt-6 space-y-3">
        {reviewSubmissions.map((item) => {
          const isActive = item.id === currentId;

          return (
            <Link
              key={item.id}
              href={`/TeacherReview/${item.id}`}
              className={`block rounded-[18px] border px-4 py-3 transition ${
                isActive
                  ? "border-transparent bg-[#dfe9ff]"
                  : "border-transparent bg-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.studentName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getStatusClass(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function ReviewDetailClient({ submission }: ReviewDetailClientProps) {
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
    <main className="min-h-screen bg-white text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <SubmissionSidebar currentId={submission.id} />
        <section className="px-8 py-10">
          <p className="text-sm text-slate-500">{submission.assignmentTitle}</p>
          <h1 className="mt-2 text-5xl font-semibold text-slate-900">
            {submission.studentName}
          </h1>
          <div className="mt-8 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Question Content
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-slate-900">
              {submission.questionTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-500">
              {submission.questionBody}
            </p>
          </div>
          <div className="mt-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Student Response
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{submission.wordCount} Words</span>
                <span className="font-semibold text-teal-700">View Grammar Analysis</span>
              </div>
            </div>
            <div className="space-y-6 text-[1.05rem] leading-10 text-slate-700">
              {submission.studentResponse.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
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
      </div>
    </main>
  );
}
