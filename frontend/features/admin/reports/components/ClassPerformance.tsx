import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function ClassPerformance({
  classStats,
}: {
  classStats: {
    name: string;
    avgScore: number;
    examCount: number;
    studentCount: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ангиар</CardTitle>
        <CardDescription>Анги тус бүрийн дундаж оноо</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classStats.map((stat) => (
            <div
              key={stat.name}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{stat.name}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">
                    Дундаж: {stat.avgScore}%
                  </span>
                  <Badge variant="outline">{stat.studentCount} сурагч</Badge>
                </div>
                <Progress value={stat.avgScore} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ClassPerformance;
