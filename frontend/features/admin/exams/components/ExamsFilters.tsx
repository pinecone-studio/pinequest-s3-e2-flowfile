import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

function ExamsFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  subjectFilter: string;
  setSubjectFilter: Dispatch<SetStateAction<string>>;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Шалгалт хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх статус</SelectItem>
              <SelectItem value="active">Идэвхтэй</SelectItem>
              <SelectItem value="scheduled">Төлөвлөсөн</SelectItem>
              <SelectItem value="completed">Дууссан</SelectItem>
              <SelectItem value="draft">Ноорог</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх хичээл</SelectItem>
              <SelectItem value="математик">Математик</SelectItem>
              <SelectItem value="физик">Физик</SelectItem>
              <SelectItem value="хими">Хими</SelectItem>
              <SelectItem value="биологи">Биологи</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExamsFilters;
