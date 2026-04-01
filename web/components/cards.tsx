'use client'

import { User, Users, ClipboardList, CalendarDays, Clock, Eye, Printer, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Color palette for subjects
export const COURSE_COLORS: Record<string, { bg: string; label: string; pattern: string }> = {
  math: { 
    bg: '#1D4ED8', 
    label: 'Математик',
    pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Crect x='0' y='9.5' width='20' height='1'/%3E%3Crect x='9.5' y='0' width='1' height='20'/%3E%3C/g%3E%3C/svg%3E")`
  },
  mongolian: { 
    bg: '#7C3AED', 
    label: 'Монгол хэл',
    pattern: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`
  },
  physics: { 
    bg: '#0369A1', 
    label: 'Физик',
    pattern: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='12,2 22,20 2,20' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`
  },
  chemistry: { 
    bg: '#065F46', 
    label: 'Хими',
    pattern: `url("data:image/svg+xml,%3Csvg width='28' height='24' viewBox='0 0 28 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='14,1 26,7 26,17 14,23 2,17 2,7' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`
  },
  biology: { 
    bg: '#92400E', 
    label: 'Биологи',
    pattern: `url("data:image/svg+xml,%3Csvg width='28' height='24' viewBox='0 0 28 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='14,1 26,7 26,17 14,23 2,17 2,7' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`
  },
  history: { 
    bg: '#9F1239', 
    label: 'Түүх',
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,6 C10,0 20,12 30,6 C35,3 38,4 40,6' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E")`
  },
  geography: { 
    bg: '#1E40AF', 
    label: 'Газарзүй',
    pattern: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='12,2 22,20 2,20' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`
  },
  english: { 
    bg: '#374151', 
    label: 'Англи хэл',
    pattern: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`
  },
  default: { 
    bg: '#0A2D6E', 
    label: '',
    pattern: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='white'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='white'/%3E%3C/svg%3E")`
  },
}

export function getSubjectColor(subjectName: string): { bg: string; label: string; pattern: string } {
  const name = subjectName.toLowerCase()
  if (name.includes('математик') || name.includes('math')) return COURSE_COLORS.math
  if (name.includes('монгол') || name.includes('mongolian')) return COURSE_COLORS.mongolian
  if (name.includes('физик') || name.includes('physics')) return COURSE_COLORS.physics
  if (name.includes('хими') || name.includes('chemistry')) return COURSE_COLORS.chemistry
  if (name.includes('биологи') || name.includes('biology')) return COURSE_COLORS.biology
  if (name.includes('түүх') || name.includes('history')) return COURSE_COLORS.history
  if (name.includes('газар') || name.includes('geography')) return COURSE_COLORS.geography
  if (name.includes('англи') || name.includes('english')) return COURSE_COLORS.english
  return COURSE_COLORS.default
}

function getAbbreviation(name: string): string {
  return name.substring(0, 3).toUpperCase()
}

// =============== COURSE CARD ===============
interface CourseCardProps {
  id: string
  name: string
  grade: string
  year: string
  term?: string
  teacherName: string
  classCount: number
  examCount: number
  href: string
}

export function CourseCard({ id, name, grade, year, term, teacherName, classCount, examCount, href }: CourseCardProps) {
  const colors = getSubjectColor(name)
  
  return (
    <Link
      href={href}
      className="group block rounded-lg overflow-hidden border border-[#DDE1E7] cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:translate-y-0"
    >
      {/* ZONE 1: Cover */}
      <div 
        className="relative h-[140px] sm:h-[120px]"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity"
          style={{ backgroundImage: colors.pattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Year badge */}
        <span className="absolute top-2.5 right-2.5 px-2 py-1 bg-black/25 text-white text-[11px] rounded">
          {year}
        </span>
        
        {/* Subject abbreviation circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white text-[18px] font-medium">{getAbbreviation(name)}</span>
        </div>
        
        {/* Course name */}
        <div className="absolute bottom-0 left-0 right-0 px-3.5 py-2.5">
          <span className="text-white text-[14px] font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            {name}
          </span>
        </div>
      </div>
      
      {/* ZONE 2: Info */}
      <div className="bg-white px-3.5 py-3">
        {/* Badges row */}
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-0.5 bg-[#F0F2F5] text-[#5A6474] text-[11px] rounded-full">
            {grade}
          </span>
          {term && (
            <span className="px-2 py-0.5 bg-[#EEF2FB] text-[#0A2D6E] text-[11px] rounded-full">
              {term}
            </span>
          )}
        </div>
        
        {/* Teacher row */}
        <div className="flex items-center gap-1.5 mb-3">
          <User size={12} className="text-gray-400" strokeWidth={1.5} />
          <span className="text-[12px] text-[#5A6474]">{teacherName}</span>
        </div>
        
        {/* Stats row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{classCount} анги</span>
          </div>
          <div className="flex items-center gap-1">
            <ClipboardList size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{examCount} шалгалт</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// =============== CLASS CARD ===============
interface ClassCardProps {
  id: string
  name: string
  fullName: string
  schedule: string
  studentCount: number
  upcomingExamCount: number
  courseColor: string
  coursePattern: string
  href: string
}

export function ClassCard({ id, name, fullName, schedule, studentCount, upcomingExamCount, courseColor, coursePattern, href }: ClassCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg overflow-hidden border border-[#DDE1E7] cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:translate-y-0"
    >
      {/* ZONE 1: Cover */}
      <div 
        className="relative h-[100px] sm:h-[80px]"
        style={{ backgroundColor: courseColor }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity"
          style={{ backgroundImage: coursePattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Student count badge */}
        <span className="absolute top-2.5 right-2.5 px-2 py-1 bg-white/20 text-white text-[11px] rounded flex items-center gap-1">
          <Users size={10} strokeWidth={1.5} />
          {studentCount}
        </span>
        
        {/* Class code centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-white text-[24px] font-medium">{name}</span>
        </div>
      </div>
      
      {/* ZONE 2: Info */}
      <div className="bg-white px-3.5 py-3">
        {/* Class full name */}
        <div className="text-[14px] text-[#1A1A2E] font-medium mb-1">{fullName}</div>
        
        {/* Schedule */}
        <div className="flex items-center gap-1.5 mb-3">
          <CalendarDays size={12} className="text-[#5A6474]" strokeWidth={1.5} />
          <span className="text-[12px] text-[#5A6474]">{schedule}</span>
        </div>
        
        {/* Divider */}
        <div className="border-t border-[#E8EBF0] mb-3" />
        
        {/* Stats row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{studentCount} сурагч</span>
          </div>
          <div className="flex items-center gap-1">
            <ClipboardList size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{upcomingExamCount} шалгалт</span>
          </div>
        </div>
        
        {/* Link */}
        <div className="flex items-center gap-1 text-[12px] text-[#1550A8] hover:underline">
          <span>Дэлгэрэнгүй</span>
          <ArrowRight size={12} strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  )
}

// =============== EXAM CARD (UPCOMING) ===============
const EXAM_STATUS_COLORS: Record<string, string> = {
  scheduled: '#B45309',
  active: '#1A7A4A',
  closed: '#4B5563',
  draft: '#5A6474',
}

interface ExamCardUpcomingProps {
  id: string
  title: string
  subjectName: string
  status: 'scheduled' | 'active' | 'closed' | 'draft'
  duration: number
  dateTime?: string
  questionCount: number
  studentCount: number
  href: string
  actionLabel?: string
  actionHref?: string
  isStudent?: boolean
}

export function ExamCardUpcoming({ 
  id, title, subjectName, status, duration, dateTime, questionCount, studentCount, href, actionLabel, actionHref, isStudent 
}: ExamCardUpcomingProps) {
  const statusLabels: Record<string, string> = {
    scheduled: 'Товлогдсон',
    active: 'Идэвхтэй',
    closed: 'Дууссан',
    draft: 'Ноорог',
  }
  
  const coverColor = EXAM_STATUS_COLORS[status]
  const pattern = COURSE_COLORS.default.pattern
  
  return (
    <div className="group rounded-lg overflow-hidden border border-[#DDE1E7] cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:translate-y-0">
      {/* ZONE 1: Cover */}
      <div 
        className="relative h-[88px] sm:h-[72px]"
        style={{ backgroundColor: coverColor }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity"
          style={{ backgroundImage: pattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Top row: subject + status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full">
            {subjectName}
          </span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full">
            {statusLabels[status]}
          </span>
        </div>
        
        {/* Bottom row: title + duration */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
          <span className="text-white text-[14px] font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] line-clamp-2 flex-1 mr-2">
            {title}
          </span>
          <span className="flex items-center gap-1 text-white text-[11px] shrink-0">
            <Clock size={10} strokeWidth={1.5} />
            {duration} мин
          </span>
        </div>
      </div>
      
      {/* ZONE 2: Info */}
      <div className="bg-white px-3.5 py-3">
        {/* Date/time row */}
        {dateTime && (
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarDays size={12} className="text-[#5A6474]" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{dateTime}</span>
          </div>
        )}
        
        {/* Stats row */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1">
            <ClipboardList size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{questionCount} асуулт</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{studentCount} сурагч</span>
          </div>
        </div>
        
        {/* Action row */}
        <div className="flex justify-end gap-2">
          {isStudent && status === 'active' ? (
            <Link
              href={actionHref || href}
              className="px-3 py-1.5 bg-[#0A2D6E] text-white text-[12px] font-medium rounded hover:bg-[#0A2D6E]/90 transition-colors"
            >
              Шалгалт өгөх
            </Link>
          ) : (
            <Link
              href={href}
              className="text-[12px] text-[#1550A8] hover:underline"
            >
              Дэлгэрэнгүй
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// =============== EXAM CARD (PAST) ===============
interface ExamCardPastProps {
  id: string
  title: string
  subjectName: string
  averageScore: number | null
  completionRate: number
  completedCount: number
  totalCount: number
  href: string
}

export function ExamCardPast({ id, title, subjectName, averageScore, completionRate, completedCount, totalCount, href }: ExamCardPastProps) {
  const coverColor = '#0A2D6E'
  const pattern = COURSE_COLORS.default.pattern
  
  return (
    <div className="group rounded-lg overflow-hidden border border-[#DDE1E7] cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:translate-y-0">
      {/* ZONE 1: Cover */}
      <div 
        className="relative h-[88px] sm:h-[72px]"
        style={{ backgroundColor: coverColor }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity"
          style={{ backgroundImage: pattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Top-left: subject */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full">
          {subjectName}
        </span>
        
        {/* Bottom row: title + average */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
          <span className="text-white text-[14px] font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] line-clamp-2 flex-1 mr-2">
            {title}
          </span>
          {averageScore !== null && (
            <span className="text-white text-[12px] shrink-0">
              Дундаж: {averageScore}%
            </span>
          )}
        </div>
      </div>
      
      {/* ZONE 2: Info */}
      <div className="bg-white px-3.5 py-3">
        {/* Completion label */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] text-[#5A6474]">Дүүргэлт</span>
          <span className="text-[12px] text-[#5A6474]">{completionRate}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-[#E8EBF0] rounded-full mb-2">
          <div 
            className="h-full bg-[#0A2D6E] rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        {/* Completed count */}
        <div className="text-[12px] text-[#5A6474] mb-3">
          {completedCount} / {totalCount} сурагч дуусгасан
        </div>
        
        {/* Action */}
        <div className="flex justify-end">
          <Link
            href={href}
            className="text-[12px] text-[#1550A8] hover:underline"
          >
            Үр дүн харах
          </Link>
        </div>
      </div>
    </div>
  )
}

// =============== EXAM BANK CARD (HORIZONTAL) ===============
interface ExamBankCardProps {
  id: string
  title: string
  subjectName: string
  subjectColor: string
  subjectPattern: string
  chapter?: string
  topic?: string
  ownerName: string
  createdAt: string
  questionCount: number
  totalPoints: number
  visibility: 'private' | 'school'
  onView: () => void
  onAssign: () => void
  onPrint: () => void
}

export function ExamBankCard({ 
  id, title, subjectName, subjectColor, subjectPattern, chapter, topic, ownerName, createdAt, questionCount, totalPoints, visibility, onView, onAssign, onPrint 
}: ExamBankCardProps) {
  return (
    <div className="group flex overflow-hidden border-b border-[#DDE1E7] last:border-b-0 hover:bg-[#FAFBFC] transition-colors">
      {/* Left: Cover zone */}
      <div 
        className="relative w-[120px] shrink-0"
        style={{ backgroundColor: subjectColor }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity"
          style={{ backgroundImage: subjectPattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Subject abbreviation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-[18px] font-medium">{getAbbreviation(subjectName)}</span>
        </div>
      </div>
      
      {/* Right: Info zone */}
      <div className="flex-1 px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          {/* Line 1: title + visibility */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[15px] font-medium text-[#1A1A2E]">{title}</span>
            <span className={cn(
              "px-2 py-0.5 text-[11px] rounded-full",
              visibility === 'private' ? "bg-[#5A6474]/12 text-[#5A6474]" : "bg-[#1550A8]/12 text-[#1550A8]"
            )}>
              {visibility === 'private' ? 'Хувийн' : 'Сургуулийн'}
            </span>
          </div>
          
          {/* Line 2: tags */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#5A6474] text-[12px] rounded">
              {subjectName}
            </span>
            {chapter && (
              <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#5A6474] text-[12px] rounded">
                {chapter}
              </span>
            )}
            {topic && (
              <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#5A6474] text-[12px] rounded">
                {topic}
              </span>
            )}
          </div>
          
          {/* Line 3: owner + date */}
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[12px] text-[#5A6474]">{ownerName}</span>
            <span className="text-[12px] text-[#5A6474]">{createdAt}</span>
          </div>
          
          {/* Line 4: stats */}
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#5A6474] text-[12px] rounded">
              {questionCount} асуулт
            </span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#5A6474] text-[12px] rounded">
              {totalPoints} оноо
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onView}
            className="flex items-center gap-1 text-[12px] text-[#1550A8] hover:underline"
          >
            <Eye size={14} strokeWidth={1.5} />
            Харах
          </button>
          <button 
            onClick={onAssign}
            className="flex items-center gap-1 text-[12px] text-[#1550A8] hover:underline"
          >
            <CalendarDays size={14} strokeWidth={1.5} />
            Хуваарилах
          </button>
          <button 
            onClick={onPrint}
            className="flex items-center gap-1 text-[12px] text-[#1550A8] hover:underline"
          >
            <Printer size={14} strokeWidth={1.5} />
            Хэвлэх
          </button>
        </div>
      </div>
    </div>
  )
}

// =============== STUDENT EXAM CARD ===============
interface StudentExamCardProps {
  id: string
  title: string
  subjectName: string
  status: 'scheduled' | 'active' | 'closed' | 'completed'
  duration: number
  dateTime?: string
  teacherName: string
  href: string
}

export function StudentExamCard({ id, title, subjectName, status, duration, dateTime, teacherName, href }: StudentExamCardProps) {
  const statusLabels: Record<string, string> = {
    scheduled: 'Эхлээгүй',
    active: 'Идэвхтэй',
    closed: 'Хаасан',
    completed: 'Дуусгасан',
  }
  
  const statusColors: Record<string, string> = {
    scheduled: '#B45309',
    active: '#1A7A4A',
    closed: '#4B5563',
    completed: '#1550A8',
  }
  
  const coverColor = statusColors[status]
  const colors = getSubjectColor(subjectName)
  
  return (
    <div className="group rounded-lg overflow-hidden border border-[#DDE1E7] cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:translate-y-0">
      {/* ZONE 1: Cover */}
      <div 
        className="relative h-[88px] sm:h-[72px]"
        style={{ backgroundColor: status === 'completed' ? '#1550A8' : coverColor }}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity"
          style={{ backgroundImage: colors.pattern, backgroundRepeat: 'repeat' }}
        />
        
        {/* Top row: subject + status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full">
            {subjectName}
          </span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full">
            {statusLabels[status]}
          </span>
        </div>
        
        {/* Bottom row: title + duration */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
          <span className="text-white text-[14px] font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] line-clamp-2 flex-1 mr-2">
            {title}
          </span>
          <span className="flex items-center gap-1 text-white text-[11px] shrink-0">
            <Clock size={10} strokeWidth={1.5} />
            {duration} мин
          </span>
        </div>
      </div>
      
      {/* ZONE 2: Info */}
      <div className="bg-white px-3.5 py-3">
        {/* Date/time row */}
        {dateTime && (
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarDays size={12} className="text-[#5A6474]" strokeWidth={1.5} />
            <span className="text-[12px] text-[#5A6474]">{dateTime}</span>
          </div>
        )}
        
        {/* Teacher row */}
        <div className="flex items-center gap-1.5 mb-3">
          <User size={12} className="text-gray-400" strokeWidth={1.5} />
          <span className="text-[12px] text-[#5A6474]">Багш: {teacherName}</span>
        </div>
        
        {/* Action row */}
        <div className="flex justify-end gap-2">
          {status === 'active' && (
            <Link
              href={href}
              className="px-3 py-1.5 bg-[#0A2D6E] text-white text-[12px] font-medium rounded hover:bg-[#0A2D6E]/90 transition-colors"
            >
              Шалгалт өгөх
            </Link>
          )}
          {status === 'scheduled' && (
            <button
              disabled
              className="px-3 py-1.5 bg-[#F0F2F5] text-[#5A6474] text-[12px] font-medium rounded cursor-not-allowed"
            >
              Эхлэх боломжгүй
            </button>
          )}
          {status === 'completed' && (
            <Link
              href="/student/results"
              className="text-[12px] text-[#1550A8] hover:underline"
            >
              Үр дүн харах
            </Link>
          )}
          {status === 'closed' && (
            <span className="text-[12px] text-[#5A6474]">Хаагдсан</span>
          )}
        </div>
      </div>
    </div>
  )
}
