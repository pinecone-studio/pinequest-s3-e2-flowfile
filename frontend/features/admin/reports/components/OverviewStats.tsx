import { Card, CardContent } from "@/components/ui/card";
import { MockStudent } from "@/lib/data";
import {
  Award,
  BarChart3,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

function OverviewStats({
  totalExams,
  mockStudents,
  avgScore,
  passRate,
}: {
  totalExams: number;
  mockStudents: MockStudent[];
  avgScore: 78.5;
  passRate: 85.2;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">{totalExams}</p>
            <p className="text-sm text-muted-foreground">Нийт шалгалт</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Users className="h-5 w-5 text-chart-2" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              +8%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {mockStudents.length}
            </p>
            <p className="text-sm text-muted-foreground">Оролцсон сурагч</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <BarChart3 className="h-5 w-5 text-chart-3" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              +3%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
            <p className="text-sm text-muted-foreground">Дундаж оноо</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Award className="h-5 w-5 text-chart-4" />
            </div>
            <div className="flex items-center gap-1 text-sm text-red-500">
              <TrendingDown className="h-4 w-4" />
              -2%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">{passRate}%</p>
            <p className="text-sm text-muted-foreground">Тэнцсэн хувь</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverviewStats;
