import { BadRequestException, Injectable } from '@nestjs/common';
import { ParseExamDto } from './dto/parse-exam.dto';
import { ParseExamPictureDto } from '../parse-exam-picture/dto/parse-exam-picture.dto';
import {
  buildQuestionExtractionPrompt,
  buildQuestionSegmentationPrompt,
  buildSingleQuestionParsePrompt,
} from './prompts/parse-exam.prompts';
import { extractDocxContent } from './extractors/parse-exam-docx.extractor';
import { extractPdfContent } from './extractors/parse-exam-pdf.extractor';
import {
  AnthropicResponse,
  ImportedQuestionPayload,
  ParseExamResult,
  PendingSharedContext,
  QuestionType,
  RawQuestionBlock,
  SectionType,
  SubjectProfile,
} from '../../shared/types/parse-exam.types';
import {
  detectSubjectProfile,
  expandEssayTopicChoices,
  extractChoicePool,
  extractPointsFromQuestionText,
  findOptionSegments,
  inferSectionType,
  isBlankLabelLine,
  isEssayPrompt,
  isLikelyHeading,
  isMetaLine,
  isOpenQuestionPrompt,
  isRealMultipleChoiceOptionLine,
  isSectionHeading,
  isSharedContextLine,
  isSubQuestionStart,
  looksLikeBadQuestion,
  looksLikeCalculationOrFormula,
  looksLikeLabelToDigitMapping,
} from '../../shared/utils/parse-exam-question.util';
import {
  isPageChromeLine,
  normalizePreservingLines,
  normalizeWhitespace,
} from '../../shared/utils/parse-exam-text.util';

@Injectable()
export class ParseExamRepository {
  async parseExam(dto: ParseExamDto): Promise<ParseExamResult> {
    let fileText = typeof dto.fileText === 'string' ? dto.fileText.trim() : '';
    const fileBuffer = typeof dto.fileBuffer === 'string' ? dto.fileBuffer : '';
    const fileName = dto.fileName || 'uploaded file';
    const fileType = dto.fileType || '';
    const title = dto.title || '';
    const courseLabel = dto.courseLabel || '';
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    let tableImages: Record<string, string> = {};

    try {
      if (extension === 'docx') {
        if (!fileBuffer)
          throw new BadRequestException('DOCX file data is missing.');
        const extracted = await extractDocxContent(
          Buffer.from(fileBuffer, 'base64'),
        );
        fileText = extracted.text;
        tableImages = extracted.tableImages;
      } else if (extension === 'pdf') {
        if (!fileBuffer)
          throw new BadRequestException('PDF file data is missing.');
        fileText = await extractPdfContent(Buffer.from(fileBuffer, 'base64'));
      } else {
        fileText = normalizePreservingLines(fileText);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown parser error.';
      throw new BadRequestException(
        `"${fileName}" файлыг боловсруулахад алдаа гарлаа: ${message}`,
      );
    }

    if (!fileText)
      throw new BadRequestException(
        `"${fileName}" файлаас текст уншиж чадсангүй.`,
      );

    const subjectProfile = detectSubjectProfile({
      fileName,
      title,
      courseLabel,
      fileText,
    });
    const parsed = await this.runParsing({
      fileName,
      fileText,
      title,
      courseLabel,
      subjectProfile,
    });

    return {
      questions: this.dedupeQuestions(
        this.attachImportedAssets(parsed.questions, {
          title,
          courseLabel,
          tableImages,
        }),
      ),
      parser: parsed.parser,
      fileType,
      subjectProfile,
    };
  }

  async parseExamPicture(dto: ParseExamPictureDto): Promise<ParseExamResult> {
    const fileText = normalizePreservingLines(
      dto.ocrText || dto.fileText || '',
    );
    const fileName = dto.fileName || 'picture exam';
    const title = dto.title || '';
    const courseLabel = dto.courseLabel || '';
    if (!fileText)
      throw new BadRequestException(
        'Picture parser requires ocrText or fileText.',
      );

    const subjectProfile = detectSubjectProfile({
      fileName,
      title,
      courseLabel,
      fileText,
    });
    const parsed = await this.runParsing({
      fileName,
      fileText,
      title,
      courseLabel,
      subjectProfile,
    });
    const withImage = dto.imageUrl
      ? parsed.questions.map((q) => ({
          ...q,
          imageUrl: q.imageUrl || dto.imageUrl,
        }))
      : parsed.questions;

    return {
      questions: this.dedupeQuestions(
        this.attachImportedAssets(withImage, {
          title,
          courseLabel,
          tableImages: {},
        }),
      ),
      parser: parsed.parser,
      fileType: 'image',
      subjectProfile,
    };
  }

  private async runParsing(params: {
    fileName: string;
    fileText: string;
    title?: string;
    courseLabel?: string;
    subjectProfile: SubjectProfile;
  }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return {
        questions: this.normalizeImportedQuestions(
          this.extractQuestionsLocally(params.fileText, params.subjectProfile),
        ),
        parser: 'local' as const,
      };

    try {
      const questions = await this.extractQuestionsWithAnthropic({
        ...params,
        apiKey,
      });
      return { questions, parser: 'anthropic' as const };
    } catch {
      return {
        questions: this.normalizeImportedQuestions(
          this.extractQuestionsLocally(params.fileText, params.subjectProfile),
        ),
        parser: 'local' as const,
      };
    }
  }

  private extractJsonArray<T>(raw: string) {
    const fenced = raw.replace(/```json|```/gi, '').trim();
    const start = fenced.indexOf('[');
    const end = fenced.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start)
      throw new Error('Model did not return a JSON array.');
    return JSON.parse(fenced.slice(start, end + 1)) as T[];
  }

  private extractJsonObject<T>(raw: string) {
    const fenced = raw.replace(/```json|```/gi, '').trim();
    const start = fenced.indexOf('{');
    const end = fenced.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start)
      throw new Error('Model did not return a JSON object.');
    return JSON.parse(fenced.slice(start, end + 1)) as T;
  }

  private async callAnthropicJsonArray<T>(
    apiKey: string,
    prompt: string,
    maxTokens = 3000,
  ) {
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
    });
    const data = (await response.json()) as AnthropicResponse;
    if (!response.ok)
      throw new Error(data.error?.message || 'Anthropic request failed.');
    const rawText = data.content?.find((item) => item.type === 'text')?.text;
    if (!rawText) throw new Error('Anthropic returned no text.');
    return this.extractJsonArray<T>(rawText);
  }

  private async callAnthropicJsonObject<T>(
    apiKey: string,
    prompt: string,
    maxTokens = 1200,
  ) {
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
    });
    const data = (await response.json()) as AnthropicResponse;
    if (!response.ok)
      throw new Error(data.error?.message || 'Anthropic request failed.');
    const rawText = data.content?.find((item) => item.type === 'text')?.text;
    if (!rawText) throw new Error('Anthropic returned no text.');
    return this.extractJsonObject<T>(rawText);
  }

  private async extractQuestionsWithAnthropic(params: {
    apiKey: string;
    fileName: string;
    fileText: string;
    title?: string;
    courseLabel?: string;
    subjectProfile: SubjectProfile;
  }) {
    try {
      const items = await this.callAnthropicJsonArray<ImportedQuestionPayload>(
        params.apiKey,
        buildQuestionExtractionPrompt(params),
        3500,
      );
      return this.normalizeImportedQuestions(items);
    } catch {
      const blocks = await this.callAnthropicJsonArray<RawQuestionBlock>(
        params.apiKey,
        buildQuestionSegmentationPrompt(params.fileText),
        3000,
      );
      const parsedItems: ImportedQuestionPayload[] = [];
      for (const block of blocks) {
        if (!block?.rawBlock) continue;
        try {
          parsedItems.push(
            await this.callAnthropicJsonObject<ImportedQuestionPayload>(
              params.apiKey,
              buildSingleQuestionParsePrompt(block.rawBlock),
              1200,
            ),
          );
        } catch {
          const localFallback = this.parseSingleQuestionBlockLocally(
            block.rawBlock,
            params.subjectProfile,
            block.sectionType,
          );
          if (localFallback) parsedItems.push(localFallback);
        }
      }
      return this.normalizeImportedQuestions(parsedItems);
    }
  }

  private segmentQuestionBlocksLocally(
    text: string,
    subjectProfile: SubjectProfile,
  ): RawQuestionBlock[] {
    const allLines = normalizePreservingLines(text)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const numberedPromptPattern = /^(\d+(?:\.\d+)*)(?:[).:])?\s+\S/;
    const optionPattern = /^([A-H]|[А-Е]|[a-h]|[а-е])[).:]\s+/;
    const answerLinePattern =
      /^(correct answer|answer|зөв хариулт|хариу)[:：]/i;
    const blocks: RawQuestionBlock[] = [];
    let currentNumber = 0;
    let currentLines: string[] = [];
    let currentSection: SectionType = 'generic';
    let pendingContext: PendingSharedContext | null = null;
    let looseCounter = 1000;
    const pushCurrent = () => {
      if (!currentLines.length) return;
      const rawBlock = currentLines.join('\n').trim();
      if (!rawBlock) return;
      blocks.push({
        questionNumber: currentNumber > 0 ? currentNumber : looseCounter++,
        rawBlock,
        sectionType: currentSection,
        sharedContext: pendingContext?.text,
        imageMarker: pendingContext?.imageMarker,
      });
      currentLines = [];
      pendingContext = null;
    };

    for (const line of allLines) {
      if (!line || isPageChromeLine(line)) continue;
      if (isMetaLine(line)) {
        if (isSharedContextLine(line))
          pendingContext = { text: line, sectionType: 'table_context' };
        continue;
      }
      if (isSectionHeading(line)) {
        currentSection = inferSectionType(line, subjectProfile);
        continue;
      }
      if (
        isSharedContextLine(line) &&
        !numberedPromptPattern.test(line) &&
        !isEssayPrompt(line)
      ) {
        pendingContext = {
          text: pendingContext?.text ? `${pendingContext.text} ${line}` : line,
          sectionType: inferSectionType(line, subjectProfile),
        };
        continue;
      }

      const numberedMatch = line.match(/^(\d+(?:\.\d+)*)(?:[).:])?\s+(.*)$/);
      const looksLikeUnnumberedEssay =
        isEssayPrompt(line) && !optionPattern.test(line);
      const looksLikeUnnumberedOpen =
        currentLines.length === 0 &&
        !numberedMatch &&
        !optionPattern.test(line) &&
        (isOpenQuestionPrompt(line) ||
          (subjectProfile === 'mongolian_language' &&
            currentSection !== 'multiple_choice'));

      if (numberedMatch) {
        if (
          isSubQuestionStart(line) ||
          looksLikeLabelToDigitMapping(currentLines) ||
          currentSection === 'short_answer'
        ) {
          if (currentLines.length) {
            currentLines.push(line);
          } else {
            currentLines = [
              pendingContext?.text ? `${pendingContext.text}\n${line}` : line,
            ];
          }
          continue;
        }
        pushCurrent();
        currentNumber = Number(numberedMatch[1].split('.')[0] || 0);
        currentLines = [
          pendingContext?.text
            ? `${pendingContext.text}\n${numberedMatch[2].trim()}`
            : numberedMatch[2].trim(),
        ];
        continue;
      }

      if (looksLikeUnnumberedEssay || looksLikeUnnumberedOpen) {
        pushCurrent();
        currentNumber = 0;
        currentLines = [
          pendingContext?.text ? `${pendingContext.text}\n${line}` : line,
        ];
        if (looksLikeUnnumberedEssay && currentSection === 'generic')
          currentSection = 'essay';
        continue;
      }
      if (!currentLines.length) continue;

      const treatAsEssayTopics =
        currentSection === 'essay' &&
        (subjectProfile === 'mongolian_language' ||
          /сэдвээс\s*нэгийг\s*сонгон/i.test(currentLines.join(' ')));
      const treatAsDigitMapping = looksLikeLabelToDigitMapping([
        ...currentLines,
        line,
      ]);
      const inlineOptionSegments = findOptionSegments(line);
      if (
        inlineOptionSegments &&
        !answerLinePattern.test(line) &&
        !treatAsEssayTopics &&
        !treatAsDigitMapping
      ) {
        currentLines.push(...inlineOptionSegments);
        continue;
      }
      currentLines.push(line);
    }
    pushCurrent();
    return blocks;
  }

  private parseSingleQuestionBlockLocally(
    rawBlock: string,
    subjectProfile: SubjectProfile,
    sectionType: SectionType = 'generic',
  ): ImportedQuestionPayload | null {
    const blockLines = rawBlock
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!blockLines.length) return null;
    const answerLinePattern =
      /^(correct answer|answer|зөв хариулт|хариу)[:：]/i;
    const treatAsEssayTopics =
      sectionType === 'essay' &&
      /(?:сэдвээс\s*нэгийг\s*сонгон|эсээ\s*бич|эх\s*зохион\s*найруул)/i.test(
        blockLines.join(' '),
      );
    const treatAsDigitMapping = looksLikeLabelToDigitMapping(blockLines);
    const inlineExpandedLines = blockLines.flatMap((line) =>
      isRealMultipleChoiceOptionLine(line) || isBlankLabelLine(line)
        ? [line]
        : (findOptionSegments(line) ?? [line]),
    );
    const optionLines =
      treatAsEssayTopics || treatAsDigitMapping
        ? []
        : inlineExpandedLines.filter(isRealMultipleChoiceOptionLine);
    const answerLine = inlineExpandedLines.find((line) =>
      answerLinePattern.test(line),
    );
    const contentLines = inlineExpandedLines.filter(
      (line) => line !== answerLine,
    );

    let type: QuestionType = 'short_answer';
    let options: string[] = [];
    if (treatAsDigitMapping) type = 'short_answer';
    else if (optionLines.length >= 2 && sectionType !== 'essay') {
      type = 'multiple_choice';
      options = optionLines
        .map((line) => line.replace(/^([A-H]|[А-Е])[).:]\s+/i, '').trim())
        .filter(Boolean);
    } else if (/үнэн\s*\/\s*худал|true\s*\/\s*false/i.test(rawBlock))
      type = 'true_false';
    else if (sectionType === 'essay' || isEssayPrompt(rawBlock)) type = 'essay';
    else if (looksLikeCalculationOrFormula(rawBlock)) type = 'short_answer';
    else if (
      subjectProfile === 'mongolian_language' &&
      (sectionType === 'reading' || sectionType === 'writing')
    )
      type = isEssayPrompt(rawBlock) ? 'essay' : 'short_answer';

    if (treatAsEssayTopics) {
      const expandedTopics = expandEssayTopicChoices(contentLines);
      if (expandedTopics?.length) {
        const extracted = extractPointsFromQuestionText(
          expandedTopics.join(' || '),
        );
        return {
          question: extracted.question,
          type: 'essay',
          options: [],
          correctAnswer: '',
          points: extracted.points ?? 10,
          timerMinutes: 20,
        };
      }
    }

    const extracted = extractPointsFromQuestionText(
      normalizeWhitespace(
        contentLines
          .filter(
            (line) =>
              !(
                type === 'multiple_choice' &&
                isRealMultipleChoiceOptionLine(line)
              ),
          )
          .join(' '),
      ),
    );
    let question = extracted.question;
    if (!question || isMetaLine(question)) return null;
    if (treatAsDigitMapping) {
      const blankLabels = contentLines
        .filter(isBlankLabelLine)
        .map((line) => line.trim().replace(/[).:].*$/, ''))
        .filter(Boolean);
      const choicePool = extractChoicePool(contentLines);
      question = normalizeWhitespace(
        [
          question,
          blankLabels.length ? `Labels: ${blankLabels.join(', ')}.` : '',
          choicePool.length ? `Choice pool: ${choicePool.join(', ')}.` : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
    }
    return {
      question,
      type,
      options,
      correctAnswer: answerLine
        ? normalizeWhitespace(answerLine.replace(answerLinePattern, '').trim())
        : '',
      points: extracted.points ?? 10,
      timerMinutes:
        type === 'essay' ? 20 : looksLikeCalculationOrFormula(rawBlock) ? 3 : 2,
    };
  }

  private extractQuestionsLocally(
    text: string,
    subjectProfile: SubjectProfile,
  ): ImportedQuestionPayload[] {
    return this.segmentQuestionBlocksLocally(text, subjectProfile)
      .map<ImportedQuestionPayload | null>((block) => {
        const parsed = this.parseSingleQuestionBlockLocally(
          block.rawBlock,
          subjectProfile,
          block.sectionType,
        );
        if (!parsed) return null;
        return {
          ...parsed,
          question: block.sharedContext
            ? normalizeWhitespace(
                `${block.sharedContext} ${parsed.question ?? ''}`,
              )
            : parsed.question,
          imageUrl: block.imageMarker || '',
        };
      })
      .filter((item): item is ImportedQuestionPayload => item !== null);
  }

  private normalizeImportedQuestions(items: ImportedQuestionPayload[]) {
    return items.reduce<ImportedQuestionPayload[]>((result, item) => {
      const normalizedQuestion =
        typeof item.question === 'string'
          ? normalizeWhitespace(item.question)
          : '';
      if (!normalizedQuestion) return result;
      const extracted = extractPointsFromQuestionText(normalizedQuestion);
      const type: QuestionType =
        item.type === 'multiple_choice' ||
        item.type === 'true_false' ||
        item.type === 'short_answer' ||
        item.type === 'essay'
          ? item.type
          : Array.isArray(item.options) && item.options.length
            ? 'multiple_choice'
            : 'short_answer';
      const normalizedItem: ImportedQuestionPayload = {
        question: extracted.question,
        type,
        options:
          type === 'multiple_choice'
            ? (Array.isArray(item.options) ? item.options : [])
                .map((v) => normalizeWhitespace(String(v)))
                .filter(Boolean)
            : [],
        correctAnswer: Array.isArray(item.correctAnswer)
          ? item.correctAnswer
              .map((v) => normalizeWhitespace(String(v)))
              .filter(Boolean)
          : normalizeWhitespace(String(item.correctAnswer ?? '')),
        points: Math.max(1, Number(item.points) || extracted.points || 10),
        timerMinutes: Math.max(
          1,
          Number(item.timerMinutes) || (type === 'essay' ? 20 : 2),
        ),
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
      };
      if (!looksLikeBadQuestion(normalizedItem)) result.push(normalizedItem);
      return result;
    }, []);
  }

  private attachImportedAssets(
    items: ImportedQuestionPayload[],
    params: {
      title?: string;
      courseLabel?: string;
      tableImages?: Record<string, string>;
    },
  ) {
    const contextLabels = [params.title, params.courseLabel]
      .map((value) => normalizeWhitespace(value ?? ''))
      .filter(Boolean);
    return items.reduce<ImportedQuestionPayload[]>((result, item) => {
      const rawQuestion = normalizeWhitespace(item.question ?? '');
      if (!rawQuestion) return result;
      const markers = [...rawQuestion.matchAll(/\[TABLE_IMAGE_\d+\]/g)].map(
        (match) => match[0],
      );
      const question = normalizeWhitespace(
        rawQuestion.replace(/\[TABLE_IMAGE_\d+\]/g, ' '),
      );
      const imageMarker = markers.find(
        (marker) => params.tableImages?.[marker],
      );
      if (
        !question ||
        isLikelyHeading(
          question,
          contextLabels,
          markers.length > 0 || (item.options?.length ?? 0) > 0,
        )
      )
        return result;
      const enriched = {
        ...item,
        question,
        imageUrl: imageMarker
          ? params.tableImages?.[imageMarker]
          : item.imageUrl || '',
      };
      if (!looksLikeBadQuestion(enriched)) result.push(enriched);
      return result;
    }, []);
  }

  private dedupeQuestions(items: ImportedQuestionPayload[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = normalizeWhitespace(item.question ?? '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
