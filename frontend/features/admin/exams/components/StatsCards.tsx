import { Card, CardContent } from "@/components/ui/card";
import { MockExam } from "@/lib/data";
import { Clock, FileText } from "lucide-react";


function StatsCards({ mockExams }: { mockExams: MockExam[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockExams.length}
              </p>
              <p className="text-sm text-muted-foreground">Нийт шалгалт</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockExams.filter((e) => e.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Идэвхтэй</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockExams.filter((e) => e.status === "scheduled").length}
              </p>
              <p className="text-sm text-muted-foreground">Төлөвлөсөн</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockExams.filter((e) => e.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Дууссан</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsCards;
