"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
} from "lucide-react";
import { mockExams, mockClasses, mockStudents } from "@/lib/data";
import OverviewStats from "./components/OverviewStats";
import SubjectPerformance from "./components/SubjectPerformance";
import ClassPerformance from "./components/ClassPerformance";
import MonthlyTrend from "./components/MonthlyTrend";
import QuickReports from "./components/QuickReports";

export default function AdminReportsPage() {
  // Calculate stats
  const totalExams = mockExams.length;
  const completedExams = mockExams.filter(
    (e) => e.status === "completed",
  ).length;
  const avgScore = 78.5;
  const passRate = 85.2;

  const subjectStats = [
    { subject: "Математик", avgScore: 75.2, examCount: 8, passRate: 82 },
    { subject: "Физик", avgScore: 72.8, examCount: 6, passRate: 78 },
    { subject: "Хими", avgScore: 80.5, examCount: 5, passRate: 88 },
    { subject: "Биологи", avgScore: 82.1, examCount: 4, passRate: 90 },
    { subject: "Англи хэл", avgScore: 77.3, examCount: 7, passRate: 84 },
  ];

  const classStats = mockClasses.map((cls) => ({
    name: cls.name,
    avgScore: Math.floor(Math.random() * 20) + 70,
    examCount: cls.examCount,
    studentCount: cls.studentCount,
  }));

  const monthlyData = [
    { month: "1 сар", exams: 12, students: 450 },
    { month: "2 сар", exams: 15, students: 520 },
    { month: "3 сар", exams: 18, students: 580 },
    { month: "4 сар", exams: 22, students: 640 },
    { month: "5 сар", exams: 25, students: 700 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Тайлан</h1>
          <p className="text-muted-foreground">
            Шалгалтын статистик болон дүн шинжилгээ
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024 он</SelectItem>
              <SelectItem value="2023">2023 он</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Татах
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats
        totalExams={totalExams}
        mockStudents={mockStudents}
        avgScore={avgScore}
        passRate={passRate}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <SubjectPerformance subjectStats={subjectStats} />

        {/* Class Performance */}
        <ClassPerformance classStats={classStats} />
      </div>

      {/* Monthly Trend */}
      <MonthlyTrend monthlyData={monthlyData} />

      {/* Quick Reports */}
      <QuickReports />
    </div>
  );
}
