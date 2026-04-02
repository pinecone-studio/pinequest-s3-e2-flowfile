'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Users, School } from 'lucide-react'
import { initialClasses, initialUsers } from '@/lib/data'
import { ClassRow } from './_components/ClassRow'
import { AddClassDialog } from './_components/AddClassDialog'

export function AdminClassesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const mockTeachers = (initialUsers ?? []).filter(u => u.role === 'teacher')
  const mockClasses = initialClasses ?? []

  const filteredClasses = mockClasses.filter(cls =>
    (cls?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls?.grade?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTeacherName = (teacherId: string) => {
    const teacher = mockTeachers.find(t => t.id === teacherId)
    return teacher?.name || 'Тодорхойгүй'
  }

  const totalStudents = mockClasses.reduce((sum, c) => sum + ((c?.studentIds ?? []).length || 0), 0)
  const avgStudents = mockClasses.length > 0 ? Math.round(totalStudents / mockClasses.length) : 0
  const gradeCount = new Set(mockClasses.map(c => c?.grade?.toString())).size

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ангиуд</h1>
          <p className="text-muted-foreground">Бүртгэлтэй ангиудын жагсаалт</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Анги нэмэх</Button>
        <AddClassDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} teachers={mockTeachers} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <School className="h-5 w-5 text-primary" />, bg: 'bg-primary/10', value: mockClasses.length, label: 'Нийт анги' },
          { icon: <Users className="h-5 w-5 text-chart-2" />, bg: 'bg-chart-2/10', value: totalStudents, label: 'Нийт сурагч' },
          { icon: <Users className="h-5 w-5 text-chart-3" />, bg: 'bg-chart-3/10', value: avgStudents, label: 'Дундаж сурагч' },
          { icon: <School className="h-5 w-5 text-chart-4" />, bg: 'bg-chart-4/10', value: gradeCount, label: 'Түвшин' },
        ].map(({ icon, bg, value, label }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
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
              <Input placeholder="Анги хайх..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх түвшин</SelectItem>
                <SelectItem value="10">10-р анги</SelectItem>
                <SelectItem value="11">11-р анги</SelectItem>
                <SelectItem value="12">12-р анги</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ангиудын жагсаалт</CardTitle>
          <CardDescription>Нийт {filteredClasses.length} анги бүртгэлтэй</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Анги</TableHead>
                  <TableHead>Түвшин</TableHead>
                  <TableHead>Багш</TableHead>
                  <TableHead>Сурагчид</TableHead>
                  <TableHead>Шалгалт</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map(cls => (
                  <ClassRow key={cls.id} cls={cls} getTeacherName={getTeacherName} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
