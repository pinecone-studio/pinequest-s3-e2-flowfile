import type { Course, Question, Exam, QuestionType } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'
import { CURRENT_TEACHER_ID, save } from '@/lib/data'
import { buildExamAssignmentNotifications, saveNotifications } from '@/lib/notifications'
import { getApiUrl } from '@/lib/api/client'

export type ImportedQuestionPayload = {
  question?: string; type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]; correctAnswer?: string | string[]; points?: number
}
export type ImportApiResponse = { questions?: ImportedQuestionPayload[]; parser?: string; error?: string }
export type ImportFailure = { fileName: string; reason: string }

export const stepLabels = ['Эх сурвалж', 'Ерөнхий мэдээлэл', 'Асуултууд', 'Хуваарь']
const MANUAL_QUESTION_TYPES: QuestionType[] = ['short', 'long', 'formula', 'chemistry', 'code', 'voice', 'video', 'handwritten']

function getDevAuthHeaders() {
  if (typeof window === 'undefined') {
    return undefined
  }

  const token = window.localStorage.getItem('seedcone.dev_auth_token')
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

function getImportApiUrl() {
  return getApiUrl('/parse-exam')
}

async function postImportPayload(
  payload: Record<string, unknown>,
) {
  const url = getImportApiUrl()

  if (!url) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getDevAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as ImportApiResponse

  if (!response.ok) {
    throw new Error(data.error || 'Файл боловсруулах хүсэлт амжилтгүй боллоо.')
  }

  return data
}

export function isManualQuestionType(type: QuestionType) { return MANUAL_QUESTION_TYPES.includes(type) }
export function getCourseLabel(course: Course) {
  return `${SUBJECT_NAMES[course.subjectId] ?? course.subjectId} • ${course.grade}-р анги`
}
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''; const bytes = new Uint8Array(buffer); const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) { binary += String.fromCharCode(...bytes.subarray(i, i + chunk)) }
  return btoa(binary)
}

export function mapImportedQuestions(items: ImportedQuestionPayload[], existingCount: number): Question[] {
  const baseId = Date.now()
  return items.reduce<Question[]>((acc, item, index) => {
    const text = item.question?.trim(); if (!text) return acc
    const type: QuestionType = item.type === 'multiple_choice' ? 'single' : item.type === 'true_false' ? 'truefalse' : item.type === 'essay' ? 'long' : 'short'
    const q: Question = { id: `import-q-${baseId}-${index}`, examId: '', text, type, points: Math.max(1, Number(item.points) || 10), order: existingCount + acc.length + 1, isManualGrade: isManualQuestionType(type) }
    if (type === 'single') { q.options = Array.isArray(item.options) ? item.options.map(o => o.trim()).filter(Boolean) : []; q.correctAnswer = typeof item.correctAnswer === 'string' ? item.correctAnswer.trim() : '' }
    else if (type === 'truefalse') { q.correctAnswer = (typeof item.correctAnswer === 'string' ? item.correctAnswer.trim().toLowerCase() : '') === 'false' ? 'false' : 'true' }
    else if (typeof item.correctAnswer === 'string' && item.correctAnswer.trim()) { q.correctAnswer = item.correctAnswer.trim() }
    acc.push(q); return acc
  }, [])
}

export async function processImportFiles(files: File[], title: string, courseLabel: string) {
  const collected: ImportedQuestionPayload[] = []; const skipped: string[] = []; const failures: ImportFailure[] = []; let usedLocalParser = false
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const isBinary = ['docx', 'pdf'].includes(ext)

    let payload: ImportApiResponse

    try {
      const fileText = isBinary ? '' : await file.text()
      const fileBuffer = isBinary ? arrayBufferToBase64(await file.arrayBuffer()) : undefined
      payload = await postImportPayload({
        fileText,
        fileBuffer,
        fileType: file.type,
        fileName: file.name,
        title,
        courseLabel,
      })
    } catch (error) {
      skipped.push(file.name)
      failures.push({
        fileName: file.name,
        reason: error instanceof Error ? error.message : 'Файл боловсруулах үед тодорхойгүй алдаа гарлаа.',
      })
      continue
    }

    if (payload.parser === 'local') usedLocalParser = true
    if (payload.questions?.length) collected.push(...payload.questions)
    else {
      skipped.push(file.name)
      failures.push({
        fileName: file.name,
        reason: payload.error || 'Асуулт таньж чадсангүй.',
      })
    }
  }
  return { collected, skipped, failures, usedLocalParser }
}

export function generateMockAIQuestions(aiTopic: string, aiDifficulty: 'easy' | 'medium' | 'hard', aiCount: number): Question[] {
  const label = aiDifficulty === 'easy' ? 'Хөнгөн' : aiDifficulty === 'medium' ? 'Дунд' : 'Хүнд'
  return Array.from({ length: aiCount }, (_, i) => ({
    id: `ai-q-${Date.now()}-${i}`, examId: '',
    text: `${aiTopic}-тэй холбоотой асуулт #${i + 1} (${label})`,
    type: (i % 3 === 0 ? 'single' : i % 3 === 1 ? 'multiple' : 'truefalse') as QuestionType,
    points: aiDifficulty === 'easy' ? 1 : aiDifficulty === 'medium' ? 2 : 3,
    order: i + 1, isManualGrade: false,
    options: i % 3 !== 2 ? ['Хариулт А', 'Хариулт Б', 'Хариулт В', 'Хариулт Г'] : undefined,
    correctAnswer: i % 3 === 0 ? 'Хариулт А' : i % 3 === 1 ? ['Хариулт А', 'Хариулт Б'] : 'true',
  }))
}

export function generateDemoQuestions(subjectName: string, existingCount: number): Question[] {
  const b = Date.now()
  return [
    { id: `demo-q-${b}-1`, examId: '', text: `${subjectName} хичээлээс зөв тодорхойлолтыг сонгоно уу.`, type: 'single', options: ['Хариулт А', 'Хариулт Б', 'Хариулт В', 'Хариулт Г'], correctAnswer: 'Хариулт А', points: 2, order: existingCount + 1, isManualGrade: false },
    { id: `demo-q-${b}-2`, examId: '', text: `${subjectName} хичээлийн дараах өгүүлбэр үнэн эсэхийг сонгоно уу.`, type: 'truefalse', correctAnswer: 'true', points: 1, order: existingCount + 2, isManualGrade: false },
    { id: `demo-q-${b}-3`, examId: '', text: `${subjectName} хичээлийн гол ойлголтыг тайлбарлана уу.`, type: 'short', points: 3, order: existingCount + 3, isManualGrade: true },
  ]
}

export function saveExamPayload(params: {
  questions: Question[]; title: string; selectedCourse: Course; chapter: string; topic: string
  description: string; duration: number; totalPoints: number; visibility: 'private' | 'school'
  selectedClasses: string[]; startDate: string; startTime: string; endDate: string; endTime: string
  classes: { id: string; name: string; studentIds: string[] }[]
}) {
  const { questions, title, selectedCourse, chapter, topic, description, duration, totalPoints, visibility, selectedClasses, startDate, startTime, endDate, endTime, classes } = params
  const now = new Date().toISOString(); const newExamId = `exam-${Date.now()}`
  const prepared = questions.map((q, i) => ({ ...q, examId: newExamId, order: i + 1, isManualGrade: isManualQuestionType(q.type) }))
  const exam: Exam = { id: newExamId, title, subjectId: selectedCourse.subjectId, grade: selectedCourse.grade, chapter: chapter || undefined, topic: topic || undefined, description: description || undefined, duration, totalPoints, ownerType: 'teacher', visibility, ownerId: CURRENT_TEACHER_ID, collaboratorIds: [], createdAt: now, updatedAt: now, questionIds: prepared.map(q => q.id), status: selectedClasses.length > 0 ? 'published' : 'draft', isTemplate: false, tags: [selectedCourse.subjectId, chapter, topic].filter(Boolean) as string[] }
  prepared.forEach(q => { if (/^(q-new|ai-q|demo-q|import-q)-/.test(q.id)) save('questions', q) })
  save('exams', exam)
  if (selectedClasses.length > 0 && startDate && startTime && endDate && endTime) {
    selectedClasses.forEach(classId => save('examAssignments', { id: `assignment-${Date.now()}-${classId}`, examId: exam.id, classId, assignedBy: CURRENT_TEACHER_ID, scheduledStart: `${startDate}T${startTime}`, scheduledEnd: `${endDate}T${endTime}`, isPaused: false, extendedMinutes: 0, status: 'scheduled' }))
    saveNotifications(buildExamAssignmentNotifications({
      exam,
      selectedClasses: classes.filter((schoolClass) => selectedClasses.includes(schoolClass.id)),
    }))
  }
}
