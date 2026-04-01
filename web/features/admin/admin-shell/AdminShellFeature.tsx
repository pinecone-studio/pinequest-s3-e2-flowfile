'use client'

import { cn } from '@/lib/utils'

import { AdminMobileHeader, AdminSidebar } from '@/features/admin/admin-shell/components/AdminSidebar'
import { useAdminShell } from '@/features/admin/admin-shell/hooks/useAdminShell'
import { adminNavItems } from '@/features/admin/admin-shell/utils/admin-shell.constants'

type AdminShellFeatureProps = {
  children: React.ReactNode
}

export function AdminShellFeature({ children }: AdminShellFeatureProps) {
  const {
    pathname,
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
  } = useAdminShell()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AdminSidebar
          pathname={pathname}
          collapsed={collapsed}
          sidebarOpen={sidebarOpen}
          navItems={adminNavItems}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <main className={cn('flex-1 min-h-[calc(100vh-36px)] bg-page-bg', collapsed ? 'lg:ml-0' : 'lg:ml-0')}>
          <AdminMobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
