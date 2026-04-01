import { Mail, Phone, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'

type LegacyTeacher = User & { email?: string; phone?: string; status?: string }

export function TeacherRow({ teacher }: { teacher: User }) {
  const t = teacher as LegacyTeacher
  return (
    <tr className="hover:bg-table-header transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[13px] font-semibold text-primary">
            {teacher.name.slice(0, 2)}
          </div>
          <div>
            <p className="text-[14px] font-medium text-foreground">{teacher.name}</p>
            <p className="text-[12px] text-text-secondary">ID: {teacher.id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[13px]">
            <Mail size={14} className="text-text-secondary" strokeWidth={1.5} />
            <span className="text-text-secondary">{t.email || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Phone size={14} className="text-text-secondary" strokeWidth={1.5} />
            <span className="text-text-secondary">{t.phone || '-'}</span>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-[14px] font-medium text-foreground">3</span>
        <span className="text-[14px] text-text-secondary"> шалгалт</span>
      </td>
      <td className="px-5 py-4">
        <span className={cn(
          'px-2.5 py-1 rounded-full text-[11px] font-medium',
          t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        )}>
          {t.status === 'active' ? 'Идэвхтэй' : 'Идэвхгүй'}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="relative group">
          <button className="p-1.5 hover:bg-card-border rounded-md text-text-secondary">
            <MoreHorizontal size={16} strokeWidth={1.5} />
          </button>
          <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-40 bg-white border border-card-border rounded-lg shadow-lg z-10">
            <button className="w-full px-3 py-2 text-left text-[13px] text-foreground hover:bg-table-header flex items-center gap-2">
              <Eye size={14} strokeWidth={1.5} />Дэлгэрэнгүй
            </button>
            <button className="w-full px-3 py-2 text-left text-[13px] text-foreground hover:bg-table-header flex items-center gap-2">
              <Edit size={14} strokeWidth={1.5} />Засах
            </button>
            <button className="w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 size={14} strokeWidth={1.5} />Устгах
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}
