'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, FileText, Award, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Шалгалтууд', href: '/student', icon: FileText },
  { label: 'Үр дүн', href: '/student/results', icon: Award },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExamPage = pathname.match(/\/student\/exams\/[^/]+$/)

  if (isExamPage) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-page-bg">
        <nav className="h-14 bg-white border-b flex items-center justify-between px-6">
          <div className="flex gap-6">
            {navLinks.map(link => {
              const Icon = link.icon
              const active = pathname === link.href

              return (
                <Link key={link.href} href={link.href} className={cn(active && "text-primary")}>
                  <Icon size={16} /> {link.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Bell size={18} />
            <User size={18} />
          </div>
        </nav>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}