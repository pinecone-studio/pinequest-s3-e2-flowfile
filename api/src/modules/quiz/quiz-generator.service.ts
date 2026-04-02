import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { QuizGeneratorRepository } from './quiz-generator.repository';
import { CreateQuizInput } from './dto/create-quiz.input';
import { GeneratedQuiz } from './dto/quiz-question.object';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class QuizGeneratorService {
  private anthropic: Anthropic;

  constructor(
    private readonly repo: QuizGeneratorRepository,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateQuiz(input: CreateQuizInput): Promise<GeneratedQuiz> {
    const { moduleName, className, subject, lessonContent, questionCount, questionType } = input;

    // 1. Call Claude API — Mongolian Cyrillic output
    const prompt = `
Дараах хичээлийн агуулгаас ${questionCount} ширхэг ${this.questionTypeLabel(questionType)} асуулт үүсгэнэ үү.

Модуль: ${moduleName}
Анги: ${className}
Хичээл: ${subject}
Агуулга: ${lessonContent}

Зөвхөн JSON массив буцаана уу. Тайлбар, markdown хэрэглэхгүй.
Формат:
[
  {
    "index": 0,
    "question": "Асуулт энд",
    "options": [
      { "label": "А", "text": "Хариулт А" },
      { "label": "Б", "text": "Хариулт Б" },
      { "label": "В", "text": "Хариулт В" },
      { "label": "Г", "text": "Хариулт Г" }
    ],
    "correctIndex": 1,
    "concept": "Энэ асуулт шалгаж буй ойлголт"
  }
]`;

    let rawText: string;
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system:
          'Та Монгол сургуулийн тест үүсгэгч систем. ' +
          'Монгол кирилл үсгээр хариулна уу. ' +
          'Зөвхөн JSON өгнө, бусад тайлбар өгөхгүй.',
        messages: [{ role: 'user', content: prompt }],
      });

      rawText = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
    } catch (err) {
      throw new InternalServerErrorException('Claude API алдаа: ' + err.message);
    }

    // 2. Parse JSON safely
    let questions: GeneratedQuiz['questions'];
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      throw new InternalServerErrorException('AI хариултыг задлах алдаа гарлаа');
    }

    // 3. Build quiz record
    const quizId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const appUrl = this.config.get<string>('APP_URL') ?? 'https://yourapp.com';

    await this.repo.saveQuiz({ quizId, moduleName, className, subject, expiresAt, questions });

    return {
      quizId,
      moduleName,
      className,
      subject,
      qrCodeUrl: `${appUrl}/quiz/${quizId}`,
      questions,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getQuizById(quizId: string) {
    return this.repo.findQuizById(quizId);
  }

  private questionTypeLabel(type: string): string {
    if (type === 'truefalse') return 'үнэн/худал';
    if (type === 'mixed') return 'холимог (сонголт болон үнэн/худал)';
    return 'олон сонголттой'; // mcq default
  }
}