import { Progress } from '@/components/ui/progress'

type SubjectStat = { subject: string; avgScore: number; examCount: number; passRate: number }

export function SubjectChart({ subjectStats }: { subjectStats: SubjectStat[] }) {
  return (
    <div className="space-y-4">
      {subjectStats.map(stat => (
        <div key={stat.subject} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{stat.subject}</span>
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
  )
}
