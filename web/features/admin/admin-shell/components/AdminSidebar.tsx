import Link from 'next/link'

import {
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  Shield,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { AdminNavItem } from '@/features/admin/admin-shell/types/admin-shell.types'

type AdminSidebarProps = {
  pathname: string
  collapsed: boolean
  sidebarOpen: boolean
  navItems: AdminNavItem[]
  onToggleCollapsed: () => void
  onCloseMobile: () => void
}

export function AdminSidebar({
  pathname,
  collapsed,
  sidebarOpen,
  navItems,
  onToggleCollapsed,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-card-border z-50 transition-all duration-200 flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{ top: '36px', height: 'calc(100vh - 36px)' }}
    >
      <div className={cn('p-4 border-b border-card-border flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[14px] font-bold" style={{ color: '#216ad7' }}>е-shalgalt</div>
              <div className="text-[10px] text-text-secondary">Захиргаа</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield size={18} className="text-white" strokeWidth={1.5} />
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn('hidden lg:flex w-7 h-7 items-center justify-center rounded-md hover:bg-table-header text-text-secondary', collapsed && 'absolute -right-3 bg-white border border-card-border shadow-sm')}
        >
          <ChevronLeft size={14} className={cn('transition-transform', collapsed && 'rotate-180')} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 hover:bg-table-header rounded-md text-text-secondary"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-red-50 text-red-600'
                  : 'text-text-secondary hover:bg-table-header hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      <div className={cn('p-4 border-t border-card-border', collapsed && 'px-2')}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[12px] font-bold">
                АД
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">Админ</p>
                <p className="text-[11px] text-text-secondary truncate">Системийн админ</p>
              </div>
              <button type="button" className="p-1.5 hover:bg-table-header rounded-md text-text-secondary">
                <Bell size={16} strokeWidth={1.5} />
              </button>
            </div>
            <button type="button" className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-card-border rounded-lg text-[13px] text-text-secondary hover:bg-table-header transition-colors">
              <LogOut size={14} strokeWidth={1.5} />
              Гарах
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[12px] font-bold">
              АД
            </div>
            <button type="button" className="p-1.5 hover:bg-table-header rounded-md text-text-secondary">
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export function AdminMobileHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="lg:hidden sticky top-0 h-14 bg-white border-b border-card-border flex items-center justify-between px-4 z-30">
      <button type="button" onClick={onOpenSidebar} className="p-2 hover:bg-table-header rounded-lg">
        <Menu size={20} strokeWidth={1.5} />
      </button>
      <span className="text-[14px] font-semibold text-foreground">е-Шалгалт Админ</span>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
        АД
      </div>
    </div>
  )
}
