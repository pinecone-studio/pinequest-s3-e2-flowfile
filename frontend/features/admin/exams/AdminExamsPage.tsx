"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { mockExams, mockTeachers } from "@/lib/data";
import StatsCards from "./components/StatsCards";
import ExamsFilters from "./components/ExamsFilters";
import ExamsTable from "./components/ExamsTable";

export default function AdminExamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || exam.status === statusFilter;
    const matchesSubject =
      subjectFilter === "all" ||
      exam.subject.toLowerCase().includes(subjectFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Идэвхтэй
          </Badge>
        );
      case "scheduled":
        return <Badge variant="secondary">Төлөвлөсөн</Badge>;
      case "completed":
        return <Badge variant="outline">Дууссан</Badge>;
      case "draft":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Ноорог
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = mockTeachers.find((t) => t.id === teacherId);
    return teacher?.name || "Тодорхойгүй";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Шалгалтууд</h1>
          <p className="text-muted-foreground">Бүх шалгалтуудын жагсаалт</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Тайлан татах
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards mockExams={mockExams} />

      {/* Filters */}
      <ExamsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
      />

      {/* Exams Table */}
      <ExamsTable
        filteredExams={filteredExams}
        getTeacherName={getTeacherName}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
