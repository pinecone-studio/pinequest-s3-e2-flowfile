import type { Question } from '@/lib/types'
import {
  buildQrCodeUrl,
  buildStudentExamShareUrl,
  resolvePublicAppOrigin,
} from '@/lib/share-links'

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

export function resolveQuickQuizShareOrigin(origin?: string) {
  return resolvePublicAppOrigin(origin)
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

export function generateAllTaskDemoQuestions(topic: string): Question[] {
  const createdAt = Date.now()
  const normalizedTopic = topic.trim() || 'Бүх төрлийн demo шалгалт'

  return [
    {
      id: `full-demo-${createdAt}-1`,
      examId: '',
      text: `"${normalizedTopic}" сэдвийн үндсэн ойлголтыг сонгоно уу.`,
      type: 'single',
      options: ['Гол ойлголт', 'Хамааралгүй сонголт', 'Жишээ мэдээлэл', 'Туслах тайлбар'],
      correctAnswer: 'Гол ойлголт',
      points: 1,
      order: 1,
      isManualGrade: false,
    },
    {
      id: `full-demo-${createdAt}-2`,
      examId: '',
      text: `"${normalizedTopic}" сэдэвтэй холбоотой зөв сонголтуудыг тэмдэглэнэ үү.`,
      type: 'multiple',
      options: ['Томъёо', 'Жишээ', 'Ойлголт', 'Хамааралгүй үг'],
      correctAnswer: ['Томъёо', 'Жишээ', 'Ойлголт'],
      points: 2,
      order: 2,
      isManualGrade: false,
    },
    {
      id: `full-demo-${createdAt}-3`,
      examId: '',
      text: `"${normalizedTopic}" нь өнөөдрийн хичээлийн агуулгад багтсан.`,
      type: 'truefalse',
      correctAnswer: 'true',
      points: 1,
      order: 3,
      isManualGrade: false,
    },
    {
      id: `full-demo-${createdAt}-4`,
      examId: '',
      text: 'Дараах ойлголтуудыг тайлбартай нь тааруулна уу.',
      type: 'matching',
      matchingPairs: [
        { left: 'Томъёо', right: 'Илэрхийлэл' },
        { left: 'График', right: 'Дүрслэл' },
        { left: 'Жишээ', right: 'Хэрэглээ' },
      ],
      points: 2,
      order: 4,
      isManualGrade: false,
    },
    {
      id: `full-demo-${createdAt}-5`,
      examId: '',
      text: `"${normalizedTopic}"-ийн тухай нэг өгүүлбэртэй богино хариулт бичнэ үү.`,
      type: 'short',
      correctAnswer: 'Товч тайлбар хүлээн авна.',
      points: 2,
      order: 5,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-6`,
      examId: '',
      text: `"${normalizedTopic}"-ийн хэрэглээг 3-4 өгүүлбэрээр тайлбарлана уу.`,
      type: 'long',
      correctAnswer: 'Гол ойлголт, хэрэглээ, дүгнэлтээ багтаасан байхад болно.',
      points: 3,
      order: 6,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-7`,
      examId: '',
      text: 'Дараах илэрхийллийг томъёоны keyboard ашиглан бичнэ үү: x² + 2x + 1',
      type: 'formula',
      correctAnswer: 'x^2+2x+1',
      points: 2,
      order: 7,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-8`,
      examId: '',
      text: 'Этанолын бүтцийг химийн editor ашиглан зурна уу.',
      type: 'chemistry',
      correctAnswer: 'C2H5OH',
      points: 2,
      order: 8,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-9`,
      examId: '',
      text: '1-ээс 5 хүртэлх тоонуудын нийлбэрийг олдог JavaScript код бичнэ үү.',
      type: 'code',
      correctAnswer: 'for эсвэл reduce ашигласан зөв код байхад болно.',
      points: 3,
      order: 9,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-10`,
      examId: '',
      text: 'Энэ сэдвийг 20 секунд орчим дуугаар тайлбарлана уу.',
      type: 'voice',
      points: 2,
      order: 10,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-11`,
      examId: '',
      text: 'Видео эсвэл зураг ашиглаад бодолтоо тайлбарлан оруулна уу.',
      type: 'video',
      points: 2,
      order: 11,
      isManualGrade: true,
    },
    {
      id: `full-demo-${createdAt}-12`,
      examId: '',
      text: 'Гараар бодсон шийдлээ зураг, скан эсвэл файл хэлбэрээр оруулна уу.',
      type: 'handwritten',
      points: 2,
      order: 12,
      isManualGrade: true,
    },
  ]
}

export function buildQuickQuizTitle(topic: string) {
  return `${topic.trim()} - Шуурхай quiz`
}

export function buildQuickQuizShareUrl(examId: string, origin: string) {
  return buildStudentExamShareUrl(examId, origin)
}

export function buildQuickQuizQrUrl(shareUrl: string) {
  return buildQrCodeUrl(shareUrl, 220)
}

export function normalizeQuickQuizState(
  state: QuickQuizState,
  origin = resolveQuickQuizShareOrigin(),
) {
  const shareUrl = buildQuickQuizShareUrl(state.examId, origin)

  return {
    ...state,
    shareUrl,
    qrCodeUrl: buildQuickQuizQrUrl(shareUrl),
  }
}

export function readStoredQuickQuiz(origin?: string) {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(QUICK_QUIZ_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return normalizeQuickQuizState(
      JSON.parse(raw) as QuickQuizState,
      resolveQuickQuizShareOrigin(origin),
    )
  } catch {
    return null
  }
}

export function writeStoredQuickQuiz(state: QuickQuizState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    QUICK_QUIZ_STORAGE_KEY,
    JSON.stringify(normalizeQuickQuizState(state)),
  )
}
