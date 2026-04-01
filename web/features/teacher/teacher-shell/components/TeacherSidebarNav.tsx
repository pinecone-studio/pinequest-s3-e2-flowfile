import Link from 'next/link'

import { cn } from '@/lib/utils'

import type { TeacherNavItem } from '@/features/teacher/teacher-shell/types/teacher-shell.types'

type TeacherSidebarNavProps = {
  collapsed: boolean
  isMobile?: boolean
  navItems: TeacherNavItem[]
  pendingManualTaskCount: number
  isActive: (item: TeacherNavItem) => boolean
  onMobileNavigate: () => void
}

export function TeacherSidebarNav({
  collapsed,
  isMobile = false,
  navItems,
  pendingManualTaskCount,
  isActive,
  onMobileNavigate,
}: TeacherSidebarNavProps) {
  return (
    <nav className="flex-1 py-2">
      {navItems.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && onMobileNavigate()}
            className={cn(
              'flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg transition-all relative',
              'text-[14px]',
              active ? 'font-medium' : 'font-normal',
              collapsed && !isMobile && 'justify-center px-2'
            )}
            style={active ? {
              backgroundColor: '#EBF2FF',
              color: '#0066FF',
              borderLeft: collapsed && !isMobile ? 'none' : '3px solid #0066FF',
              marginLeft: collapsed && !isMobile ? '8px' : '6px',
              paddingLeft: collapsed && !isMobile ? '8px' : '9px',
            } : {
              color: '#5A6474',
              borderLeft: '3px solid transparent',
              marginLeft: '6px',
              paddingLeft: '9px',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = '#F5F7FA'
                e.currentTarget.style.color = '#1A1A2E'
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#5A6474'
              }
            }}
          >
            <item.icon size={18} strokeWidth={1.5} />
            {(!collapsed || isMobile) && (
              <>
                <span>{item.label}</span>
                {item.href === '/teacher/grading' && pendingManualTaskCount > 0 && (
                  <span
                    className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    {pendingManualTaskCount}
                  </span>
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
