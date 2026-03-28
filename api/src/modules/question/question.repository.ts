import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { questions } from 'src/database/schema';
import { NewQuestion, UpdateQuestion } from 'src/shared/types';

@Injectable()
export class QuestionRepository {
  async findQuestionsByExam(examId: string) {
    return db.query.questions.findMany({
      where: eq(questions.examId, examId),
      orderBy: asc(questions.orderIndex),
    });
  }
  async findQuestionById(id: string) {
    return db.query.questions.findFirst({ where: eq(questions.id, id) });
  }
  async createQuestion(data: NewQuestion) {
    const [question] = await db.insert(questions).values(data).returning();
    return question;
  }
  async updateQuestion(id: string, data: UpdateQuestion) {
    const [question] = await db
      .update(questions)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }
  async deleteQuestion(id: string) {
    await db.delete(questions).where(eq(questions.id, id));
  }
  async reorderQuestions(examId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        db
          .update(questions)
          .set({ orderIndex: index + 1 })
          .where(eq(questions.id, id)),
      ),
    );
  }
  async reorderOptions(id: string, orderedOptions: string[]) {
    const [question] = await db
      .update(questions)
      .set({
        optionsJson: JSON.stringify(orderedOptions),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }
}
