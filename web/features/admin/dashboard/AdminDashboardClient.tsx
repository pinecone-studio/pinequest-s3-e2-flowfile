'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, School } from 'lucide-react'
import { getAll } from '@/lib/data'
import type { Exam, SchoolClass, User } from '@/lib/types'
import { initialExams, initialClasses, initialUsers } from '@/lib/data'
import { AdminMetricCards } from './_components/AdminMetricCards'
import { AdminActivityFeed } from './_components/AdminActivityFeed'

export function AdminDashboardClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [users, setUsers] = useState<User[]>(initialUsers)

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams')
    const loadedClasses = getAll<SchoolClass>('classes')
    const loadedUsers = getAll<User>('users')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedClasses.length) setClasses(loadedClasses)
    if (loadedUsers.length) setUsers(loadedUsers)
  }, [])

  const teachers = (users ?? []).filter(u => u.role === 'teacher')
  const students = (users ?? []).filter(u => u.role === 'student')

  const activeExams = (exams ?? []).filter(e => (e.status as string) === 'active').length
  const scheduledExams = (exams ?? []).filter(e => (e.status as string) === 'scheduled').length
  const completedExams = (exams ?? []).filter(e => (e.status as string) === 'closed').length

  const stats = [
    { title: 'Нийт багш', value: teachers.length, change: '+2', trend: 'up', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Нийт сурагч', value: students.length, change: '+15', trend: 'up', icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Нийт шалгалт', value: exams.length, change: '+5', trend: 'up', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Нийт анги', value: classes.length, change: '0', trend: 'neutral', icon: School, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-[24px] font-bold text-foreground">Хянах самбар</h1>
        <p className="text-[14px] text-text-secondary">Системийн ерөнхий мэдээлэл</p>
      </div>
      <AdminMetricCards stats={stats} />
      <AdminActivityFeed
        recentExams={exams.slice(0, 5)}
        teachers={teachers}
        activeExams={activeExams}
        scheduledExams={scheduledExams}
        completedExams={completedExams}
        totalExams={exams.length}
      />
    </div>
  )
}
