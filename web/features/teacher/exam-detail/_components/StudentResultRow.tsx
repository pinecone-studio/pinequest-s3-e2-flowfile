import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { User, Result } from '@/lib/types'

function getScoreColor(score: number) {
  if (score >= 80) return '#1A7A4A'
  if (score >= 60) return '#B45309'
  return '#C4272F'
}

function getScoreBg(score: number) {
  if (score >= 80) return 'rgba(26, 122, 74, 0.12)'
  if (score >= 60) return 'rgba(180, 83, 9, 0.12)'
  return 'rgba(196, 39, 47, 0.12)'
}

export function StudentResultRow({
  student,
  result,
  index,
}: {
  student: User
  result: Result | undefined
  index: number
}) {
  return (
    <tr
      className="border-t transition-colors cursor-pointer"
      style={{ borderColor: '#DDE1E7' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F7FA')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{index + 1}</td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#1A1A2E' }}>{student.name}</td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#1A1A2E' }}>
        {result ? `${result.totalScore}/${result.maxScore}` : '-'}
      </td>
      <td className="px-4 py-3">
        {result ? (
          <span
            className="px-2 py-0.5 text-[12px] rounded-full font-medium"
            style={{ backgroundColor: getScoreBg(result.percentage ?? 0), color: getScoreColor(result.percentage ?? 0) }}
          >
            {result.percentage ?? 0}%
          </span>
        ) : '-'}
      </td>
      <td className="px-4 py-3">
        {result ? (
          (result.percentage ?? 0) >= 60 ? (
            <span className="flex items-center gap-1 text-[12px]" style={{ color: '#1A7A4A' }}>
              <CheckCircle2 size={14} />Тэнцсэн
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[12px]" style={{ color: '#C4272F' }}>
              <XCircle size={14} />Тэнцээгүй
            </span>
          )
        ) : (
          <span className="flex items-center gap-1 text-[12px]" style={{ color: '#8A94A0' }}>
            <AlertCircle size={14} />Өгөөгүй
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>
        {result
          ? new Date(result.submittedAt ?? '').toLocaleString('mn-MN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-'}
      </td>
    </tr>
  )
}
