'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Багш', href: '/teacher' },
  { label: 'Сурагч', href: '/student' },
  { label: 'Захиргаа', href: '/admin' },
]

export function PlatformSwitcher() {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname.startsWith('/teacher')) return '/teacher'
    if (pathname.startsWith('/student')) return '/student'
    if (pathname.startsWith('/admin')) return '/admin'
    return '/teacher'
  }
  
  const activeTab = getActiveTab()
  
  return (
    <div className="h-9 bg-navy flex items-center justify-center gap-8 px-4 shrink-0">
      <div className="absolute left-4 flex items-center gap-1.5">
        <span className="text-white/60 text-sm">◈</span>
        <span className="text-white text-sm font-medium">е-Шалгалт</span>
      </div>
      
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-3 py-0.5 text-[13px] rounded transition-colors',
              activeTab === tab.href
                ? 'bg-white text-navy font-medium'
                : 'text-white hover:bg-white/10'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
