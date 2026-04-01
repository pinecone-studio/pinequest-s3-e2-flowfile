export function buildQuestionExtractionPrompt({
  fileName,
  fileText,
  title,
  courseLabel,
}: {
  fileName: string;
  fileText: string;
  title?: string;
  courseLabel?: string;
}) {
  return [
    'You extract exam questions from educational documents.',
    'Read the full document and convert only real exam questions into a strict JSON array.',
    'Return only valid JSON. Do not return markdown, prose, headings, or code fences.',
    'Each item must contain exactly these keys:',
    '{ "question": string, "type": "multiple_choice" | "true_false" | "short_answer" | "essay", "options": string[], "correctAnswer": string | string[], "points": number, "timerMinutes": number }',
    '- Some exams begin with reading or essay prompts before numbered questions. Extract those too.',
    '- Some exams end with essay writing prompts. Extract those too.',
    '- Treat Sanamj, approval headers, variant labels, page numbers, and repeated headers as metadata, not questions.',
    '- Keep references to shared table, graph, passage, formula, or image markers inside the related question text.',
    '- Preserve original language.',
    '- If no answer key is present, set correctAnswer to "".',
    '- Default points to 10 and timerMinutes to 2 if missing.',
    title ? `Exam title context: ${title}` : '',
    courseLabel ? `Course context: ${courseLabel}` : '',
    `File name: ${fileName}`,
    'Document content begins below:',
    fileText,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildQuestionSegmentationPrompt(fileText: string) {
  return [
    'Identify every real exam question block in the document.',
    'Return only valid JSON.',
    'Return a JSON array of objects with exactly these keys:',
    '{ "questionNumber": number, "rawBlock": string, "sectionType": string }',
    '- Ignore metadata such as Sanamj, approval text, repeated headings, variant labels, and page numbers.',
    '- Keep shared passage, table, graph, formula, or context with the related question block.',
    'Document:',
    fileText,
  ].join('\n');
}

export function buildSingleQuestionParsePrompt(rawBlock: string) {
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
  ].join('\n');
}
