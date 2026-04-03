import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

export const runtime = 'nodejs'

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
type SubjectProfile = 'mongolian_language' | 'language' | 'math' | 'chemistry' | 'science' | 'social_science' | 'generic'
type SectionType = 'meta' | 'reading' | 'listening' | 'writing' | 'essay' | 'multiple_choice' | 'short_answer' | 'table_context' | 'generic'

type ImportedQuestionPayload = {
  question?: string
  type?: QuestionType
  options?: string[]
  correctAnswer?: string | string[]
  points?: number
  timerMinutes?: number
  imageUrl?: string
}

type RawQuestionBlock = {
  questionNumber: number
  rawBlock: string
  sectionType?: SectionType
  sharedContext?: string
  imageMarker?: string
}

type AnthropicResponse = {
  content?: Array<{
    type?: string
    text?: string
  }>
  error?: {
    message?: string
  }
}

type PendingSharedContext = {
  text?: string
  imageMarker?: string
  sectionType?: SectionType
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim()
}

function normalizePreservingLines(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(line => line.replace(/[ ]{2,}/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isPageChromeLine(line: string) {
  const text = normalizeWhitespace(line)
  if (!text) return true
  if (/^\d+$/.test(text)) return true
  if (/^[ivxlcdm]+$/i.test(text)) return true
  if (/^(page|хуудас)\s*\d+$/i.test(text)) return true
  if (/^хувилбар\s*[a-zа-яёөү0-9]+$/i.test(text)) return true
  if (/^(элсэлтийн\s*шалгалт|ерөнхий\s*шалгалт|улсын\s*шалгалт|шалгалт)\s*\d{4}$/i.test(text)) return true
  if (/^(eec|элсэлт|даалгаврын\s*сан|test\s*booklet)$/i.test(text)) return true
  return false
}

function stripRepeatedPageChrome(text: string) {
  const normalized = normalizePreservingLines(text)
  if (!normalized) return normalized

  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const counts = new Map<string, number>()
  for (const line of lines) {
    const key = normalizeWhitespace(line).toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return lines
    .filter(line => {
      const key = normalizeWhitespace(line).toLowerCase()
      const repeated = (counts.get(key) ?? 0) >= 2
      const shortish = key.length <= 60

      if (isPageChromeLine(line)) return false
      if (repeated && shortish && /^(элсэлтийн\s*шалгалт|ерөнхий\s*шалгалт|улсын\s*шалгалт|хувилбар|page|хуудас|\d+$)/i.test(key)) {
        return false
      }

      return true
    })
    .join('\n')
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' '))
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapSvgText(text: string, maxCharsPerLine = 26) {
  const normalized = normalizeWhitespace(text)
  if (!normalized) return ['']

  const words = normalized.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxCharsPerLine) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.slice(0, 5)
}

function createTableSvgDataUrl(rows: string[][]) {
  const sanitizedRows = rows
    .map(row => row.map(cell => normalizeWhitespace(cell)))
    .filter(row => row.some(cell => cell.length > 0))

  if (sanitizedRows.length === 0) {
    return ''
  }

  const columnCount = Math.max(...sanitizedRows.map(row => row.length), 1)
  const columnWidth = 240
  const baseRowHeight = 34

  const rowHeights = sanitizedRows.map(row => {
    const maxWrappedLines = Math.max(
      ...Array.from({ length: columnCount }, (_, index) => wrapSvgText(row[index] ?? '').length),
      1,
    )
    return Math.max(baseRowHeight, 20 + maxWrappedLines * 18)
  })

  const width = columnCount * columnWidth
  const height = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0)

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#ffffff" />`,
  ]

  let y = 0
  for (let rowIndex = 0; rowIndex < sanitizedRows.length; rowIndex += 1) {
    const row = sanitizedRows[rowIndex]
    const rowHeight = rowHeights[rowIndex]

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const x = columnIndex * columnWidth
      const cellText = row[columnIndex] ?? ''
      const wrapped = wrapSvgText(cellText).map(escapeXml)

      parts.push(
        `<rect x="${x}" y="${y}" width="${columnWidth}" height="${rowHeight}" fill="${rowIndex === 0 ? '#f3f6fb' : '#ffffff'}" stroke="#cfd8e3" />`,
      )

      wrapped.forEach((line, lineIndex) => {
        parts.push(
          `<text x="${x + 10}" y="${y + 24 + lineIndex * 18}" font-family="Arial, sans-serif" font-size="14" fill="#1a1a2e">${line}</text>`,
        )
      })
    }

    y += rowHeight
  }

  parts.push('</svg>')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`
}

function convertTableHtmlToImage(tableHtml: string) {
  const rowMatches = [...tableHtml.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)]
  const rows = rowMatches.map(rowMatch => {
    const cellMatches = [...rowMatch[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)]
    return cellMatches.map(cellMatch => stripHtml(cellMatch[1]))
  })

  return createTableSvgDataUrl(rows)
}

async function extractDocxContent(buffer: Buffer) {
  const tableImages: Record<string, string> = {}
  const htmlResult = await mammoth.convertToHtml({ buffer })
  let tableIndex = 0

  const htmlWithMarkers = htmlResult.value.replace(/<table[\s\S]*?<\/table>/gi, tableHtml => {
    tableIndex += 1
    const marker = `[TABLE_IMAGE_${tableIndex}]`
    const imageUrl = convertTableHtmlToImage(tableHtml)
    if (imageUrl) {
      tableImages[marker] = imageUrl
    }
    return `\n${marker}\n`
  })

  const text = decodeHtmlEntities(
    htmlWithMarkers
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|h6)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )

  return {
    text: stripRepeatedPageChrome(normalizePreservingLines(text)),
    tableImages,
  }
}

async function extractPdfContent(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer })
  try {
    const extracted = await parser.getText()
    return stripRepeatedPageChrome(normalizePreservingLines(extracted.text ?? ''))
  } finally {
    await parser.destroy()
  }
}

const QUESTION_POINTS_PATTERN = /\b(\d+)\s*-?\s*р?\s*оноо\b/gi

function extractPointsFromQuestionText(value: string) {
  const matches = [...value.matchAll(QUESTION_POINTS_PATTERN)]
  const lastMatch = matches.at(-1)

  return {
    points: lastMatch ? Math.max(1, Number(lastMatch[1]) || 10) : null,
    question: value.replace(QUESTION_POINTS_PATTERN, '').replace(/\s{2,}/g, ' ').trim(),
  }
}

function detectSubjectProfile(input: { fileName?: string; title?: string; courseLabel?: string; fileText: string }): SubjectProfile {
  const haystack = normalizeWhitespace(
    [input.fileName, input.title, input.courseLabel, input.fileText.slice(0, 4000)].filter(Boolean).join(' '),
  ).toLowerCase()

  if (/монгол\s*хэл|монгол\s*бичиг|уран\s*зохиол/.test(haystack)) return 'mongolian_language'
  if (/англи\s*хэл|орос\s*хэл|language|listening|reading/.test(haystack)) return 'language'
  if (/математик|алгебр|геометр|тэгшитгэл|функц/.test(haystack)) return 'math'
  if (/хими|chemical|equation|урвал|моль|элемент|период/.test(haystack)) return 'chemistry'
  if (/физик|биологи|газарзүй|science|байгалийн\s*ухаан/.test(haystack)) return 'science'
  if (/нийгэм|түүх|иргэн|эдийн\s*засаг|нийгмийн\s*ухаан/.test(haystack)) return 'social_science'
  return 'generic'
}

function isMetaLine(line: string) {
  return /^(батлав|сургалтын менежер|санамж|заавар|instructions?|answer sheet|түлхүүр|хариултын\s*хуудас|[a-zа-яёөү]\s*хувилбар|variant)\b/i.test(
    line.trim(),
  )
}

function isSectionHeading(line: string) {
  return /^(нэгдүгээр\s*хэсэг|хоёрдугаар\s*хэсэг|гуравдугаар\s*хэсэг|дөрөвдүгээр\s*хэсэг|i+\s*хэсэг|ii+\s*хэсэг|iii+\s*хэсэг|part\s+[a-z0-9]+|section\s+[a-z0-9]+|эсээний\s*хэсэг|унших\s*хэсэг|бичих\s*хэсэг|сонсох\s*хэсэг|даалгавар\s*\d+[-–]\d+)/i.test(
    line.trim(),
  )
}

function inferSectionType(line: string, subjectProfile: SubjectProfile): SectionType {
  const value = line.toLowerCase()
  if (isMetaLine(line)) return 'meta'
  if (/сонсох|listening/.test(value)) return 'listening'
  if (/унш|эхийг\s*унша|reading/.test(value)) return 'reading'
  if (/эсээ|эх\s*зохион\s*найруул|зохион\s*бич|write an essay|essay/.test(value)) return 'essay'
  if (/бичих|write|rewrite|найруул/.test(value)) return 'writing'
  if (/сонго|choose|select|multiple choice|тест/.test(value)) return 'multiple_choice'
  if (/богино\s*хариул|fill in|define|тодорхойл|short answer/.test(value)) return 'short_answer'
  if (/хүснэгт|график|зураг|figure|chart|periodic|период/.test(value)) return 'table_context'
  if (subjectProfile === 'mongolian_language') return 'reading'
  return 'generic'
}

function isEssayPrompt(line: string) {
  return /\b(эсээ\s*бич|эх\s*зохион\s*найруул|тайлбарла|харьцуул|дүгнэ|тодорхойл|шинжил|өөрийн\s*үзэл\s*бодол|сэдвээс\s*нэгийг\s*сонгон|explain|discuss|compare|analyze|justify|write)\b/i.test(
    line,
  )
}

function isOpenQuestionPrompt(line: string) {
  return /\b(яагаад|хэрхэн|тайлбарла|тодорхойл|ол|бод|дүгнэ|харьцуул|тэнцүүл|тооцоол|хөрвүүл|rewrite|translate|define|calculate|balance)\b/i.test(
    line,
  )
}

function isSharedContextLine(line: string) {
  return /(дараах\s+(эх|хүснэгт|график|зураг|схем|томьёо|өгөгдөл|case|text)|ашиглан|ажиглаад|уншаад|look at the table|use the figure|periodic table|периодын\s*хүснэгт)/i.test(
    line,
  )
}

function looksLikeCalculationOrFormula(text: string) {
  return /(->|→|⇌|Δ|[A-Z][a-z]?\d?|H2O|NaCl|CO2|[=+\-*/()]|моль|масс|урвал|formula|equation|тэнцүүл|тооцоол)/i.test(text)
}

function findOptionSegments(line: string) {
  const matches = [...line.matchAll(/(?:^|\s)([A-H]|[А-Е])[\).:]\s+/g)]
  if (matches.length < 2) return null

  const segments: string[] = []
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? line.length) : line.length
    segments.push(line.slice(start).trim().slice(0, end - start).trim())
  }
  return segments.filter(Boolean)
}

function isRealMultipleChoiceOptionLine(line: string) {
  return /^([A-H]|[А-Е])[\).:]\s+\S+/i.test(line.trim())
}

function isSubQuestionStart(line: string) {
  return /^(\d+(?:\.\d+)+)(?:[\).:])?\s+\S/.test(line.trim())
}

function isBlankLabelLine(line: string) {
  return /^[a-zа-яёөү][\).:]\s*(?:_{1,}|\[\s*\]|$)/i.test(line.trim())
}

function extractChoicePool(lines: string[]) {
  const joined = normalizeWhitespace(lines.join(' '))
  const match = joined.match(/\b(?:0|1|2|3|4|5|6|7|8|9)(?:\s*[,;.]?\s*(?:0|1|2|3|4|5|6|7|8|9))+\b/)
  if (!match) return []
  return match[0]
    .split(/[\s,;.]+/)
    .map(value => value.trim())
    .filter(Boolean)
}

function looksLikeLabelToDigitMapping(lines: string[]) {
  const blankLabelCount = lines.filter(isBlankLabelLine).length
  const choicePool = extractChoicePool(lines)
  const numberedSubItems = lines.filter(line => /^(\d+(?:\.\d+)+)(?:[\).:])?\s+\S/.test(line.trim())).length
  return blankLabelCount >= 2 && choicePool.length >= 3 && numberedSubItems >= 1
}

function expandEssayTopicChoices(lines: string[]) {
  const intro = normalizeWhitespace(
    lines
      .filter(line => !/^[A-ZА-ЯӨҮЁ0-9][\).:]/.test(line.trim()))
      .join(' '),
  )

  const topicLines = lines.filter(line => /^[A-ZА-ЯӨҮЁ0-9][\).:]\s+/.test(line.trim()))
  if (!intro || topicLines.length < 2) return null

  return topicLines
    .map(line => line.replace(/^[A-ZА-ЯӨҮЁ0-9][\).:]\s+/, '').trim())
    .filter(Boolean)
    .map(topic => normalizeWhitespace(`${intro} ${topic}`))
}

function buildQuestionExtractionPrompt({
  fileName,
  fileText,
  title,
  courseLabel,
}: {
  fileName: string
  fileText: string
  title?: string
  courseLabel?: string
}) {
  return [
    'You extract exam questions from educational documents.',
    'Read the full document and convert only real exam questions into a strict JSON array.',
    'Return only valid JSON. Do not return markdown, prose, headings, or code fences.',
    'Return a JSON array only.',
    'Each item must contain exactly these keys:',
    '{ "question": string, "type": "multiple_choice" | "true_false" | "short_answer" | "essay", "options": string[], "correctAnswer": string | string[], "points": number, "timerMinutes": number }',
    'Important structure rules:',
    '- Some exams begin with reading or essay prompts before numbered questions. Extract those too.',
    '- Some exams end with essay writing prompts. Extract those too.',
    '- Treat Sanamj / instructions / approval headers / variant labels as metadata, not questions.',
    '- If a shared passage, table, graph, formula, or periodic table applies to later questions, keep that reference inside the related question text.',
    '- Do not assume every real question starts with 1., 2., 3.',
    '- Do not treat A., B., C. as new questions when they are options or essay topic choices.',
    '- In essay sections, topic choices may appear as A., B., C. or 1., 2., 3.; these are not multiple-choice options unless the document clearly asks to choose an answer option.',
    '- Preserve original language exactly as written.',
    '- If no answer key is present, set correctAnswer to "".',
    '- Default points to 10 and timerMinutes to 2 if missing.',
    title ? `Exam title context: ${title}` : '',
    courseLabel ? `Course context: ${courseLabel}` : '',
    `File name: ${fileName}`,
    'Document content begins below:',
    fileText,
  ]
    .filter(Boolean)
    .join('\n')
}

function buildQuestionSegmentationPrompt(fileText: string) {
  return [
    'Identify every real exam question block in the document.',
    'Return only valid JSON.',
    'Return a JSON array of objects with exactly these keys:',
    '{ "questionNumber": number, "rawBlock": string, "sectionType": string }',
    '- Some real questions may be unnumbered essay or reading prompts.',
    '- Ignore metadata such as Sanamj, approval text, repeated headings, variant labels, and page numbers.',
    '- Keep shared passage, table, graph, formula, or context with the related question block.',
    '- Do not split a single question into multiple blocks.',
    'Document:',
    fileText,
  ].join('\n')
}

function buildSingleQuestionParsePrompt(rawBlock: string) {
  return [
    'Convert this single exam question block into one JSON object.',
    'Return only valid JSON.',
    '{ "question": string, "type": "multiple_choice" | "true_false" | "short_answer" | "essay", "options": string[], "correctAnswer": string | string[], "points": number, "timerMinutes": number }',
    '- Preserve original language.',
    '- If this is an essay or open writing prompt, set options to [].',
    '- If no answer key exists, set correctAnswer to "".',
    '- Default points to 10 if missing.',
    '- Default timerMinutes to 2 if missing.',
    'Question block:',
    rawBlock,
  ].join('\n')
}

function extractJsonArray<T = ImportedQuestionPayload>(raw: string) {
  const fenced = raw.replace(/```json|```/gi, '').trim()
  const start = fenced.indexOf('[')
  const end = fenced.lastIndexOf(']')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Model did not return a JSON array.')
  }
  return JSON.parse(fenced.slice(start, end + 1)) as T[]
}

function extractJsonObject<T = ImportedQuestionPayload>(raw: string) {
  const fenced = raw.replace(/```json|```/gi, '').trim()
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Model did not return a JSON object.')
  }
  return JSON.parse(fenced.slice(start, end + 1)) as T
}

function segmentQuestionBlocksLocally(text: string, subjectProfile: SubjectProfile): RawQuestionBlock[] {
  const normalized = normalizePreservingLines(text)
  if (!normalized) return []

  const allLines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const numberedPromptPattern = /^(\d+(?:\.\d+)*)(?:[\).:])?\s+\S/
  const optionPattern = /^([A-H]|[А-Е]|[a-h]|[а-е])[\).:]\s+/
  const answerLinePattern = /^(correct answer|answer|зөв хариулт|хариу)[:：]/i

  const blocks: RawQuestionBlock[] = []
  let currentNumber = 0
  let currentLines: string[] = []
  let currentSection: SectionType = 'generic'
  let pendingContext: PendingSharedContext | null = null
  let looseCounter = 1000

  const pushCurrent = () => {
    if (!currentLines.length) return
    const rawBlock = currentLines.join('\n').trim()
    if (!rawBlock) return

    blocks.push({
      questionNumber: currentNumber > 0 ? currentNumber : looseCounter++,
      rawBlock,
      sectionType: currentSection,
      sharedContext: pendingContext?.text,
      imageMarker: pendingContext?.imageMarker,
    })

    currentLines = []
    pendingContext = null
  }

  for (let index = 0; index < allLines.length; index += 1) {
    const line = allLines[index]
    if (!line || isPageChromeLine(line)) continue

    if (isMetaLine(line)) {
      if (isSharedContextLine(line)) {
        pendingContext = {
          text: line,
          sectionType: 'table_context',
          imageMarker: [...line.matchAll(/\[TABLE_IMAGE_\d+\]/g)].map(match => match[0])[0],
        }
      }
      continue
    }

    if (isSectionHeading(line)) {
      currentSection = inferSectionType(line, subjectProfile)
      continue
    }

    if (isSharedContextLine(line) && !numberedPromptPattern.test(line) && !isEssayPrompt(line)) {
      const activePendingContext = pendingContext as PendingSharedContext | null
      const pendingText: string | undefined = activePendingContext?.text
      const pendingImageMarker: string | undefined = activePendingContext?.imageMarker
      pendingContext = {
        text: pendingText ? `${pendingText} ${line}` : line,
        sectionType: inferSectionType(line, subjectProfile),
        imageMarker:
          [...line.matchAll(/\[TABLE_IMAGE_\d+\]/g)].map(match => match[0])[0] || pendingImageMarker,
      }
      continue
    }

    const numberedMatch = line.match(/^(\d+(?:\.\d+)*)(?:[\).:])?\s+(.*)$/)
    const looksLikeUnnumberedEssay = isEssayPrompt(line) && !optionPattern.test(line)
    const looksLikeUnnumberedOpen =
      currentLines.length === 0 &&
      !numberedMatch &&
      !optionPattern.test(line) &&
      (isOpenQuestionPrompt(line) || (subjectProfile === 'mongolian_language' && currentSection !== 'multiple_choice'))

    if (numberedMatch) {
      const isSubquestion = isSubQuestionStart(line)
      const currentLooksLikeMapping = looksLikeLabelToDigitMapping(currentLines)

      if (isSubquestion || currentLooksLikeMapping || currentSection === 'short_answer') {
        if (!currentLines.length) {
          currentNumber = Number(numberedMatch[1].split('.')[0] || 0)
          currentLines = [pendingContext?.text ? `${pendingContext.text}\n${line}` : line]
        } else {
          currentLines.push(line)
        }
        continue
      }

      pushCurrent()
      currentNumber = Number(numberedMatch[1].split('.')[0] || 0)
      const body = numberedMatch[2]?.trim() ?? ''
      const merged = pendingContext?.text ? `${pendingContext.text}\n${body}` : body
      currentLines = merged ? [merged] : []
      continue
    }

    if (looksLikeUnnumberedEssay || looksLikeUnnumberedOpen) {
      pushCurrent()
      currentNumber = 0
      currentLines = [pendingContext?.text ? `${pendingContext.text}\n${line}` : line]
      if (looksLikeUnnumberedEssay && currentSection === 'generic') currentSection = 'essay'
      continue
    }

    if (!currentLines.length) {
      if (pendingContext?.text && (optionPattern.test(line) || answerLinePattern.test(line))) {
        currentLines = [pendingContext.text, line]
      }
      continue
    }

    const inlineOptionSegments = findOptionSegments(line)
    const treatAsEssayTopics =
      currentSection === 'essay' &&
      (subjectProfile === 'mongolian_language' || /сэдвээс\s*нэгийг\s*сонгон/i.test(currentLines.join(' ')))
    const treatAsDigitMapping = looksLikeLabelToDigitMapping([...currentLines, line])

    if (inlineOptionSegments && !answerLinePattern.test(line) && !treatAsEssayTopics && !treatAsDigitMapping) {
      currentLines.push(...inlineOptionSegments)
      continue
    }

    if ((optionPattern.test(line) && !treatAsDigitMapping) || answerLinePattern.test(line) || isBlankLabelLine(line)) {
      currentLines.push(line)
      continue
    }

    currentLines.push(line)
  }

  pushCurrent()
  return blocks
}

function parseSingleQuestionBlockLocally(
  rawBlock: string,
  subjectProfile: SubjectProfile,
  sectionType: SectionType = 'generic',
): ImportedQuestionPayload | null {
  const blockLines = rawBlock
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (!blockLines.length) return null

  const multipleChoiceOptionPattern = /^([A-H]|[А-Е])[\).:]\s+/i
  const answerLinePattern = /^(correct answer|answer|зөв хариулт|хариу)[:：]/i
  const treatAsEssayTopics =
    sectionType === 'essay' &&
    /(?:сэдвээс\s*нэгийг\s*сонгон|эсээ\s*бич|эх\s*зохион\s*найруул)/i.test(blockLines.join(' '))
  const treatAsDigitMapping = looksLikeLabelToDigitMapping(blockLines)

  const inlineExpandedLines = blockLines.flatMap(line => {
    if (isRealMultipleChoiceOptionLine(line) || isBlankLabelLine(line)) return [line]
    const inline = findOptionSegments(line)
    return inline && inline.length >= 2 && !treatAsEssayTopics && !treatAsDigitMapping ? inline : [line]
  })

  const optionLines =
    treatAsEssayTopics || treatAsDigitMapping
      ? []
      : inlineExpandedLines.filter(line => isRealMultipleChoiceOptionLine(line))

  const answerLine = inlineExpandedLines.find(line => answerLinePattern.test(line))
  const contentLines = inlineExpandedLines.filter(line => line !== answerLine)

  let type: QuestionType = 'short_answer'
  let options: string[] = []

  if (treatAsDigitMapping) {
    type = 'short_answer'
  } else if (optionLines.length >= 2 && sectionType !== 'essay') {
    type = 'multiple_choice'
    options = optionLines.map(line => line.replace(multipleChoiceOptionPattern, '').trim()).filter(Boolean)
  } else if (/үнэн\s*\/\s*худал|үнэн\s*эсвэл\s*худал|true\s*\/\s*false|true or false/i.test(rawBlock)) {
    type = 'true_false'
  } else if (sectionType === 'essay' || isEssayPrompt(rawBlock)) {
    type = 'essay'
  } else if (looksLikeCalculationOrFormula(rawBlock)) {
    type = 'short_answer'
  } else if (subjectProfile === 'mongolian_language' && (sectionType === 'reading' || sectionType === 'writing')) {
    type = isEssayPrompt(rawBlock) ? 'essay' : 'short_answer'
  }

  if (treatAsEssayTopics) {
    const expandedTopics = expandEssayTopicChoices(contentLines)
    if (expandedTopics && expandedTopics.length >= 2) {
      const rawQuestion = expandedTopics.join(' || ')
      const extracted = extractPointsFromQuestionText(rawQuestion)

      return {
        question: extracted.question,
        type: 'essay',
        options: [],
        correctAnswer: '',
        points: extracted.points ?? 10,
        timerMinutes: 20,
      }
    }
  }

  const questionLines = contentLines.filter(line => !(type === 'multiple_choice' && isRealMultipleChoiceOptionLine(line)))
  const rawQuestion = normalizeWhitespace(questionLines.join(' '))
  const extracted = extractPointsFromQuestionText(rawQuestion)

  const extractedAnswer = answerLine
    ? normalizeWhitespace(answerLine.replace(answerLinePattern, '').trim())
    : ''

  let question = extracted.question
  if (!question || isMetaLine(question)) return null

  if (treatAsDigitMapping) {
    const blankLabels = contentLines
      .filter(isBlankLabelLine)
      .map(line => line.trim().replace(/[\).:].*$/, ''))
      .filter(Boolean)

    const choicePool = extractChoicePool(contentLines)

    question = normalizeWhitespace(
      [
        question,
        blankLabels.length ? `Labels: ${blankLabels.join(', ')}.` : '',
        choicePool.length ? `Choice pool: ${choicePool.join(', ')}.` : '',
      ]
        .filter(Boolean)
        .join(' '),
    )
  }

  return {
    question,
    type,
    options,
    correctAnswer: extractedAnswer,
    points: extracted.points ?? 10,
    timerMinutes: type === 'essay' ? 20 : looksLikeCalculationOrFormula(rawBlock) ? 3 : 2,
  }
}

function extractQuestionsLocally(text: string, subjectProfile: SubjectProfile): ImportedQuestionPayload[] {
  return segmentQuestionBlocksLocally(text, subjectProfile).reduce<ImportedQuestionPayload[]>(
    (result, block) => {
      const parsed = parseSingleQuestionBlockLocally(block.rawBlock, subjectProfile, block.sectionType)
      if (!parsed) return result

      const sharedPrefix = normalizeWhitespace(block.sharedContext ?? '')
      const question = sharedPrefix ? normalizeWhitespace(`${sharedPrefix} ${parsed.question ?? ''}`) : parsed.question
      result.push({
        ...parsed,
        question,
        imageUrl: block.imageMarker || '',
      })

      return result
    },
    [],
  )
}

function looksLikeBadQuestion(q: ImportedQuestionPayload) {
  const text = normalizeWhitespace(q.question ?? '')
  if (!text) return true
  if (/^(батлав|санамж|заавар|instructions?|хувилбар|variant)/i.test(text)) return true
  if (q.type === 'multiple_choice' && (!Array.isArray(q.options) || q.options.length < 2)) return true
  return false
}

function normalizeImportedQuestions(items: ImportedQuestionPayload[]) {
  return items.reduce<ImportedQuestionPayload[]>((result, item) => {
    const normalizedQuestion = typeof item.question === 'string' ? normalizeWhitespace(item.question) : ''
    if (!normalizedQuestion) return result

    const extracted = extractPointsFromQuestionText(normalizedQuestion)
    const question = extracted.question
    if (!question) return result

    const type: QuestionType =
      item.type === 'multiple_choice' || item.type === 'true_false' || item.type === 'short_answer' || item.type === 'essay'
        ? item.type
        : Array.isArray(item.options) && item.options.filter(Boolean).length > 0
          ? 'multiple_choice'
          : 'short_answer'

    const options =
      type === 'multiple_choice'
        ? (Array.isArray(item.options) ? item.options : []).map(option => normalizeWhitespace(String(option))).filter(Boolean)
        : []

    let correctAnswer: string | string[] = ''
    if (Array.isArray(item.correctAnswer)) {
      correctAnswer = item.correctAnswer.map(answer => normalizeWhitespace(String(answer))).filter(Boolean)
    } else if (typeof item.correctAnswer === 'string') {
      correctAnswer = normalizeWhitespace(item.correctAnswer)
    }

    const normalizedItem: ImportedQuestionPayload = {
      question,
      type,
      options,
      correctAnswer,
      points: Math.max(1, Number(item.points) || extracted.points || 10),
      timerMinutes: Math.max(1, Number(item.timerMinutes) || (type === 'essay' ? 20 : 2)),
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    }

    if (!looksLikeBadQuestion(normalizedItem)) {
      result.push(normalizedItem)
    }

    return result
  }, [])
}

function dedupeQuestions(items: ImportedQuestionPayload[]) {
  const seen = new Set<string>()
  const result: ImportedQuestionPayload[] = []

  for (const item of items) {
    const key = normalizeWhitespace(item.question ?? '').toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

function isLikelyHeading(question: string, contextLabels: string[], hasStructuredContent: boolean) {
  const normalizedQuestion = normalizeWhitespace(question).toLowerCase()
  if (!normalizedQuestion) return true

  if (contextLabels.some(label => label && normalizedQuestion === label.toLowerCase())) {
    return true
  }

  if (/^(section|part|chapter|instructions?|answer key|variant|хэсэг|бүлэг|заавар|хувилбар|унших хэсэг|бичих хэсэг|эсээний хэсэг)\b/i.test(question)) {
    return true
  }

  if (isPageChromeLine(question)) {
    return true
  }

  if (hasStructuredContent) return false

  if (
    normalizedQuestion.length <= 120 &&
    !/[?？]|_{2,}|\.{3}|[:;]/.test(question) &&
    !/\b(choose|select|write|explain|solve|compare|define|answer|сонго|бич|тайлбар|бод|хариул|эсээ)\b/i.test(question)
  ) {
    return true
  }

  return false
}

function attachImportedAssets(
  items: ImportedQuestionPayload[],
  {
    title,
    courseLabel,
    tableImages,
  }: {
    title?: string
    courseLabel?: string
    tableImages?: Record<string, string>
  },
) {
  const contextLabels = [title, courseLabel].map(value => normalizeWhitespace(value ?? '')).filter(Boolean)

  return items.reduce<ImportedQuestionPayload[]>((result, item) => {
    const rawQuestion = typeof item.question === 'string' ? normalizeWhitespace(item.question) : ''
    if (!rawQuestion) return result

    const markers = [...rawQuestion.matchAll(/\[TABLE_IMAGE_\d+\]/g)].map(match => match[0])
    const question = normalizeWhitespace(rawQuestion.replace(/\[TABLE_IMAGE_\d+\]/g, ' '))
    const hasStructuredContent = markers.length > 0 || (Array.isArray(item.options) && item.options.length > 0)
    const imageMarker = markers.find(marker => tableImages?.[marker])

    if (!question || isLikelyHeading(question, contextLabels, hasStructuredContent)) {
      return result
    }

    const enriched: ImportedQuestionPayload = {
      ...item,
      question,
      imageUrl: item.imageUrl || (imageMarker ? tableImages?.[imageMarker] : ''),
    }

    if (!looksLikeBadQuestion(enriched)) {
      result.push(enriched)
    }

    return result
  }, [])
}

async function callAnthropicJsonArray<T>({
  apiKey,
  prompt,
  maxTokens = 3000,
}: {
  apiKey: string
  prompt: string
  maxTokens?: number
}) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = (await response.json()) as AnthropicResponse
  if (!response.ok) {
    throw new Error(data.error?.message || 'Anthropic request failed.')
  }

  const rawText = data.content?.find(item => item.type === 'text')?.text
  if (!rawText) {
    throw new Error('Anthropic returned no text.')
  }

  return extractJsonArray<T>(rawText)
}

async function callAnthropicJsonObject<T>({
  apiKey,
  prompt,
  maxTokens = 1200,
}: {
  apiKey: string
  prompt: string
  maxTokens?: number
}) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = (await response.json()) as AnthropicResponse
  if (!response.ok) {
    throw new Error(data.error?.message || 'Anthropic request failed.')
  }

  const rawText = data.content?.find(item => item.type === 'text')?.text
  if (!rawText) {
    throw new Error('Anthropic returned no text.')
  }

  return extractJsonObject<T>(rawText)
}

async function callAnthropicJsonArrayFromImages<T>({
  apiKey,
  prompt,
  images,
  maxTokens = 3500,
}: {
  apiKey: string
  prompt: string
  images: string[]
  maxTokens?: number
}) {
  const content = [
    { type: 'text', text: prompt },
    ...images.map(image => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: image,
      },
    })),
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content }],
    }),
  })

  const data = (await response.json()) as AnthropicResponse
  if (!response.ok) {
    throw new Error(data.error?.message || 'Anthropic image request failed.')
  }

  const rawText = data.content?.find(item => item.type === 'text')?.text
  if (!rawText) {
    throw new Error('Anthropic returned no text for PDF images.')
  }

  return extractJsonArray<T>(rawText)
}

async function extractQuestionsFromPdfScreenshots(params: {
  apiKey: string
  buffer: Buffer
  fileName: string
  title?: string
  courseLabel?: string
}) {
  const parser = new PDFParse({ data: params.buffer })

  try {
    const screenshots = await parser.getScreenshot({
      first: 6,
      imageDataUrl: false,
      imageBuffer: true,
      desiredWidth: 1400,
    })

    const images = screenshots.pages
      .map(page => {
        const bytes =
          page?.data instanceof Uint8Array
            ? page.data
            : page?.data
              ? new Uint8Array(Object.values(page.data as Record<string, number>))
              : null
        return bytes ? Buffer.from(bytes).toString('base64') : ''
      })
      .filter(Boolean)

    if (!images.length) {
      throw new Error('PDF page screenshots could not be generated.')
    }

    const prompt = [
      'You are extracting exam questions from PDF page images.',
      'Some PDFs are scanned and do not contain selectable text.',
      'Read the page screenshots carefully and return only real exam questions as a strict JSON array.',
      'Return only valid JSON. Do not return markdown, prose, headings, or code fences.',
      'Each item must contain exactly these keys:',
      '{ "question": string, "type": "multiple_choice" | "true_false" | "short_answer" | "essay", "options": string[], "correctAnswer": string | string[], "points": number, "timerMinutes": number }',
      '- Preserve original language exactly as written.',
      '- Treat Sanamj, instructions, approval headers, page labels, and repeated chrome as metadata, not questions.',
      '- If no answer key is visible, set correctAnswer to "".',
      '- Default points to 10 and timerMinutes to 2 if missing.',
      '- If an essay prompt appears, include it as a question with type "essay".',
      params.title ? `Exam title context: ${params.title}` : '',
      params.courseLabel ? `Course context: ${params.courseLabel}` : '',
      `File name: ${params.fileName}`,
    ]
      .filter(Boolean)
      .join('\n')

    const items = await callAnthropicJsonArrayFromImages<ImportedQuestionPayload>({
      apiKey: params.apiKey,
      prompt,
      images,
      maxTokens: 4000,
    })

    return normalizeImportedQuestions(items)
  } finally {
    await parser.destroy()
  }
}

async function extractQuestionsWithAnthropic(params: {
  apiKey: string
  fileName: string
  fileText: string
  title?: string
  courseLabel?: string
  subjectProfile: SubjectProfile
}) {
  const { apiKey, fileName, fileText, title, courseLabel, subjectProfile } = params

  try {
    const directItems = await callAnthropicJsonArray<ImportedQuestionPayload>({
      apiKey,
      prompt: buildQuestionExtractionPrompt({ fileName, fileText, title, courseLabel }),
      maxTokens: 3500,
    })
    return normalizeImportedQuestions(directItems)
  } catch {
    const blocks = await callAnthropicJsonArray<RawQuestionBlock>({
      apiKey,
      prompt: buildQuestionSegmentationPrompt(fileText),
      maxTokens: 3000,
    })

    const parsedItems: ImportedQuestionPayload[] = []
    for (const block of blocks) {
      if (!block?.rawBlock) continue
      try {
        const item = await callAnthropicJsonObject<ImportedQuestionPayload>({
          apiKey,
          prompt: buildSingleQuestionParsePrompt(block.rawBlock),
          maxTokens: 1200,
        })
        parsedItems.push(item)
      } catch {
        const localFallback = parseSingleQuestionBlockLocally(
          [block.sharedContext, block.rawBlock].filter(Boolean).join('\n'),
          subjectProfile,
          block.sectionType ?? 'generic',
        )
        if (localFallback) parsedItems.push(localFallback)
      }
    }

    return normalizeImportedQuestions(parsedItems)
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  try {
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    const file = fileEntry instanceof File ? fileEntry : null

    if (!file) {
      return NextResponse.json({ error: 'Файл сонгогдоогүй байна.' }, { status: 400 })
    }

    const fileName = typeof formData.get('fileName') === 'string' ? String(formData.get('fileName')) : file.name
    const fileType = typeof formData.get('fileType') === 'string' ? String(formData.get('fileType')) : file.type
    const title = typeof formData.get('title') === 'string' ? String(formData.get('title')).trim() : ''
    const courseLabel = typeof formData.get('courseLabel') === 'string' ? String(formData.get('courseLabel')).trim() : ''
    const extension = fileName.split('.').pop()?.toLowerCase() ?? ''

    let fileText = ''
    let tableImages: Record<string, string> = {}
    let directQuestions: ImportedQuestionPayload[] | null = null
    let directParser: 'anthropic' | 'local' | null = null

    try {
      if (extension === 'docx') {
        const extracted = await extractDocxContent(Buffer.from(await file.arrayBuffer()))
        fileText = extracted.text
        tableImages = extracted.tableImages
      } else if (extension === 'pdf') {
        const pdfBuffer = Buffer.from(await file.arrayBuffer())
        fileText = await extractPdfContent(pdfBuffer)

        if (apiKey && fileText.trim().length < 80) {
          try {
            directQuestions = await extractQuestionsFromPdfScreenshots({
              apiKey,
              buffer: pdfBuffer,
              fileName,
              title,
              courseLabel,
            })
            directParser = 'anthropic'
          } catch {
            // Fall back to text-based parsing below if screenshot OCR fails.
          }
        }
      } else {
        fileText = stripRepeatedPageChrome(normalizePreservingLines(await file.text()))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parser error.'
      return NextResponse.json(
        { error: `"${fileName}" файлыг боловсруулахад алдаа гарлаа: ${message}` },
        { status: 400 },
      )
    }

    if (!fileText && !directQuestions?.length) {
      return NextResponse.json({ error: `"${fileName}" файлаас текст уншиж чадсангүй.` }, { status: 400 })
    }

    const subjectProfile = detectSubjectProfile({ fileName, title, courseLabel, fileText })

    let questions: ImportedQuestionPayload[] = directQuestions ?? []
    let parser: 'anthropic' | 'local' = directParser ?? 'local'

    if (!directQuestions?.length && apiKey) {
      try {
        questions = await extractQuestionsWithAnthropic({
          apiKey,
          fileName,
          fileText,
          title,
          courseLabel,
          subjectProfile,
        })
        parser = 'anthropic'
      } catch {
        questions = normalizeImportedQuestions(extractQuestionsLocally(fileText, subjectProfile))
      }
    } else if (!directQuestions?.length) {
      questions = normalizeImportedQuestions(extractQuestionsLocally(fileText, subjectProfile))
    }

    questions = dedupeQuestions(
      attachImportedAssets(questions, {
        title,
        courseLabel,
        tableImages,
      }),
    )

    return NextResponse.json({
      questions,
      parser,
      fileType,
      subjectProfile,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while parsing the file.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
