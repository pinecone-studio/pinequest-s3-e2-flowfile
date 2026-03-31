'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, Download, TrendingUp, TrendingDown, Users, FileText, Award, Calendar } from 'lucide-react'
import { initialExams, initialClasses, initialUsers } from '@/lib/data'
import { SubjectChart } from './_components/SubjectChart'
import { TeacherTable } from './_components/TeacherTable'

const subjectStats = [
  { subject: 'Математик', avgScore: 75.2, examCount: 8, passRate: 82 },
  { subject: 'Физик', avgScore: 72.8, examCount: 6, passRate: 78 },
  { subject: 'Хими', avgScore: 80.5, examCount: 5, passRate: 88 },
  { subject: 'Биологи', avgScore: 82.1, examCount: 4, passRate: 90 },
  { subject: 'Англи хэл', avgScore: 77.3, examCount: 7, passRate: 84 },
]

const monthlyData = [
  { month: '1 сар', exams: 12, students: 450 },
  { month: '2 сар', exams: 15, students: 520 },
  { month: '3 сар', exams: 18, students: 580 },
  { month: '4 сар', exams: 22, students: 640 },
  { month: '5 сар', exams: 25, students: 700 },
]

export function AdminReportsClient() {
  const mockStudents = (initialUsers ?? []).filter(u => u.role === 'student')
  const totalExams = (initialExams ?? []).length
  const avgScore = 78.5
  const passRate = 85.2

  const classStats = (initialClasses ?? []).map(cls => ({
    name: cls?.name ?? '',
    avgScore: 75,
    examCount: 0,
    studentCount: (cls?.studentIds ?? []).length,
  }))

  const overviewStats = [
    { icon: <FileText className="h-5 w-5 text-primary" />, bg: 'bg-primary/10', value: totalExams, label: 'Нийт шалгалт', trend: '+12%', up: true },
    { icon: <Users className="h-5 w-5 text-chart-2" />, bg: 'bg-chart-2/10', value: mockStudents.length, label: 'Оролцсон сурагч', trend: '+8%', up: true },
    { icon: <BarChart3 className="h-5 w-5 text-chart-3" />, bg: 'bg-chart-3/10', value: `${avgScore}%`, label: 'Дундаж оноо', trend: '+3%', up: true },
    { icon: <Award className="h-5 w-5 text-chart-4" />, bg: 'bg-chart-4/10', value: `${passRate}%`, label: 'Тэнцсэн хувь', trend: '-2%', up: false },
  ]

  const quickReports = [
    { icon: <FileText className="h-6 w-6 text-primary" />, bg: 'bg-primary/10', title: 'Шалгалтын тайлан', desc: 'Бүх шалгалтуудын дэлгэрэнгүй' },
    { icon: <Users className="h-6 w-6 text-chart-2" />, bg: 'bg-chart-2/10', title: 'Сурагчдын тайлан', desc: 'Сурагч тус бүрийн дүн' },
    { icon: <Calendar className="h-6 w-6 text-chart-3" />, bg: 'bg-chart-3/10', title: 'Хуваарийн тайлан', desc: 'Шалгалтын хуваарь' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Тайлан</h1>
          <p className="text-muted-foreground">Шалгалтын статистик болон дүн шинжилгээ</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024 он</SelectItem>
              <SelectItem value="2023">2023 он</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Татах</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
                <div className={`flex items-center gap-1 text-sm ${s.up ? 'text-green-500' : 'text-red-500'}`}>
                  {s.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {s.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Хичээлээр</CardTitle><CardDescription>Хичээл тус бүрийн дундаж оноо</CardDescription></CardHeader>
          <CardContent><SubjectChart subjectStats={subjectStats} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ангиар</CardTitle><CardDescription>Анги тус бүрийн дундаж оноо</CardDescription></CardHeader>
          <CardContent><TeacherTable classStats={classStats} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Сарын статистик</CardTitle><CardDescription>Шалгалт болон оролцогчдын тоо</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {monthlyData.map(data => (
              <div key={data.month} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="h-24 flex items-end justify-center gap-2 mb-3">
                  <div className="w-6 bg-primary rounded-t" style={{ height: `${(data.exams / 30) * 100}%` }} />
                  <div className="w-6 bg-chart-2 rounded-t" style={{ height: `${(data.students / 800) * 100}%` }} />
                </div>
                <p className="text-sm font-medium text-foreground">{data.month}</p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{data.exams}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-2" />{data.students}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary" />Шалгалтын тоо</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-chart-2" />Оролцогчдын тоо</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickReports.map(r => (
          <Card key={r.title} className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${r.bg}`}>{r.icon}</div>
              <div>
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
