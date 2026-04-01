'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, FileText, Clock, Download } from 'lucide-react'
import { initialExams, initialUsers, initialSubjects } from '@/lib/data'
import { AdminExamRow } from './_components/AdminExamRow'

export function AdminExamsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')

  const teachers = (initialUsers ?? []).filter(u => u.role === 'teacher')

  const filteredExams = (initialExams ?? []).filter(exam => {
    const subject = (initialSubjects ?? []).find(s => s.id === exam?.subjectId)
    const subjectName = subject?.name || ''
    const matchesSearch = (exam?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || exam?.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || subjectName.toLowerCase().includes(subjectFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesSubject
  })

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Тодорхойгүй'
  }

  const statCards = [
    { icon: <FileText className="h-5 w-5 text-primary" />, bg: 'bg-primary/10', value: (initialExams ?? []).length, label: 'Нийт шалгалт' },
    { icon: <Clock className="h-5 w-5 text-green-500" />, bg: 'bg-green-500/10', value: (initialExams ?? []).filter(e => (e.status as string) === 'active' || e.status === 'published').length, label: 'Идэвхтэй' },
    { icon: <Clock className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10', value: (initialExams ?? []).filter(e => (e.status as string) === 'scheduled').length, label: 'Төлөвлөсөн' },
    { icon: <FileText className="h-5 w-5 text-muted-foreground" />, bg: 'bg-muted', value: (initialExams ?? []).filter(e => (e.status as string) === 'closed' || (e.status as string) === 'completed').length, label: 'Дууссан' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Шалгалтууд</h1>
          <p className="text-muted-foreground">Бүх шалгалтуудын жагсаалт</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Тайлан татах</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Шалгалт хайх..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх статус</SelectItem>
                <SelectItem value="active">Идэвхтэй</SelectItem>
                <SelectItem value="scheduled">Төлөвлөсөн</SelectItem>
                <SelectItem value="completed">Дууссан</SelectItem>
                <SelectItem value="draft">Ноорог</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх хичээл</SelectItem>
                <SelectItem value="математик">Математик</SelectItem>
                <SelectItem value="физик">Физик</SelectItem>
                <SelectItem value="хими">Хими</SelectItem>
                <SelectItem value="биологи">Биологи</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Шалгалтуудын жагсаалт</CardTitle>
          <CardDescription>Нийт {filteredExams.length} шалгалт олдлоо</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Шалгалт</TableHead>
                  <TableHead>Багш</TableHead>
                  <TableHead>Хугацаа</TableHead>
                  <TableHead>Сурагчид</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map(exam => (
                  <AdminExamRow key={exam.id} exam={exam as Parameters<typeof AdminExamRow>[0]['exam']} getTeacherName={getTeacherName} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
