'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Багш', href: '/teacher' },
  { label: 'Сурагч', href: '/student' },
]

export function PlatformSwitcher() {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname.startsWith('/student')) return '/student'
    return '/teacher'
  }
  
  const activeTab = getActiveTab()
  
  // 36px tall, bg #0A2D6E (header-navy), fixed at top
  return (
    <div 
      className="h-9 flex items-center justify-center px-4 shrink-0 relative sticky top-0 "
      style={{ backgroundColor: '#0A2D6E', zIndex: 9999 }}
    >
      {/* Left: Logo */}
      <div className="absolute left-4 flex items-center gap-1.5">
        <span className="text-white/60 text-sm">◈</span>
        <span className="text-white text-[14px] font-medium">e-Shalgalt</span>
      </div>
      
      {/* Center: Platform tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-3 py-0.5 text-[13px] rounded transition-colors',
              activeTab === tab.href
                ? 'bg-white font-medium'
                : 'text-white hover:bg-white/10'
            )}
            style={activeTab === tab.href ? { color: '#0A2D6E' } : {}}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
