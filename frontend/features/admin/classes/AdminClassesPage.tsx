"use client";

import { useState } from "react";
import { mockClasses, mockTeachers } from "@/lib/data";
import ClassesTable from "./components/ClassesTable";
import Stats from "./components/Stats";
import AdminClassesPageHeader from "./components/AdminClassesPageHeader";
import ClassesFilters from "./components/ClassesFilters";

export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredClasses = mockClasses.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getTeacherName = (teacherId: string) => {
    const teacher = mockTeachers.find((t) => t.id === teacherId);
    return teacher?.name || "Тодорхойгүй";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminClassesPageHeader
        addDialogOpen={addDialogOpen}
        setAddDialogOpen={setAddDialogOpen}
        mockTeachers={mockTeachers}
      />

      {/* Stats */}
      <Stats mockClasses={mockClasses} />

      {/* Filters */}
      <ClassesFilters
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Classes Table */}
      <ClassesTable
        getTeacherName={getTeacherName}
        filteredClasses={filteredClasses}
      />
    </div>
  );
}
