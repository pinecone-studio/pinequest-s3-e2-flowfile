import type { Question, QuestionType } from '@/lib/types'

export type ApiQuestionInputType =
  | 'mcq'
  | 'short_text'
  | 'rich_text'
  | 'math_formula'
  | 'chem_formula'
  | 'handwritten'
  | 'voice_record'

const QUESTION_TYPE_HINT_PREFIX = 'type:'

function splitHintTokens(subjectHint?: string | null) {
  return (subjectHint ?? '')
    .split('|')
    .map((token) => token.trim())
    .filter(Boolean)
}

export function parseQuestionTypeHint(subjectHint?: string | null): QuestionType | null {
  const token = splitHintTokens(subjectHint).find((item) =>
    item.startsWith(QUESTION_TYPE_HINT_PREFIX),
  )

  if (!token) {
    return null
  }

  const value = token.slice(QUESTION_TYPE_HINT_PREFIX.length)
  const allowedTypes = new Set<QuestionType>([
    'single',
    'multiple',
    'truefalse',
    'matching',
    'short',
    'long',
    'formula',
    'chemistry',
    'code',
    'voice',
    'video',
    'handwritten',
  ])

  return allowedTypes.has(value as QuestionType) ? (value as QuestionType) : null
}

export function buildQuestionSubjectHint(
  type: QuestionType,
  subjectHint?: string | null,
) {
  const extraTokens = splitHintTokens(subjectHint).filter(
    (token) => !token.startsWith(QUESTION_TYPE_HINT_PREFIX),
  )

  return [`${QUESTION_TYPE_HINT_PREFIX}${type}`, ...extraTokens].join('|')
}

export function getQuestionTypeFromApi(
  inputType: ApiQuestionInputType,
  subjectHint?: string | null,
): QuestionType {
  const hintedType = parseQuestionTypeHint(subjectHint)

  if (hintedType) {
    return hintedType
  }

  switch (inputType) {
    case 'mcq':
      return 'single'
    case 'short_text':
      return 'short'
    case 'rich_text':
      return 'long'
    case 'math_formula':
      return 'formula'
    case 'chem_formula':
      return 'chemistry'
    case 'voice_record':
      return 'voice'
    case 'handwritten':
      return 'handwritten'
    default:
      return 'long'
  }
}

export function parseQuestionOptions(optionsJson?: string | null) {
  if (!optionsJson) {
    return undefined
  }

  try {
    const parsed = JSON.parse(optionsJson) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : undefined
  } catch {
    return undefined
  }
}

export function parseMatchingPairs(optionsJson?: string | null) {
  if (!optionsJson) {
    return undefined
  }

  try {
    const parsed = JSON.parse(optionsJson) as unknown

    if (!Array.isArray(parsed)) {
      return undefined
    }

    const matchingPairs = parsed.filter(
      (item): item is { left: string; right: string } =>
        Boolean(
          item &&
            typeof item === 'object' &&
            'left' in item &&
            'right' in item &&
            typeof item.left === 'string' &&
            typeof item.right === 'string',
        ),
    )

    return matchingPairs.length > 0 ? matchingPairs : undefined
  } catch {
    return undefined
  }
}

export function parseQuestionCorrectAnswer(
  correctAnswer: string | null | undefined,
  type: QuestionType,
): Question['correctAnswer'] | undefined {
  if (!correctAnswer) {
    return undefined
  }

  if (type === 'multiple') {
    try {
      const parsed = JSON.parse(correctAnswer) as unknown
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : undefined
    } catch {
      return undefined
    }
  }

  return correctAnswer
}

export function serializeQuestionForApi(
  question: Pick<
    Question,
    'type' | 'options' | 'matchingPairs' | 'correctAnswer'
  >,
) {
  const subjectHint = buildQuestionSubjectHint(question.type)

  switch (question.type) {
    case 'single':
      return {
        inputType: 'mcq' as const,
        subjectHint,
        optionsJson:
          question.options && question.options.length > 0
            ? JSON.stringify(question.options)
            : undefined,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'multiple':
      return {
        inputType: 'mcq' as const,
        subjectHint,
        optionsJson:
          question.options && question.options.length > 0
            ? JSON.stringify(question.options)
            : undefined,
        correctAnswer: Array.isArray(question.correctAnswer)
          ? JSON.stringify(question.correctAnswer)
          : undefined,
      }
    case 'truefalse':
      return {
        inputType: 'mcq' as const,
        subjectHint,
        optionsJson: JSON.stringify(['true', 'false']),
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'matching':
      return {
        inputType: 'rich_text' as const,
        subjectHint,
        optionsJson:
          question.matchingPairs && question.matchingPairs.length > 0
            ? JSON.stringify(question.matchingPairs)
            : undefined,
        correctAnswer: undefined,
      }
    case 'short':
      return {
        inputType: 'short_text' as const,
        subjectHint,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'formula':
      return {
        inputType: 'math_formula' as const,
        subjectHint,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'chemistry':
      return {
        inputType: 'chem_formula' as const,
        subjectHint,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'voice':
      return {
        inputType: 'voice_record' as const,
        subjectHint,
      }
    case 'video':
      return {
        inputType: 'handwritten' as const,
        subjectHint,
      }
    case 'handwritten':
      return {
        inputType: 'handwritten' as const,
        subjectHint,
      }
    case 'code':
      return {
        inputType: 'rich_text' as const,
        subjectHint,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
    case 'long':
    default:
      return {
        inputType: 'rich_text' as const,
        subjectHint,
        correctAnswer:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : undefined,
      }
  }
}
