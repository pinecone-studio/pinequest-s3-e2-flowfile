import { Injectable } from '@nestjs/common';
import { db } from 'src/database/client';
import { eq } from 'drizzle-orm';
import { quizQuestions, quizzes } from 'src/database/schema/quiz.schema';

@Injectable()
export class QuizGeneratorRepository {
  async saveQuiz(data: {
    quizId: string;
    moduleName: string;
    className: string;
    subject: string;
    expiresAt: Date;
    questions: {
      index: number;
      question: string;
      options: { label: string; text: string }[];
      correctIndex: number;
      concept: string;
    }[];
  }) {
    await db.insert(quizzes).values({
      id: data.quizId,
      moduleName: data.moduleName,
      className: data.className,
      subject: data.subject,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });

    for (const q of data.questions) {
      await db.insert(quizQuestions).values({
        quizId: data.quizId,
        index: q.index,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        concept: q.concept,
      });
    }

    return data.quizId;
  }

  async findQuizById(quizId: string) {
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.index);

    return { ...quiz[0], questions };
  }
}
