"use client";

import { useEffect, useState } from "react";

type DashboardPayload = {
  examTitle: string;
  lastSavedAt: string;
  section: string;
  totalMinutes: number;
  totalPoints: number;
};

const fallbackPayload: DashboardPayload = {
  examTitle: "Advanced Calculus Midterm",
  lastSavedAt: "Today, 14:20",
  section: "Differentiation Foundations",
  totalMinutes: 45,
  totalPoints: 100,
};

export function TeacherDashboardClient() {
  const [status, setStatus] = useState("draft");
  const [payload, setPayload] = useState(fallbackPayload);

  useEffect(() => {
    const storedStatus = sessionStorage.getItem("teacherExamStatus");
    const storedPayload = sessionStorage.getItem("teacherExamPayload");

    if (storedStatus) {
      setStatus(storedStatus);
    }

    if (storedPayload) {
      setPayload(JSON.parse(storedPayload) as DashboardPayload);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f5f9ff_0%,_#eef6ff_100%)] px-4 py-8 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-teal-700 uppercase">
              Teacher Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">
              {payload.examTitle}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{payload.section}</p>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              status === "finalized"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "finalized" ? "Finalized" : "Draft saved"}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Last Saved
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {payload.lastSavedAt}
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Exam Time
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {payload.totalMinutes} min
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Total Points
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {payload.totalPoints} pts
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Exam publishing state</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  The latest builder action was saved successfully and is ready for review.
                </p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Next recommended step</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Review question order, verify point distribution, and assign the exam to a class.
                </p>
              </div>
            </div>
          </section>
          <aside className="rounded-[28px] bg-teal-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="mt-5 space-y-4 text-sm text-white/80">
              <p>Exam configuration updated from the teacher builder.</p>
              <p>Question timing and scoring values were adjusted.</p>
              <p>Exam summary settings were refreshed before navigation.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
