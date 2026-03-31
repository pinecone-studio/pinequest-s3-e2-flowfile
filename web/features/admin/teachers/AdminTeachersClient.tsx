'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Users, CheckCircle, XCircle } from 'lucide-react'
import { getAll } from '@/lib/data'
import type { User } from '@/lib/types'
import { initialUsers } from '@/lib/data'
import { TeacherRow } from './_components/TeacherRow'

type LegacyUser = User & { email?: string; status?: string }

export function AdminTeachersClient() {
  const [users, setUsers] = useState<LegacyUser[]>(initialUsers as LegacyUser[])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const loadedUsers = getAll<User>('users')
    if (loadedUsers.length) setUsers(loadedUsers)
  }, [])

  const teachers = users.filter(u => u.role === 'teacher')

  const filteredTeachers = teachers.filter(teacher =>
    (searchQuery === '' ||
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || teacher.status === statusFilter)
  )

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-foreground">Багш нар</h1>
          <p className="text-[14px] text-text-secondary">Бүртгэлтэй багш нарын жагсаалт</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={1.5} />Багш нэмэх
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Users size={20} className="text-blue-600" strokeWidth={1.5} />, bg: 'bg-blue-100', label: 'Нийт багш', value: teachers.length },
          { icon: <CheckCircle size={20} className="text-green-600" strokeWidth={1.5} />, bg: 'bg-green-100', label: 'Идэвхтэй', value: teachers.filter(t => t.status === 'active').length },
          { icon: <XCircle size={20} className="text-gray-500" strokeWidth={1.5} />, bg: 'bg-gray-100', label: 'Идэвхгүй', value: teachers.filter(t => t.status === 'inactive').length },
        ].map(({ icon, bg, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-card-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
              <div className="text-[13px] text-text-secondary">{label}</div>
            </div>
            <div className="text-[28px] font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-card-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Багш хайх..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-input-border rounded-lg text-[14px] bg-white focus:border-primary focus:outline-none min-w-[140px]"
          >
            <option value="all">Бүх статус</option>
            <option value="active">Идэвхтэй</option>
            <option value="inactive">Идэвхгүй</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-card-border overflow-hidden">
        <div className="px-5 py-4 border-b border-card-border">
          <h2 className="text-[15px] font-semibold text-foreground">Багш нарын жагсаалт</h2>
          <p className="text-[12px] text-text-secondary">Нийт {filteredTeachers.length} багш</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-table-header border-b border-card-border">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Багш</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Холбоо барих</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Шалгалт</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Статус</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filteredTeachers.map(teacher => <TeacherRow key={teacher.id} teacher={teacher} />)}
            </tbody>
          </table>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 text-text-secondary text-[14px]">Багш олдсонгүй</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-card-border">
              <h2 className="text-[18px] font-bold text-foreground">Шинэ багш нэмэх</h2>
              <p className="text-[13px] text-text-secondary">Багшийн мэдээллийг оруулна уу</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Нэр', type: 'text', placeholder: 'Багшийн нэр' },
                { label: 'И-мэйл', type: 'email', placeholder: 'email@example.com' },
                { label: 'Утас', type: 'tel', placeholder: '99001122' },
              ].map(({ label, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-[13px] font-medium text-foreground mb-1.5">{label}</label>
                  <input type={type} placeholder={placeholder} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-table-header border-t border-card-border flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-white transition-colors">Цуцлах</button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors">Хадгалах</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
