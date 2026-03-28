import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MockTeacher } from "@/lib/data";
import React from "react";

function TopTeachers({ mockTeachers }: { mockTeachers: MockTeacher[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Идэвхтэй багш нар</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTeachers.slice(0, 3).map((teacher, index) => (
            <div key={teacher.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={teacher.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {teacher.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {teacher.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {teacher.subject}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {teacher.examCount} шалгалт
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default TopTeachers;
