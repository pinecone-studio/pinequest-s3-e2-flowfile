import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MonthlyTrend({
  monthlyData,
}: {
  monthlyData: {
    month: string;
    exams: number;
    students: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сарын статистик</CardTitle>
        <CardDescription>Шалгалт болон оролцогчдын тоо</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {monthlyData.map((data, index) => (
            <div
              key={data.month}
              className="text-center p-4 rounded-lg bg-muted/50"
            >
              <div className="h-24 flex items-end justify-center gap-2 mb-3">
                <div
                  className="w-6 bg-primary rounded-t"
                  style={{ height: `${(data.exams / 30) * 100}%` }}
                />
                <div
                  className="w-6 bg-chart-2 rounded-t"
                  style={{ height: `${(data.students / 800) * 100}%` }}
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                {data.month}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {data.exams}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-chart-2" />
                  {data.students}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary" />
            Шалгалтын тоо
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-chart-2" />
            Оролцогчдын тоо
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyTrend;
