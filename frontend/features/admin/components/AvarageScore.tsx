import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AvarageScore({ avgScore }: { avgScore: 78.5 }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Дундаж оноо</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(avgScore / 100) * 352} 352`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {avgScore}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvarageScore;
