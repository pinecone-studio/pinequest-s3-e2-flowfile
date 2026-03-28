import { Card, CardContent } from "@/components/ui/card";
import { MockClass } from "@/lib/data";
import { School, Users } from "lucide-react";

function Stats({ mockClasses }: { mockClasses: MockClass[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockClasses.length}
              </p>
              <p className="text-sm text-muted-foreground">Нийт анги</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Users className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockClasses.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Нийт сурагч</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(
                  mockClasses.reduce((sum, c) => sum + c.studentCount, 0) /
                    mockClasses.length,
                )}
              </p>
              <p className="text-sm text-muted-foreground">Дундаж сурагч</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <School className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(mockClasses.map((c) => c.grade)).size}
              </p>
              <p className="text-sm text-muted-foreground">Түвшин</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Stats;
