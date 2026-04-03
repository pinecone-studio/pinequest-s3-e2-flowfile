'use client'

import { Menu } from 'lucide-react'

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
    teacher,
    isActive,
  } = useTeacherShell()

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 36px)' }}>
      <div className="hidden md:block">
        <TeacherSidebar
          collapsed={collapsed}
          teacher={teacher}
          pendingManualTaskCount={pendingManualTaskCount}
          isActive={isActive}
          navItems={teacherNavItems}
          onMobileNavigate={() => setMobileOpen(false)}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>

      <div
        className="md:hidden fixed top-9 left-0 right-0 h-12 bg-white flex items-center px-4 z-40 border-b"
        style={{ borderColor: '#DDE1E7' }}
      >
        <button type="button" onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <span className="ml-2 text-[15px] font-medium" style={{ color: '#0066FF' }}>e-Shalgalt</span>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" style={{ top: '36px' }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <div className="relative h-full">
              <TeacherMobileCloseButton onClose={() => setMobileOpen(false)} />
              <TeacherSidebar
                isMobile
                collapsed={collapsed}
                teacher={teacher}
                pendingManualTaskCount={pendingManualTaskCount}
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
