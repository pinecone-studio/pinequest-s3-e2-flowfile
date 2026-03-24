"use client";

import { GradingPanel } from "./GradingPanel";
import { SubmissionSidebar } from "./SubmissionSidebar";
import type { ReviewSubmission } from "../data";

type ReviewDetailClientProps = {
  submission: ReviewSubmission;
};

export function ReviewDetailClient({ submission }: ReviewDetailClientProps) {
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
        <GradingPanel submission={submission} />
      </div>
    </main>
  );
}
