import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { NewQuestion, UpdateQuestion } from 'src/shared/types';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepo: QuestionRepository) {}
  async getQuestionsByExam(examId: string) {
    return this.questionRepo.findQuestionsByExam(examId);
  }
  async getQuestionById(id: string) {
    const question = await this.questionRepo.findQuestionById(id);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }
  async createQuestion(data: NewQuestion) {
    return this.questionRepo.createQuestion(data);
  }
  async updateQuestion(id: string, data: UpdateQuestion) {
    await this.getQuestionById(id);
    return this.questionRepo.updateQuestion(id, data);
  }
  async deleteQuestion(id: string) {
    await this.getQuestionById(id);
    return this.questionRepo.deleteQuestion(id);
  }
  async reorderQuestions(examId: string, orderedIds: string[]) {
    return this.questionRepo.reorderQuestions(examId, orderedIds);
  }
  async reorderOptions(id: string, orderedOptions: string[]) {
    await this.getQuestionById(id);
    return this.questionRepo.reorderOptions(id, orderedOptions);
  }
}
