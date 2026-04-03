'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Clock, FileText, Users, Calendar, Trash2 } from 'lucide-react'
import { ExamShareCard } from '@/components/exam-share-card'
import { getAll, CURRENT_TEACHER_ID } from '@/lib/data'
import type { Exam, User, Question } from '@/lib/types'
import { initialExams, initialUsers, initialQuestions, initialSubjects } from '@/lib/data'
import { COURSE_COLORS } from '@/lib/constants'
import { QUESTION_TYPE_LABELS } from '@/lib/types'
import { QuestionOptionList } from './_components/QuestionOptionList'
import { ExamBanner } from './_components/ExamBanner'
import {
  fetchExamSessions,
  fetchUsersByRole,
  isApiConfigured,
  type ExamSession,
  type TeacherUser,
} from '@/lib/api/teacher-exams'
import {
  fetchTeacherExamBankRecordById,
  getTeacherExamMaxScore,
  mapLocalExamToTeacherExamBankRecord,
  type TeacherExamBankRecord,
} from '@/lib/teacher-exam-bank'

type ExamParticipant = {
  sessionId: string
  studentId: string
  studentName: string
  status: ExamSession['status']
  startedAt: string | null
  submittedAt: string | null
  score: number | null
}

function getParticipantStatusMeta(status: ExamSession['status']) {
  switch (status) {
    case 'in_progress':
      return {
        label: 'Оруулж байна',
        backgroundColor: '#EEF5FF',
        color: '#0066FF',
      }
    case 'graded':
      return {
        label: 'Үнэлэгдсэн',
        backgroundColor: '#EAF7EF',
        color: '#1A7A4A',
      }
    case 'submitted':
    case 'force_submitted':
      return {
        label: 'Илгээсэн',
        backgroundColor: '#FFF7E8',
        color: '#B45309',
      }
    default:
      return {
        label: 'Хүлээж байна',
        backgroundColor: '#F5F7FA',
        color: '#5A6474',
      }
  }
}

function formatParticipantTime(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString('mn-MN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function QuestionDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exam, setExam] = useState<TeacherExamBankRecord | null>(null)
  const [participants, setParticipants] = useState<ExamParticipant[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadLocalExam = () => {
      const loadedExams = getAll<Exam>('exams')
      const loadedUsers = getAll<User>('users')
      const loadedQuestions = getAll<Question>('questions')
      const nextExam =
        (loadedExams.length ? loadedExams : initialExams).find((item) => item.id === id) ||
        null

      if (!nextExam || isCancelled) {
        setExam(null)
        setParticipants([])
        setIsLoaded(true)
        return
      }

      setExam(
        mapLocalExamToTeacherExamBankRecord(
          nextExam,
          loadedQuestions.length ? loadedQuestions : initialQuestions,
          loadedUsers.length ? loadedUsers : initialUsers,
          initialSubjects,
        ),
      )
      setParticipants([])
      setIsLoaded(true)
    }

    const loadApiExam = async () => {
      try {
        const [nextExam, sessions, students] = await Promise.all([
          fetchTeacherExamBankRecordById(id),
          fetchExamSessions(id).catch(() => [] as ExamSession[]),
          fetchUsersByRole('student').catch(() => [] as TeacherUser[]),
        ])

        const studentNameMap = new Map(
          [
            ...students.map((student) => [student.id, student.name] as const),
            ...initialUsers
              .filter((user) => user.role === 'student')
              .map((student) => [student.id, student.name] as const),
          ],
        )
        const mappedParticipants = sessions
          .filter(
            (session) =>
              session.status === 'in_progress' ||
              session.status === 'submitted' ||
              session.status === 'force_submitted' ||
              session.status === 'graded',
          )
          .map<ExamParticipant>((session) => ({
            sessionId: session.id,
            studentId: session.studentId,
            studentName: studentNameMap.get(session.studentId) ?? session.studentId,
            status: session.status,
            startedAt: session.startedAt,
            submittedAt: session.submittedAt,
            score: session.score,
          }))

        if (!isCancelled) {
          setExam(nextExam)
          setParticipants(mappedParticipants)
          setIsLoaded(true)
        }
      } catch {
        loadLocalExam()
      }
    }

    setIsLoaded(false)

    if (isApiConfigured()) {
      void loadApiExam()
    } else {
      loadLocalExam()
    }

    return () => {
      isCancelled = true
    }
  }, [id])

  const subject = exam ? initialSubjects.find(s => s.id === exam.subjectId) || null : null
  const subjectColor = exam ? (COURSE_COLORS[exam.subjectId] || COURSE_COLORS.default) : COURSE_COLORS.default
  const examQuestions = exam?.questions ?? []
  const isOwner = exam?.ownerId === CURRENT_TEACHER_ID

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
  const getQuestionTypeCounts = () => { const counts: Record<string, number> = {}; examQuestions.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1 }); return counts }

  if (!isLoaded) return <div className="p-6"><div style={{ color: '#5A6474' }}>Ачааллаж байна...</div></div>
  if (!exam) return <div className="p-6"><div style={{ color: '#5A6474' }}>Шалгалт олдсонгүй...</div></div>

  const typeCounts = getQuestionTypeCounts()
  const participantStats = {
    active: participants.filter((participant) => participant.status === 'in_progress').length,
    submitted: participants.filter(
      (participant) =>
        participant.status === 'submitted' || participant.status === 'force_submitted',
    ).length,
    graded: participants.filter((participant) => participant.status === 'graded').length,
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/teacher/bank" className="inline-flex items-center gap-1 text-[13px] mb-4" style={{ color: '#0066FF' }}>
        <ChevronLeft size={16} strokeWidth={1.5} />Шалгалтын сан руу буцах
      </Link>

      <ExamBanner exam={exam} subject={subject} subjectColor={subjectColor} isOwner={isOwner} />

      <div className="mb-6">
        <ExamShareCard
          anchorId="exam-share"
          examId={exam.id}
          title={exam.title}
          subjectName={exam.subjectName}
          questionCount={exam.questions.length}
          durationMinutes={exam.durationMinutes}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Clock size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Хугацаа', value: `${exam.durationMinutes} мин` },
          { icon: <FileText size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Асуултын тоо', value: examQuestions.length },
          { icon: <Users size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Нийт оноо', value: getTeacherExamMaxScore(exam) },
          { icon: <Calendar size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Үүсгэсэн', value: formatDate(exam.createdAt) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white border rounded-[10px] p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[12px]" style={{ color: '#5A6474' }}>{label}</span></div>
          <div className="text-[20px] font-semibold" style={{ color: '#1A1A2E', fontSize: typeof value === 'string' && value.length > 8 ? '14px' : undefined }}>{value}</div>
        </div>
      ))}
      </div>

      {isApiConfigured() && (
        <div className="bg-white border rounded-[10px] p-4 mb-6" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>
                Оролцсон сурагчид
              </h3>
              <p className="text-[12px]" style={{ color: '#5A6474' }}>
                QR код болон холбоосоор орсон бүх сурагч энд харагдана.
              </p>
            </div>
            <Link
              href={`/teacher/exams/${exam.id}/grade`}
              className="rounded-lg px-3 py-2 text-[12px] font-medium text-white"
              style={{ backgroundColor: '#0066FF' }}
            >
              Дэлгэрэнгүй харах
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-3">
            {[
              { label: 'Оруулж байна', value: participantStats.active, color: '#0066FF' },
              { label: 'Илгээсэн', value: participantStats.submitted, color: '#B45309' },
              { label: 'Үнэлэгдсэн', value: participantStats.graded, color: '#1A7A4A' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border px-4 py-3"
                style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
              >
                <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>
                  {item.label}
                </div>
                <div className="text-[22px] font-semibold" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {participants.length > 0 ? (
            <div className="space-y-3">
              {participants.map((participant) => {
                const statusMeta = getParticipantStatusMeta(participant.status)

                return (
                  <div
                    key={participant.sessionId}
                    className="flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: '#E6EAF0', backgroundColor: '#FFFFFF' }}
                  >
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>
                        {participant.studentName}
                      </div>
                      <div className="text-[12px]" style={{ color: '#8A94A0' }}>
                        {participant.studentId}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{
                          backgroundColor: statusMeta.backgroundColor,
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-[12px]" style={{ color: '#5A6474' }}>
                        Эхэлсэн: {formatParticipantTime(participant.startedAt)}
                      </span>
                      <span className="text-[12px]" style={{ color: '#5A6474' }}>
                        Илгээсэн: {formatParticipantTime(participant.submittedAt)}
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: '#1A1A2E' }}>
                        {participant.score !== null ? `Оноо ${participant.score}` : 'Оноо гараагүй'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-[13px]" style={{ borderColor: '#DDE1E7', color: '#8A94A0' }}>
              Одоогоор энэ шалгалтад орсон сурагч алга байна.
            </div>
          )}
        </div>
      )}

      {Object.keys(typeCounts).length > 0 && (
        <div className="bg-white border rounded-[10px] p-4 mb-6" style={{ borderColor: '#DDE1E7' }}>
          <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A2E' }}>Асуултын төрлөөр</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(typeCounts).map(([type, count]) => (
              <span key={type} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}>
                {QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS] || type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-[10px] p-4 mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-medium" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>{exam.ownerName?.charAt(0) || '?'}</div>
          <div>
            <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>{exam.ownerName || 'Тодорхойгүй'}</div>
            <div className="text-[12px]" style={{ color: '#5A6474' }}>Зохиогч</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <div className="p-4 border-b" style={{ borderColor: '#DDE1E7', backgroundColor: '#F5F7FA' }}>
          <h3 className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>Асуултууд ({examQuestions.length})</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#DDE1E7' }}>
          {examQuestions.map((question, index) => (
            <div key={question.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ backgroundColor: '#0066FF', color: 'white' }}>{index + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>{QUESTION_TYPE_LABELS[question.type] || question.type}</span>
                    <span className="text-[11px]" style={{ color: '#8A94A0' }}>{question.points} оноо</span>
                  </div>
                  <p className="text-[14px] mb-3" style={{ color: '#1A1A2E' }}>{question.text}</p>
                  <QuestionOptionList question={question} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {examQuestions.length === 0 && <div className="text-center py-12 text-[14px]" style={{ color: '#5A6474' }}>Асуулт нэмэгдээгүй байна</div>}
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#DDE1E7' }}>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-red-50" style={{ color: '#C4272F' }}>
            <Trash2 size={14} strokeWidth={1.5} />Шалгалт устгах
          </button>
        </div>
      )}
    </div>
  )
}
