import type { ChangeEvent } from 'react'
import type { Question, QuestionType } from '@/lib/types'
import { QuestionTabNew } from './QuestionTabNew'

export function StepQuestions({
  questionText, questionType, questionOptions, correctAnswer, questionPoints,
  matchingPairs, onQuestionText, onQuestionType, onQuestionOptions, onCorrectAnswer,
  onQuestionPoints, onMatchingPairs, onAddQuestion,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questionTab, bankSearchQuery, selectedBankQuestions, filteredBankQuestions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aiTopic, aiDifficulty, aiCount, aiGenerating, aiGeneratedQuestions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  importingFile, importFileName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onQuestionTab, onBankSearchQuery, onSelectedBankQuestions, onAddFromBank,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAiTopic, onAiDifficulty, onAiCount, onAiGenerate, onAddAiQuestions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFileUpload, onFolderUpload, onDemo,
}: {
  questionTab: 'new'|'bank'|'ai'|'file'; questionText: string; questionType: QuestionType
  questionOptions: string[]; correctAnswer: string | string[]; questionPoints: number
  matchingPairs: { left: string; right: string }[]
  bankSearchQuery: string; selectedBankQuestions: string[]; filteredBankQuestions: Question[]
  aiTopic: string; aiDifficulty: 'easy'|'medium'|'hard'; aiCount: number; aiGenerating: boolean; aiGeneratedQuestions: Question[]
  importingFile: boolean; importFileName: string
  onQuestionTab: (tab: 'new'|'bank'|'ai'|'file') => void; onQuestionText: (v: string) => void; onQuestionType: (v: QuestionType) => void
  onQuestionOptions: (v: string[]) => void; onCorrectAnswer: (v: string | string[]) => void; onQuestionPoints: (v: number) => void; onMatchingPairs: (pairs: { left: string; right: string }[]) => void
  onBankSearchQuery: (v: string) => void; onSelectedBankQuestions: (ids: string[]) => void
  onAddQuestion: () => void; onAddFromBank: () => void
  onAiTopic: (v: string) => void; onAiDifficulty: (v: 'easy'|'medium'|'hard') => void; onAiCount: (v: number) => void
  onAiGenerate: () => void; onAddAiQuestions: (ids: string[]) => void
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void; onFolderUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onDemo: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-[20px] font-semibold text-foreground">Асуултууд нэмэх</h2>
      </div>
      <QuestionTabNew
        questionText={questionText} questionType={questionType} questionOptions={questionOptions}
        correctAnswer={correctAnswer} questionPoints={questionPoints} matchingPairs={matchingPairs}
        onQuestionText={onQuestionText} onQuestionType={onQuestionType} onQuestionOptions={onQuestionOptions}
        onCorrectAnswer={onCorrectAnswer} onQuestionPoints={onQuestionPoints} onMatchingPairs={onMatchingPairs}
        onAddQuestion={onAddQuestion}
      />
    </div>
  )
}
