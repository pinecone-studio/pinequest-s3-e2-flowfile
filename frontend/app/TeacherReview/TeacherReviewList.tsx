import Link from "next/link";
import { reviewSubmissions } from "./data";

function getStatusClass(status: string) {
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

export function TeacherReviewList() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f6f9ff_0%,_#eff5ff_100%)] px-4 py-8 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.24em] text-teal-700 uppercase">
            Teacher Review
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Class Submissions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Open any student submission to review written answers, assign scores, and submit grades.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reviewSubmissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/TeacherReview/${submission.id}`}
              className="rounded-[26px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {submission.studentName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{submission.subtitle}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${getStatusClass(submission.status)}`}
                >
                  {submission.status}
                </span>
              </div>
              <div className="mt-6 rounded-[20px] bg-[#f4f7ff] p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  Assignment
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {submission.assignmentTitle}
                </p>
              </div>
              <p className="mt-5 text-sm font-semibold text-teal-700">Open Review</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
