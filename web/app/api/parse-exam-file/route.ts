import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { config } from '@/lib/config'
import { extractQuestionsLocally, extractJsonArray, buildAnthropicPrompt, type AnthropicResponse } from './parseUtils'

export async function POST(request: Request) {
  const apiKey = config.anthropicApiKey

  try {
    const body = await request.json()
    let fileText = typeof body.fileText === 'string' ? body.fileText.trim() : ''
    const fileBuffer = typeof body.fileBuffer === 'string' ? body.fileBuffer : ''
    const fileName = typeof body.fileName === 'string' ? body.fileName : 'uploaded file'
    const fileType = typeof body.fileType === 'string' ? body.fileType : ''
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const courseLabel = typeof body.courseLabel === 'string' ? body.courseLabel.trim() : ''
    const extension = fileName.split('.').pop()?.toLowerCase() ?? ''

    if (extension === 'docx') {
      if (!fileBuffer) return NextResponse.json({ error: 'DOCX file data is missing.' }, { status: 400 })
      const buffer = Buffer.from(fileBuffer, 'base64')
      const extracted = await mammoth.extractRawText({ buffer })
      fileText = extracted.value.trim()
    } else if (extension === 'pdf') {
      if (!fileBuffer) return NextResponse.json({ error: 'PDF file data is missing.' }, { status: 400 })
      const buffer = Buffer.from(fileBuffer, 'base64')
      const parser = new PDFParse({ data: buffer })
      const extracted = await parser.getText()
      fileText = extracted.text.trim()
      await parser.destroy()
    }

    if (!fileText) {
      return NextResponse.json({ error: `"${fileName}" файлаас текст уншиж чадсангүй.` }, { status: 400 })
    }

    if (!apiKey) {
      const questions = extractQuestionsLocally(fileText)
      return NextResponse.json({ questions, parser: 'local', fileType })
    }

    const prompt = buildAnthropicPrompt(fileText, fileName, title, courseLabel)

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await anthropicResponse.json() as AnthropicResponse

    if (!anthropicResponse.ok) {
      return NextResponse.json({ error: data.error?.message || 'Anthropic request failed.' }, { status: anthropicResponse.status })
    }

    const rawText = data.content?.find(item => item.type === 'text')?.text

    if (!rawText) {
      const questions = extractQuestionsLocally(fileText)
      return NextResponse.json({ questions, parser: 'local', fileType })
    }

    const questions = extractJsonArray(rawText)
    return NextResponse.json({ questions, parser: 'anthropic', fileType })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while parsing the file.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
