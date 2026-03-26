import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function SubjectPerformance({
  subjectStats,
}: {
  subjectStats: {
    subject: string;
    avgScore: number;
    examCount: number;
    passRate: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Хичээлээр</CardTitle>
        <CardDescription>Хичээл тус бүрийн дундаж оноо</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {stat.subject}
                </span>
                <span className="text-muted-foreground">{stat.avgScore}%</span>
              </div>
              <Progress value={stat.avgScore} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stat.examCount} шалгалт</span>
                <span>Тэнцсэн: {stat.passRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SubjectPerformance;
