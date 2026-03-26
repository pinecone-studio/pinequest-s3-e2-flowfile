import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Phone, Edit, Trash2, Eye } from "lucide-react";
import { MockTeacher } from "@/lib/data";

function TeachersTable({
  filteredTeachers,
}: {
  filteredTeachers: MockTeacher[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Багш нарын жагсаалт</CardTitle>
        <CardDescription>
          Нийт {filteredTeachers.length} багш бүртгэлтэй
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Багш</TableHead>
                <TableHead>Хичээл</TableHead>
                <TableHead>Холбоо барих</TableHead>
                <TableHead>Шалгалт</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {teacher.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {teacher.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {teacher.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.phone}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{teacher.examCount}</span>
                    <span className="text-muted-foreground"> шалгалт</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        teacher.status === "active" ? "default" : "secondary"
                      }
                    >
                      {teacher.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                    </Badge>
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

export default TeachersTable;
