"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { mockTeachers } from "@/lib/data";
import TeachersFilters from "./components/TeachersFilters";
import TeachersTable from "./components/TeachersTable";

export default function AdminTeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredTeachers = mockTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Багш нар</h1>
          <p className="text-muted-foreground">
            Бүртгэлтэй багш нарын жагсаалт
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Багш нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Шинэ багш нэмэх</DialogTitle>
              <DialogDescription>
                Багшийн мэдээллийг оруулна уу.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Нэр</Label>
                <Input id="name" placeholder="Багшийн нэр" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Утас</Label>
                <Input id="phone" placeholder="99001122" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Хичээл</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Хичээл сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Математик</SelectItem>
                    <SelectItem value="physics">Физик</SelectItem>
                    <SelectItem value="chemistry">Хими</SelectItem>
                    <SelectItem value="biology">Биологи</SelectItem>
                    <SelectItem value="english">Англи хэл</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>Хадгалах</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <TeachersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Teachers Table */}
      <TeachersTable filteredTeachers={filteredTeachers} />
    </div>
  );
}
