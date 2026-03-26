import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MockClass } from "@/lib/data";
import {
  Edit,
  Eye,
  MoreHorizontal,
  School,
  Table,
  Trash2,
  Users,
} from "lucide-react";

function ClassesTable({
  filteredClasses,
  getTeacherName,
}: {
  filteredClasses: MockClass[];
  getTeacherName: (teacherId: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ангиудын жагсаалт</CardTitle>
        <CardDescription>
          Нийт {filteredClasses.length} анги бүртгэлтэй
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Анги</TableHead>
                <TableHead>Түвшин</TableHead>
                <TableHead>Багш</TableHead>
                <TableHead>Сурагчид</TableHead>
                <TableHead>Шалгалт</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <School className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {cls.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {cls.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cls.grade}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {getTeacherName(cls.teacherId)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cls.studentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{cls.examCount}</span>
                    <span className="text-muted-foreground"> шалгалт</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Дэлгэрэнгүй
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Засах
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClassesTable;
