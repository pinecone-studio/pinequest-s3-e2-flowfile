import type { Question } from '@/lib/types'

const QUICK_QUIZ_STORAGE_KEY = 'teacher.quick-quiz.latest'
const FALLBACK_OPTIONS = ['Тайлбар', 'Дасгал', 'Жишээ', 'Дүгнэлт']

export type QuickQuizState = {
  examId: string
  title: string
  shareUrl: string
  qrCodeUrl: string
  questionCount: number
  durationMinutes: number
  topic: string
  courseLabel?: string
  classLabel?: string
  createdAt: string
}

function extractSentences(summary: string) {
  return summary
    .split(/[\n.!?]+/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12)
}

function extractKeywords(summary: string, topic: string) {
  const stopWords = new Set([
    'байна',
    'болон',
    'гэсэн',
    'тухай',
    'доорх',
    'дээрх',
    'өнөөдрийн',
    'хичээл',
    'сэдэв',
    'гэсэн',
    'бол',
    'энэ',
    'ийн',
    'ын',
  ])

  const words = `${topic} ${summary}`
    .match(/[A-Za-zА-Яа-яӨөҮүЁё0-9-]+/g)
    ?.map((word) => word.trim())
    .filter((word) => word.length > 3)
    .filter((word) => !stopWords.has(word.toLowerCase())) ?? []

  return Array.from(new Set(words))
}

function buildChoiceOptions(correctValue: string, candidates: string[]) {
  const distractors = candidates
    .filter((item) => item.toLowerCase() !== correctValue.toLowerCase())
    .slice(0, 3)

  const options = [correctValue, ...distractors]

  while (options.length < 4) {
    const fallback = FALLBACK_OPTIONS[options.length - 1]
    if (!options.includes(fallback)) {
      options.push(fallback)
    }
  }

  return options
}

export function generateQuickQuizQuestions(params: {
  topic: string
  summary: string
  count: number
}): Question[] {
  const { topic, summary, count } = params
  const sentences = extractSentences(summary)
  const keywords = extractKeywords(summary, topic)
  const createdAt = Date.now()
  const questions: Question[] = []

  questions.push({
    id: `quick-q-${createdAt}-0`,
    examId: '',
    text: 'Өнөөдрийн quiz-ийн гол сэдэв аль нь вэ?',
    type: 'single',
    options: buildChoiceOptions(topic, keywords),
    correctAnswer: topic,
    points: 1,
    order: 1,
    isManualGrade: false,
  })

  for (let index = 1; index < count; index += 1) {
    if (index % 2 === 1 && sentences.length > 0) {
      const sentence = sentences[(index - 1) % sentences.length]

      questions.push({
        id: `quick-q-${createdAt}-${index}`,
        examId: '',
        text: `Дараах өгүүлбэр өнөөдрийн хичээлийн агуулгад багтсан уу?\n\n"${sentence}"`,
        type: 'truefalse',
        correctAnswer: 'true',
        points: 1,
        order: index + 1,
        isManualGrade: false,
      })

      continue
    }

    const keyword = keywords[index % Math.max(keywords.length, 1)] ?? topic
    const options = buildChoiceOptions(keyword, keywords)

    questions.push({
      id: `quick-q-${createdAt}-${index}`,
      examId: '',
      text: `"${topic}" сэдэвтэй хамгийн их холбоотой ойлголт аль нь вэ?`,
      type: 'single',
      options,
      correctAnswer: keyword,
      points: 1,
      order: index + 1,
      isManualGrade: false,
    })
  }

  return questions.slice(0, count)
}

export function buildQuickQuizTitle(topic: string) {
  return `${topic.trim()} - Шуурхай quiz`
}

export function buildQuickQuizShareUrl(examId: string, origin: string) {
  return new URL(`/student/exams/${examId}`, origin).toString()
}

export function buildQuickQuizQrUrl(shareUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareUrl)}`
}

export function readStoredQuickQuiz() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(QUICK_QUIZ_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as QuickQuizState
  } catch {
    return null
  }
}

export function writeStoredQuickQuiz(state: QuickQuizState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(QUICK_QUIZ_STORAGE_KEY, JSON.stringify(state))
}
