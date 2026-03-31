import React, { type ChangeEvent } from 'react'
import { Plus, Database, Sparkles, Upload, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question, QuestionType } from '@/lib/types'
import { QuestionTabNew } from './QuestionTabNew'
import { QuestionTabBank } from './QuestionTabBank'
import { QuestionTabAI } from './QuestionTabAI'
import { QuestionTabFile } from './QuestionTabFile'

type QuestionTab = 'new' | 'bank' | 'ai' | 'file'

export function StepQuestions({
  questions, questionTab, questionText, questionType, questionOptions, correctAnswer, questionPoints,
  bankSearchQuery, selectedBankQuestions, filteredBankQuestions,
  aiTopic, aiDifficulty, aiCount, aiGenerating, aiGeneratedQuestions,
  importingFile, importFileName,
  onQuestionTab, onQuestionText, onQuestionType, onQuestionOptions, onCorrectAnswer, onQuestionPoints,
  onBankSearchQuery, onSelectedBankQuestions, onAddQuestion, onAddFromBank,
  onAiTopic, onAiDifficulty, onAiCount, onAiGenerate, onAddAiQuestions,
  onFileUpload, onFolderUpload, onDemo,
}: {
  questions: Question[]; questionTab: QuestionTab; questionText: string; questionType: QuestionType
  questionOptions: string[]; correctAnswer: string | string[]; questionPoints: number
  bankSearchQuery: string; selectedBankQuestions: string[]; filteredBankQuestions: Question[]
  aiTopic: string; aiDifficulty: 'easy' | 'medium' | 'hard'; aiCount: number; aiGenerating: boolean; aiGeneratedQuestions: Question[]
  importingFile: boolean; importFileName: string
  onQuestionTab: (tab: QuestionTab) => void; onQuestionText: (v: string) => void; onQuestionType: (v: QuestionType) => void
  onQuestionOptions: (v: string[]) => void; onCorrectAnswer: (v: string | string[]) => void; onQuestionPoints: (v: number) => void
  onBankSearchQuery: (v: string) => void; onSelectedBankQuestions: (ids: string[]) => void
  onAddQuestion: () => void; onAddFromBank: () => void
  onAiTopic: (v: string) => void; onAiDifficulty: (v: 'easy' | 'medium' | 'hard') => void; onAiCount: (v: number) => void
  onAiGenerate: () => void; onAddAiQuestions: (ids: string[]) => void
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void; onFolderUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onDemo: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="text-center flex-1">
          <h2 className="text-[20px] font-semibold text-foreground">Асуултууд нэмэх</h2>
          <p className="text-[14px] text-text-secondary mt-1">Асуултуудаа гараар оруулах, сангаас сонгох эсвэл AI-р үүсгэх</p>
        </div>
        <button type="button" onClick={onDemo} className="shrink-0 px-3 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground bg-white hover:bg-table-header transition-colors flex items-center gap-1.5"><Copy size={14} strokeWidth={1.5} />Demo</button>
      </div>
      <div className="flex items-center justify-center gap-1 p-1 bg-table-header rounded-lg mb-6">
        {(['new', 'bank', 'ai', 'file'] as QuestionTab[]).map(tab => (
          <button key={tab} onClick={() => onQuestionTab(tab)} className={cn('px-4 py-2 rounded-md text-[13px] font-medium transition-colors', questionTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground')}>
            {tab === 'new' && <><Plus size={14} className="inline mr-1.5" strokeWidth={1.5} />Шинэ асуулт</>}
            {tab === 'bank' && <><Database size={14} className="inline mr-1.5" strokeWidth={1.5} />Сангаас</>}
            {tab === 'ai' && <><Sparkles size={14} className="inline mr-1.5" strokeWidth={1.5} />AI Auto-fill</>}
            {tab === 'file' && <><Upload size={14} className="inline mr-1.5" strokeWidth={1.5} />Файлаас</>}
          </button>
        ))}
      </div>
      {questionTab === 'new' && <QuestionTabNew questionText={questionText} questionType={questionType} questionOptions={questionOptions} correctAnswer={correctAnswer} questionPoints={questionPoints} onQuestionText={onQuestionText} onQuestionType={onQuestionType} onQuestionOptions={onQuestionOptions} onCorrectAnswer={onCorrectAnswer} onQuestionPoints={onQuestionPoints} onAddQuestion={onAddQuestion} />}
      {questionTab === 'bank' && <QuestionTabBank bankSearchQuery={bankSearchQuery} selectedBankQuestions={selectedBankQuestions} filteredBankQuestions={filteredBankQuestions} onBankSearchQuery={onBankSearchQuery} onSelectedBankQuestions={onSelectedBankQuestions} onAddFromBank={onAddFromBank} />}
      {questionTab === 'ai' && <QuestionTabAI aiTopic={aiTopic} aiDifficulty={aiDifficulty} aiCount={aiCount} aiGenerating={aiGenerating} aiGeneratedQuestions={aiGeneratedQuestions} onAiTopic={onAiTopic} onAiDifficulty={onAiDifficulty} onAiCount={onAiCount} onAiGenerate={onAiGenerate} onAddAiQuestions={onAddAiQuestions} />}
      {questionTab === 'file' && <QuestionTabFile importingFile={importingFile} importFileName={importFileName} onFileUpload={onFileUpload} onFolderUpload={onFolderUpload} />}
    </div>
  )
}
