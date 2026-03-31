import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function useAdminShell(): {
  pathname: string
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  collapsed: boolean
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
} {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return {
    pathname,
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
  }
}
