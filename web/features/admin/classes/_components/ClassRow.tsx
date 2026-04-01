import { School, Users, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { SchoolClass } from '@/lib/types'

export function ClassRow({ cls, getTeacherName }: { cls: SchoolClass; getTeacherName: (id: string) => string }) {
  return (
    <TableRow key={cls.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{cls.name}</p>
            <p className="text-sm text-muted-foreground">ID: {cls.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{cls.grade}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{getTeacherName(cls.homeroomTeacherId)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{cls.studentIds?.length || 0}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">0</span>
        <span className="text-muted-foreground"> шалгалт</span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Дэлгэрэнгүй
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Засах
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Устгах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
