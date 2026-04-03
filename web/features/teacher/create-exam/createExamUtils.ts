import type { Course, Question, Exam, QuestionType, SchoolClass } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'
import { CURRENT_TEACHER_ID, save } from '@/lib/data'
import {
  createExam,
  createQuestion,
  enrollStudent,
  isApiConfigured,
  updateExamStatus,
} from '@/lib/api/teacher-exams'
import { getAuthHeaders } from '@/lib/api/client'
import { buildExamAssignmentNotifications, saveNotifications } from '@/lib/notifications'
import { serializeQuestionForApi } from '@/lib/exam-question-meta'
export type ImportedQuestionPayload = {
  question?: string; type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]; correctAnswer?: string | string[]; points?: number
}
export type ImportApiResponse = { questions?: ImportedQuestionPayload[]; parser?: string; error?: string }
export type ImportFailure = { fileName: string; reason: string }

export const stepLabels = ['Эх сурвалж', 'Ерөнхий мэдээлэл', 'Асуултууд', 'Хуваарь']
const MANUAL_QUESTION_TYPES: QuestionType[] = ['short', 'long', 'formula', 'chemistry', 'code', 'voice', 'video', 'handwritten']

function getDevAuthHeaders(): Headers | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const headers = new Headers()
  const authHeaders = getAuthHeaders('teacher')

  if (authHeaders.Authorization) {
    headers.set('Authorization', authHeaders.Authorization)
  }

  return headers
}

function getImportApiUrl() {
  return '/api/parse-exam'
}

async function postImportFile(file: File, fields: {
  title: string
  courseLabel: string
}) {
  const url = getImportApiUrl()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', file.name)
  formData.append('fileType', file.type)
  formData.append('title', fields.title)
  formData.append('courseLabel', fields.courseLabel)

  const response = await fetch(url, {
    method: 'POST',
    headers: getDevAuthHeaders(),
    body: formData,
  })

  const raw = await response.text()
  let data: ImportApiResponse

  try {
    data = JSON.parse(raw) as ImportApiResponse
  } catch {
    data = {
      error: raw || 'Файл боловсруулах хүсэлт амжилтгүй боллоо.',
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'Файл боловсруулах хүсэлт амжилтгүй боллоо.')
  }

  return data
}

export function isManualQuestionType(type: QuestionType) { return MANUAL_QUESTION_TYPES.includes(type) }
export function getCourseLabel(course: Course) {
  return `${SUBJECT_NAMES[course.subjectId] ?? course.subjectId} • ${course.grade}-р анги`
}

function getImportedQuestionPoints(type: QuestionType, rawPoints?: number) {
  const parsedPoints = Number(rawPoints)

  if (Number.isFinite(parsedPoints) && parsedPoints > 0) {
    return Math.min(2, Math.max(1, Math.round(parsedPoints)))
  }

  return type === 'single' || type === 'truefalse' ? 1 : 2
}

export function mapImportedQuestions(items: ImportedQuestionPayload[], existingCount: number): Question[] {
  const baseId = Date.now()
  return items.reduce<Question[]>((acc, item, index) => {
    const text = item.question?.trim(); if (!text) return acc
    const type: QuestionType = item.type === 'multiple_choice' ? 'single' : item.type === 'true_false' ? 'truefalse' : item.type === 'essay' ? 'long' : 'short'
    const q: Question = { id: `import-q-${baseId}-${index}`, examId: '', text, type, points: getImportedQuestionPoints(type, item.points), order: existingCount + acc.length + 1, isManualGrade: isManualQuestionType(type) }
    if (type === 'single') { q.options = Array.isArray(item.options) ? item.options.map(o => o.trim()).filter(Boolean) : []; q.correctAnswer = typeof item.correctAnswer === 'string' ? item.correctAnswer.trim() : '' }
    else if (type === 'truefalse') { q.correctAnswer = (typeof item.correctAnswer === 'string' ? item.correctAnswer.trim().toLowerCase() : '') === 'false' ? 'false' : 'true' }
    else if (typeof item.correctAnswer === 'string' && item.correctAnswer.trim()) { q.correctAnswer = item.correctAnswer.trim() }
    acc.push(q); return acc
  }, [])
}

function resolveChoiceOption(
  question: Question,
  rawValue: string,
) {
  const normalized = rawValue.trim()

  if (!question.options?.length) {
    return normalized
  }

  const optionByExactMatch = question.options.find(
    (option) => option.trim().toLowerCase() === normalized.toLowerCase(),
  )

  if (optionByExactMatch) {
    return optionByExactMatch
  }

  const token = normalized.replace(/^[\[(]?(.+?)[\])]?.?$/, '$1').trim().toUpperCase()
  const latinIndex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(token)
  const cyrillicIndex = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З'].indexOf(token)
  const numericIndex = Number(token)

  if (latinIndex >= 0 && latinIndex < question.options.length) {
    return question.options[latinIndex]
  }

  if (cyrillicIndex >= 0 && cyrillicIndex < question.options.length) {
    return question.options[cyrillicIndex]
  }

  if (Number.isFinite(numericIndex) && numericIndex >= 1 && numericIndex <= question.options.length) {
    return question.options[numericIndex - 1]
  }

  return normalized
}

function resolveImportedCorrectAnswer(
  question: Question,
  rawValue: string,
) {
  const normalized = rawValue.trim()

  if (!normalized) {
    return undefined
  }

  if (question.type === 'truefalse') {
    const lower = normalized.toLowerCase()

    if (
      lower === 'true' ||
      lower === 't' ||
      lower === 'үнэн' ||
      lower === 'unen' ||
      lower === 'yes'
    ) {
      return 'true'
    }

    if (
      lower === 'false' ||
      lower === 'f' ||
      lower === 'худал' ||
      lower === 'hudal' ||
      lower === 'no'
    ) {
      return 'false'
    }
  }

  if (question.type === 'single') {
    return resolveChoiceOption(question, normalized)
  }

  if (question.type === 'multiple') {
    return normalized
      .split(/[,\s/;]+/)
      .map((item) => resolveChoiceOption(question, item))
      .filter(Boolean)
  }

  return normalized
}

export function applyBulkAnswerKeyToQuestions(
  questions: Question[],
  answerKeyInput: string,
) {
  const lines = answerKeyInput
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return {
      questions,
      appliedCount: 0,
    }
  }

  const indexedAnswers = new Map<number, string>()
  const sequentialAnswers: string[] = []

  for (const line of lines) {
    const matchedLine = line.match(/^(\d+(?:\.\d+)*)\s*[:=.)-]?\s*(.+)$/)

    if (!matchedLine) {
      sequentialAnswers.push(line)
      continue
    }

    const numericSegments = matchedLine[1].split('.')
    const index = Number(numericSegments[numericSegments.length - 1])

    if (Number.isFinite(index) && index >= 1) {
      indexedAnswers.set(index, matchedLine[2].trim())
      continue
    }

    sequentialAnswers.push(matchedLine[2].trim())
  }

  let appliedCount = 0

  return {
    questions: questions.map((question, index) => {
      const rawValue =
        indexedAnswers.get(index + 1) ??
        (indexedAnswers.size === 0 ? sequentialAnswers[index] : undefined)

      if (!rawValue) {
        return question
      }

      const resolvedAnswer = resolveImportedCorrectAnswer(question, rawValue)

      if (
        resolvedAnswer === undefined ||
        (typeof resolvedAnswer === 'string' && resolvedAnswer.trim().length === 0) ||
        (Array.isArray(resolvedAnswer) && resolvedAnswer.length === 0)
      ) {
        return question
      }

      appliedCount += 1

      return {
        ...question,
        correctAnswer: resolvedAnswer,
      }
    }),
    appliedCount,
  }
}

export async function processImportFiles(files: File[], title: string, courseLabel: string) {
  const collected: ImportedQuestionPayload[] = []; const skipped: string[] = []; const failures: ImportFailure[] = []; let usedLocalParser = false
  for (const file of files) {
    let payload: ImportApiResponse

    try {
      payload = await postImportFile(file, { title, courseLabel })
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

export async function saveExamPayload(params: {
  questions: Question[]; title: string; selectedCourse: Course; chapter: string; topic: string
  description: string; duration: number; totalPoints: number; visibility: 'private' | 'school'
  selectedClasses: string[]; startDate: string; startTime: string; endDate: string; endTime: string
  classes: SchoolClass[]
}) {
  const { questions, title, selectedCourse, chapter, topic, description, duration, totalPoints, visibility, selectedClasses, startDate, startTime, endDate, endTime, classes } = params

  if (isApiConfigured()) {
    try {
      const startsAt = startDate && startTime ? `${startDate}T${startTime}` : undefined
      const endsAt = endDate && endTime ? `${endDate}T${endTime}` : undefined
      const result = await createExam({
        title,
        subject: selectedCourse.subjectId || 'МАТ',
        description: description || undefined,
        durationMinutes: duration,
        shuffleQuestions: true,
        allowCopyPaste: false,
        requireFullscreen: true,
        maxTabSwitches: 3,
        startsAt,
        endsAt,
      })
      for (const [i, q] of questions.entries()) {
        const serializedQuestion = serializeQuestionForApi(q)
        await createQuestion(result.id, {
          content: q.text,
          inputType: serializedQuestion.inputType,
          points: q.points,
          orderIndex: i + 1,
          isRequired: true,
          subjectHint: serializedQuestion.subjectHint,
          optionsJson: serializedQuestion.optionsJson,
          correctAnswer: serializedQuestion.correctAnswer,
        })
      }

      const selectedStudentIds = Array.from(
        new Set(
          classes
            .filter((schoolClass) => selectedClasses.includes(schoolClass.id))
            .flatMap((schoolClass) => schoolClass.studentIds),
        ),
      )

      if (selectedStudentIds.length > 0) {
        await Promise.allSettled(
          selectedStudentIds.map((studentId) => enrollStudent(result.id, studentId)),
        )
      }

      const nextStatus =
        selectedClasses.length === 0
          ? 'draft'
          : startsAt && new Date(startsAt) > new Date()
            ? 'scheduled'
            : 'published'

      await updateExamStatus(result.id, nextStatus)

      return result
    } catch {
      // fall through to local save
    }
  }

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

  return exam
}
