"use client";

import Link from "next/link";
import { reviewSubmissions } from "../data";
import type { ReviewSubmission } from "../data";

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

export function SubmissionSidebar({ currentId }: { currentId: string }) {
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
