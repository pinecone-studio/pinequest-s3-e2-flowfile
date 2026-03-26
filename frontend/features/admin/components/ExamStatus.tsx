import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function ExamStatus({
  activeExams,
  completedExams,
  totalExams,
}: {
  activeExams: number;
  completedExams: number;
  totalExams: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Шалгалтын статус</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Идэвхтэй</span>
          <span className="font-medium text-foreground">{activeExams}</span>
        </div>
        <Progress value={(activeExams / totalExams) * 100} className="h-2" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Дууссан</span>
          <span className="font-medium text-foreground">{completedExams}</span>
        </div>
        <Progress value={(completedExams / totalExams) * 100} className="h-2" />
      </CardContent>
    </Card>
  );
}

export default ExamStatus;
