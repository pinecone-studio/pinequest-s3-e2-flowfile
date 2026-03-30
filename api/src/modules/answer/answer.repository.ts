import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { answers } from 'src/database/schema/sessions.schema';
import type { Answer, NewAnswer } from 'src/shared/types/answer.types';

@Injectable()
export class AnswerRepository {
  async findAnswersBySession(sessionId: string): Promise<Answer[]> {
    return db.query.answers.findMany({
      where: eq(answers.sessionId, sessionId),
      orderBy: desc(answers.lastSavedAt),
    });
  }

  async findAnswerByQuestion(
    sessionId: string,
    questionId: string,
  ): Promise<Answer | undefined> {
    return db.query.answers.findFirst({
      where: and(
        eq(answers.sessionId, sessionId),
        eq(answers.questionId, questionId),
      ),
    });
  }

  async upsertAnswer(data: NewAnswer) {
    const existingAnswer = await this.findAnswerByQuestion(
      data.sessionId,
      data.questionId,
    );

    if (existingAnswer) {
      const [answer] = await db
        .update(answers)
        .set({
          textAnswer: data.textAnswer ?? null,
          formulaAnswerJson: data.formulaAnswerJson ?? null,
          fileUrl: data.fileUrl ?? null,
          lastSavedAt: data.lastSavedAt ?? new Date().toISOString(),
          isFinal: data.isFinal ?? existingAnswer.isFinal,
        })
        .where(eq(answers.id, existingAnswer.id))
        .returning();

      return answer;
    }

    const [answer] = await db.insert(answers).values(data).returning();
    return answer;
  }

  async finalizeAnswers(sessionId: string) {
    await db
      .update(answers)
      .set({
        isFinal: true,
        lastSavedAt: new Date().toISOString(),
      })
      .where(eq(answers.sessionId, sessionId));

    return this.findAnswersBySession(sessionId);
  }
}
