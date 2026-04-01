import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Eye, Edit, Copy, Trash2, Clock, Users } from 'lucide-react'
import type { Exam } from '@/lib/types'

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Идэвхтэй</Badge>
    case 'scheduled': return <Badge variant="secondary">Төлөвлөсөн</Badge>
    case 'completed': return <Badge variant="outline">Дууссан</Badge>
    case 'draft': return <Badge variant="outline" className="text-muted-foreground">Ноорог</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function AdminExamRow({ exam, getTeacherName }: { exam: Exam & { subject?: string; totalQuestions?: number; totalPoints?: number; totalStudents?: number }; getTeacherName: (id: string) => string }) {
  return (
    <TableRow key={exam.id}>
      <TableCell>
        <div>
          <p className="font-medium text-foreground">{exam.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{exam.subject}</Badge>
            <span className="text-xs text-muted-foreground">
              {exam.totalQuestions} асуулт • {exam.totalPoints} оноо
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{getTeacherName(exam.ownerId)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {exam.duration} мин
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {exam.totalStudents ?? 0}
        </div>
      </TableCell>
      <TableCell><StatusBadge status={exam.status} /></TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Дэлгэрэнгүй</DropdownMenuItem>
            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Засах</DropdownMenuItem>
            <DropdownMenuItem><Copy className="mr-2 h-4 w-4" />Хуулах</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Устгах</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
