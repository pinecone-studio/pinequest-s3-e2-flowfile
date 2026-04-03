'use client'

import Link from 'next/link'
import { Bell, Menu } from 'lucide-react'

import { TeacherMobileCloseButton, TeacherSidebar } from '@/features/teacher/teacher-shell/components/TeacherSidebar'
import { useTeacherLiveProctoringAlerts } from '@/features/teacher/teacher-shell/hooks/useTeacherLiveProctoringAlerts'
import { useTeacherShell } from '@/features/teacher/teacher-shell/hooks/useTeacherShell'
import { teacherNavItems } from '@/features/teacher/teacher-shell/utils/teacher-shell.constants'

type TeacherShellFeatureProps = {
  children: React.ReactNode
}

export function TeacherShellFeature({ children }: TeacherShellFeatureProps) {
  useTeacherLiveProctoringAlerts()

  const {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    pendingManualTaskCount,
    unreadNotificationCount,
    teacher,
    isActive,
  } = useTeacherShell()

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <TeacherSidebar
          collapsed={collapsed}
          teacher={teacher}
          pendingManualTaskCount={pendingManualTaskCount}
          unreadNotificationCount={unreadNotificationCount}
          isActive={isActive}
          navItems={teacherNavItems}
          onMobileNavigate={() => setMobileOpen(false)}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>

      <div
        className="md:hidden fixed inset-x-0 top-9 h-12 bg-white flex items-center justify-between px-4 z-30 border-b"
        style={{ borderColor: '#DDE1E7' }}
      >
        <div className="flex items-center">
          <button type="button" onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <span className="ml-2 text-[15px] font-medium" style={{ color: '#0066FF' }}>e-Shalgalt</span>
        </div>
        <Link
          href="/teacher/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ color: '#5A6474' }}
        >
          <Bell size={18} strokeWidth={1.5} />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-[#D64545] text-white text-[11px] font-semibold flex items-center justify-center">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </Link>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <div className="relative h-full">
              <TeacherMobileCloseButton onClose={() => setMobileOpen(false)} />
              <TeacherSidebar
                isMobile
                collapsed={collapsed}
                teacher={teacher}
                pendingManualTaskCount={pendingManualTaskCount}
                unreadNotificationCount={unreadNotificationCount}
                isActive={isActive}
                navItems={teacherNavItems}
                onMobileNavigate={() => setMobileOpen(false)}
                onToggleCollapsed={() => setCollapsed((c) => !c)}
              />
            </div>
          </div>
        </div>
      )}

      <main
        className="flex-1 pt-12 md:pt-0"
        style={{ backgroundColor: '#F0F2F5' }}
      >
        {children}
      </main>
    </div>
  )
}
