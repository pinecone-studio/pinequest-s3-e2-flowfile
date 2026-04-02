import Link from 'next/link'

import { Bell, User } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { StudentNavLink } from '@/features/student/student-shell/utils/student-shell.constants'

type StudentTopNavProps = {
  pathname: string
  navLinks: StudentNavLink[]
  studentDisplayName: string
}

export function StudentTopNav({ pathname, navLinks, studentDisplayName }: StudentTopNavProps) {
  return (
    <nav className="fixed inset-x-0 top-9 z-30 flex flex-col gap-3 border-b border-card-border bg-white px-4 py-3 md:h-14 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-[14px] font-bold">e</span>
          </div>
          <span className="text-[15px] font-semibold" style={{ color: '#216ad7' }}>е-shalgalt</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] transition-colors',
                  isActive
                    ? 'bg-active-nav text-primary font-medium'
                    : 'text-text-secondary hover:text-foreground hover:bg-table-header'
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-9 h-9 rounded-lg hover:bg-table-header flex items-center justify-center text-text-secondary hover:text-foreground transition-colors"
        >
          <Bell size={18} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-table-header cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-[13px]">
            <div className="font-medium text-foreground">{studentDisplayName}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
