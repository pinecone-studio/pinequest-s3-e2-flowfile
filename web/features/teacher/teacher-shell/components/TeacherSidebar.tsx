import { Menu, Settings, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'

import type { TeacherNavItem } from '@/features/teacher/teacher-shell/types/teacher-shell.types'

import { TeacherSidebarNav } from '@/features/teacher/teacher-shell/components/TeacherSidebarNav'

type TeacherSidebarProps = {
  collapsed: boolean
  isMobile?: boolean
  teacher: User | undefined
  pendingManualTaskCount: number
  unreadNotificationCount: number
  isActive: (item: TeacherNavItem) => boolean
  navItems: TeacherNavItem[]
  onMobileNavigate: () => void
  onToggleCollapsed: () => void
}

export function TeacherSidebar({
  collapsed,
  isMobile = false,
  teacher,
  pendingManualTaskCount,
  unreadNotificationCount,
  isActive,
  navItems,
  onMobileNavigate,
  onToggleCollapsed,
}: TeacherSidebarProps) {
  return (
    <aside
      className={cn(
        'bg-white border-r flex flex-col transition-all duration-200 md:sticky md:top-9 md:self-start',
        isMobile ? 'w-[220px]' : collapsed ? 'w-14' : 'w-[220px]'
      )}
      style={{
        borderColor: '#DDE1E7',
        minHeight: 'calc(100vh - var(--platform-switcher-height))',
        height: 'calc(100vh - var(--platform-switcher-height))',
      }}
    >
      <div
        className={cn('p-4 border-b', collapsed && !isMobile && 'px-2')}
        style={{ borderColor: '#DDE1E7' }}
      >
        {(!collapsed || isMobile) ? (
          <>
            <div className="text-[15px] font-medium" style={{ color: '#0066FF' }}>e-Shalgalt</div>
            <div className="text-[11px]" style={{ color: '#8A94A0' }}>Шалгалтын систем</div>
          </>
        ) : (
          <div className="text-[15px] font-medium text-center" style={{ color: '#0066FF' }}>e</div>
        )}
      </div>

      <TeacherSidebarNav
        collapsed={collapsed}
        isMobile={isMobile}
        navItems={navItems}
        pendingManualTaskCount={pendingManualTaskCount}
        unreadNotificationCount={unreadNotificationCount}
        isActive={isActive}
        onMobileNavigate={onMobileNavigate}
      />

      <div
        className={cn('p-3 border-t', collapsed && !isMobile && 'px-2')}
        style={{ borderColor: '#DDE1E7' }}
      >
        <div className={cn('flex items-center gap-3', collapsed && !isMobile && 'justify-center')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
            style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}
          >
            {teacher?.avatarInitials || 'БЦ'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium truncate" style={{ color: '#1A1A2E' }}>
                {teacher?.name || 'Б. Цэцэгмаа'}
              </div>
              <div
                className="text-[11px] px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}
              >
                Багш
              </div>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              type="button"
              className="p-1 rounded transition-colors"
              style={{ color: '#8A94A0' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F7FA' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Settings size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {!isMobile && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="p-2 border-t flex items-center justify-center transition-colors"
          style={{ borderColor: '#DDE1E7', color: '#8A94A0' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F7FA' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>
      )}
    </aside>
  )
}

export function TeacherMobileCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-2 top-2 p-1 rounded z-10 transition-colors"
      style={{ color: '#5A6474' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F7FA' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <X size={18} strokeWidth={1.5} />
    </button>
  )
}
