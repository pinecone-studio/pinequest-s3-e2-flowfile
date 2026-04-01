export type ImportedQuestionPayload = {
  question?: string
  type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  points?: number
  timerMinutes?: number
}

export type AnthropicResponse = {
  content?: Array<{ type?: string; text?: string }>
  error?: { message?: string }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, '').replace(/\t/g, ' ').replace(/\u00a0/g, ' ').replace(/[ ]{2,}/g, ' ').trim()
}

export function extractQuestionsLocally(text: string): ImportedQuestionPayload[] {
  const normalized = normalizeWhitespace(text)
  if (!normalized) return []
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean)
  const blocks: string[] = []
  let current = ''
  const questionStart = /^(\d+[\).:]|[A-ZА-ЯӨҮЁ]\.|[IVXLC]+\.)\s+/i
  for (const line of lines) {
    if (questionStart.test(line) && current.trim()) { blocks.push(current.trim()); current = line; continue }
    if (!current) { current = line } else { current += `\n${line}` }
  }
  if (current.trim()) blocks.push(current.trim())
  const sourceBlocks = blocks.length > 1 ? blocks : normalized.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
  const optionPattern = /^([A-H]|[А-Е])[\).:]\s+/i
  return sourceBlocks.map((block) => {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean)
    const cleanLines = blockLines.map(l => l.replace(/^(\d+[\).:]|[A-ZА-ЯӨҮЁ]\.|[IVXLC]+\.)\s+/i, '').trim())
    const optionLines = cleanLines.filter(l => optionPattern.test(l))
    const answerLine = cleanLines.find(l => /^(correct answer|answer|зөв хариулт|хариу)[:：]/i.test(l))
    const withoutAnswer = cleanLines.filter(l => l !== answerLine)
    let type: ImportedQuestionPayload['type'] = 'short_answer'
    let options: string[] = []
    if (optionLines.length >= 2) { type = 'multiple_choice'; options = optionLines.map(l => l.replace(optionPattern, '').trim()).filter(Boolean) }
    else if (/үнэн\s*\/\s*худал|үнэн эсвэл худал|true\s*\/\s*false|true or false/i.test(block)) { type = 'true_false' }
    else if (block.length > 280) { type = 'essay' }
    const questionLines = withoutAnswer.filter(l => !(type === 'multiple_choice' && optionPattern.test(l)))
    const question = questionLines.join(' ').trim()
    const extractedAnswer = answerLine
      ? answerLine.replace(/^(correct answer|answer|зөв хариулт|хариу)[:：]/i, '').trim()
      : type === 'true_false' ? (/үнэн/i.test(block) && !/худал/i.test(block) ? 'true' : '') : ''
    return { question, type, options, correctAnswer: extractedAnswer, points: 10, timerMinutes: 2 }
  }).filter(item => item.question)
}

export function extractJsonArray(raw: string): ImportedQuestionPayload[] {
  const fenced = raw.replace(/```json|```/gi, '').trim()
  const start = fenced.indexOf('['); const end = fenced.lastIndexOf(']')
  if (start === -1 || end === -1 || end < start) throw new Error('Claude did not return a JSON array.')
  return JSON.parse(fenced.slice(start, end + 1)) as ImportedQuestionPayload[]
}

export function buildAnthropicPrompt(fileText: string, fileName: string, title: string, courseLabel: string): string {
  return [
    'Extract all exam questions from the uploaded document.',
    'Return ONLY a JSON array with no prose, markdown, or code fences.',
    'Each item must use this exact schema:',
    '{ "question": string, "type": "multiple_choice" | "true_false" | "short_answer" | "essay", "options": string[], "correctAnswer": string | string[], "points": number, "timerMinutes": number }',
    'Rules:',
    '- Use "multiple_choice" when answer choices are present.',
    '- Use "true_false" only for true/false statements.',
    '- Use "short_answer" for brief written answers.',
    '- Use "essay" for longer manual-response prompts.',
    '- Include "options" only when the question is multiple choice; otherwise use an empty array.',
    '- If points are missing, default to 10.',
    '- If timerMinutes are missing, default to 2.',
    '- Preserve the original language of the questions.',
    title ? `Exam title context: ${title}` : '',
    courseLabel ? `Course context: ${courseLabel}` : '',
    `File name: ${fileName}`,
    'Document:',
    fileText,
  ].filter(Boolean).join('\n')
}
