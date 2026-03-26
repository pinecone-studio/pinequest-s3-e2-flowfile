"use client";

import {
  Users,
  FileText,
  School,
} from "lucide-react";
import { mockExams, mockClasses, mockTeachers, mockStudents } from "@/lib/data";
import StatsGrid from "./components/StatsGrid";
import RecentExams from "./components/RecentExams";
import ExamStatus from "./components/ExamStatus";
import AvarageScore from "./components/AvarageScore";
import TopTeachers from "./components/TopTeachers";

export default function AdminDashboardPage() {
  const totalTeachers = mockTeachers.length;
  const totalStudents = mockStudents.length;
  const totalExams = mockExams.length;
  const totalClasses = mockClasses.length;

  const activeExams = mockExams.filter((e) => e.status === "active").length;
  const completedExams = mockExams.filter(
    (e) => e.status === "completed",
  ).length;
  const avgScore = 78.5;

  const recentExams = mockExams.slice(0, 5);

  const stats = [
    {
      title: "Нийт багш",
      value: totalTeachers,
      change: "+2",
      trend: "up",
      icon: Users,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Нийт сурагч",
      value: totalStudents,
      change: "+15",
      trend: "up",
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Нийт шалгалт",
      value: totalExams,
      change: "+5",
      trend: "up",
      icon: FileText,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Нийт анги",
      value: totalClasses,
      change: "0",
      trend: "neutral",
      icon: School,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Хянах самбар</h1>
        <p className="text-muted-foreground">Системийн ерөнхий мэдээлэл</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <RecentExams recentExams={recentExams} />

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Exam Status */}
       <ExamStatus activeExams={activeExams} totalExams={totalExams} completedExams={completedExams} />

          {/* Average Score */}
         <AvarageScore avgScore={avgScore} />

          {/* Top Teachers */}
         <TopTeachers mockTeachers={mockTeachers} />
        </div>
      </div>
    </div>
  );
}
