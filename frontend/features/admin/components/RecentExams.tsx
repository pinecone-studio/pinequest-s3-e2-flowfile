import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import React from "react";
import { cn } from "./Cn";
import { Badge } from "@/components/ui/badge";
import { MockExam } from "@/lib/data";

function RecentExams({ recentExams }: { recentExams: MockExam[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Сүүлийн шалгалтууд</CardTitle>
          <CardDescription>
            Системд бүртгэгдсэн сүүлийн шалгалтууд
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Бүгдийг харах
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  exam.status === "active"
                    ? "bg-green-500/10"
                    : exam.status === "scheduled"
                      ? "bg-blue-500/10"
                      : "bg-muted",
                )}
              >
                {exam.status === "active" ? (
                  <Clock className="h-5 w-5 text-green-500" />
                ) : exam.status === "scheduled" ? (
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {exam.title}
                </p>
                <p className="text-sm text-muted-foreground">{exam.subject}</p>
              </div>
              <Badge
                variant={
                  exam.status === "active"
                    ? "default"
                    : exam.status === "scheduled"
                      ? "secondary"
                      : "outline"
                }
              >
                {exam.status === "active"
                  ? "Идэвхтэй"
                  : exam.status === "scheduled"
                    ? "Төлөвлөсөн"
                    : "Дууссан"}
              </Badge>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentExams;
