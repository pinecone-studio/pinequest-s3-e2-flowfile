import type { User, Result } from '@/lib/types'
import { StudentResultRow } from './StudentResultRow'

export function ExamResultsTab({
  classStudents,
  examResults,
}: {
  classStudents: User[]
  examResults: Result[]
}) {
  return (
    <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№', 'Сурагч', 'Оноо', 'Хувь', 'Төлөв', 'Илгээсэн'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[13px] font-medium" style={{ color: '#5A6474' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classStudents.map((student, index) => {
            const result = examResults.find(r => r.studentId === student.id)
            return <StudentResultRow key={student.id} student={student} result={result} index={index} />
          })}
        </tbody>
      </table>
      {classStudents.length === 0 && (
        <div className="text-center py-8 text-[14px]" style={{ color: '#5A6474' }}>
          Сурагч бүртгэгдээгүй байна.
        </div>
      )}
    </div>
  )
}
