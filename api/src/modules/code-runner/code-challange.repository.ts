import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { codeChallenges } from 'src/database/schema/code-challanges.schema';
import type {
  CodeChallenge,
  NewCodeChallenge,
} from 'src/shared/types/code-runner.types';

@Injectable()
export class CodeChallengeRepository {
  async saveMany(challenges: NewCodeChallenge[]) {
    if (challenges.length === 0) {
      return;
    }

    await db.transaction(async (tx) => {
      for (const challenge of challenges) {
        const now = new Date();

        await tx
          .insert(codeChallenges)
          .values({
            id: challenge.id,
            questionId: challenge.questionId,
            functionName: challenge.functionName,
            hiddenTestCases: challenge.hiddenTestCases,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: codeChallenges.id,
            set: {
              questionId: challenge.questionId,
              functionName: challenge.functionName,
              hiddenTestCases: challenge.hiddenTestCases,
              updatedAt: now,
            },
          });
      }
    });
  }

  async findById(id: string): Promise<CodeChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(codeChallenges)
      .where(eq(codeChallenges.id, id))
      .limit(1);

    return challenge;
  }
}
