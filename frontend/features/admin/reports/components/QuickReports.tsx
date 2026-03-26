import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, Users } from "lucide-react";

function QuickReports() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Шалгалтын тайлан</p>
            <p className="text-sm text-muted-foreground">
              Бүх шалгалтуудын дэлгэрэнгүй
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-chart-2/10">
            <Users className="h-6 w-6 text-chart-2" />
          </div>
          <div>
            <p className="font-medium text-foreground">Сурагчдын тайлан</p>
            <p className="text-sm text-muted-foreground">
              Сурагч тус бүрийн дүн
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-chart-3/10">
            <Calendar className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <p className="font-medium text-foreground">Хуваарийн тайлан</p>
            <p className="text-sm text-muted-foreground">Шалгалтын хуваарь</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuickReports;
