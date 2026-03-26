import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockTeacher } from "@/lib/data";
import { Plus } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

function AdminClassesPageHeader({
  addDialogOpen,
  setAddDialogOpen,
  mockTeachers,
}: {
  addDialogOpen: boolean;
  setAddDialogOpen: Dispatch<SetStateAction<boolean>>;
  mockTeachers: MockTeacher[];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ангиуд</h1>
        <p className="text-muted-foreground">Бүртгэлтэй ангиудын жагсаалт</p>
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Анги нэмэх
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Шинэ анги нэмэх</DialogTitle>
            <DialogDescription>Ангийн мэдээллийг оруулна уу.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="className">Ангийн нэр</Label>
              <Input id="className" placeholder="Жишээ: 10А" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Түвшин</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Түвшин сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7-р анги</SelectItem>
                  <SelectItem value="8">8-р анги</SelectItem>
                  <SelectItem value="9">9-р анги</SelectItem>
                  <SelectItem value="10">10-р анги</SelectItem>
                  <SelectItem value="11">11-р анги</SelectItem>
                  <SelectItem value="12">12-р анги</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Ангийн багш</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Багш сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
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
  );
}

export default AdminClassesPageHeader;
