'use client'

import React, { useState, useEffect, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check } from 'lucide-react'
import { getAll } from '@/lib/data'
import type { Course, SchoolClass, Question, QuestionType } from '@/lib/types'
import { initialCourses, initialClasses, initialQuestions } from '@/lib/data'
import { SUBJECT_COLORS, SUBJECT_NAMES } from '@/lib/constants'
import { toast } from '@/hooks/use-toast'
import { ExamPreviewPanel } from './_components/ExamPreviewPanel'
import { StepIndicator } from './_components/StepIndicator'
import { StepSource } from './_components/StepSource'
import { StepBasicInfo } from './_components/StepBasicInfo'
import { StepQuestions } from './_components/StepQuestions'
import { StepSchedule } from './_components/StepSchedule'
import { isManualQuestionType, getCourseLabel, mapImportedQuestions, processImportFiles, generateMockAIQuestions, generateDemoQuestions, saveExamPayload, stepLabels } from './createExamUtils'

type Step = 1 | 2 | 3 | 4
type QuestionTab = 'new' | 'bank' | 'ai' | 'file'

export function CreateExamClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [existingQuestions, setExistingQuestions] = useState<Question[]>(initialQuestions)
  const [source, setSource] = useState<'new' | 'bank'>('new')
  const [title, setTitle] = useState(''); const [courseId, setCourseId] = useState('')
  const [chapter, setChapter] = useState(''); const [topic, setTopic] = useState('')
  const [description, setDescription] = useState(''); const [duration, setDuration] = useState(45)
  const [visibility, setVisibility] = useState<'private' | 'school'>('private')
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionTab, setQuestionTab] = useState<QuestionTab>('new')
  const [questionText, setQuestionText] = useState(''); const [questionType, setQuestionType] = useState<QuestionType>('single')
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>('')
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([{ left: '', right: '' }, { left: '', right: '' }])
  const [questionPoints, setQuestionPoints] = useState(2)
  const [bankSearchQuery, setBankSearchQuery] = useState(''); const [selectedBankQuestions, setSelectedBankQuestions] = useState<string[]>([])
  const [aiTopic, setAiTopic] = useState(''); const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [aiCount, setAiCount] = useState(5); const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([])
  const [importingFile, setImportingFile] = useState(false); const [importFileName, setImportFileName] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [startDate, setStartDate] = useState(''); const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState(''); const [endTime, setEndTime] = useState('')

  useEffect(() => {
    const lc = getAll<Course>('courses'); const ll = getAll<SchoolClass>('classes'); const lq = getAll<Question>('questions')
    if (lc.length) setCourses(lc); if (ll.length) setClasses(ll); if (lq.length) setExistingQuestions(lq)
  }, [])

  const selectedCourse = courses.find(c => c.id === courseId)
  const availableClasses = selectedCourse ? classes.filter(cls => selectedCourse.classIds.includes(cls.id)) : []
  const subjectColor = SUBJECT_COLORS[(selectedCourse?.subjectId || 'math') as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.math
  const selectedCourseLabel = selectedCourse ? getCourseLabel(selectedCourse) : ''
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const filteredBankQuestions = existingQuestions.filter(q => !questions.some(e => e.id === q.id) && (bankSearchQuery === '' || q.text.toLowerCase().includes(bankSearchQuery.toLowerCase())))

  const handleAddQuestion = () => {
    if (!questionText.trim()) return
    const newQ: Question = { id: `q-new-${Date.now()}`, examId: '', text: questionText, type: questionType, points: questionPoints, order: questions.length + 1, isManualGrade: isManualQuestionType(questionType) }
    if (questionType === 'single' || questionType === 'multiple') { newQ.options = questionOptions.filter(o => o.trim()); newQ.correctAnswer = correctAnswer }
    else if (questionType === 'truefalse') { newQ.correctAnswer = correctAnswer }
    else if (questionType === 'matching') { newQ.matchingPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim()) }
    setQuestions([...questions, newQ])
    setQuestionText(''); setQuestionType('single'); setQuestionOptions(['', '', '', '']); setCorrectAnswer(''); setMatchingPairs([{ left: '', right: '' }, { left: '', right: '' }]); setQuestionPoints(2)
  }

  const handleAddFromBank = () => { setQuestions([...questions, ...existingQuestions.filter(q => selectedBankQuestions.includes(q.id))]); setSelectedBankQuestions([]) }

  const handleAiGenerate = async () => {
    setAiGenerating(true); await new Promise(resolve => setTimeout(resolve, 2000))
    setAiGeneratedQuestions(generateMockAIQuestions(aiTopic, aiDifficulty, aiCount)); setAiGenerating(false)
  }

  const handleAddAiQuestions = (ids: string[]) => {
    setQuestions([...questions, ...aiGeneratedQuestions.filter(q => ids.includes(q.id))])
    setAiGeneratedQuestions(aiGeneratedQuestions.filter(q => !ids.includes(q.id)))
  }

  const importFiles = async (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : []; if (!files.length) return
    setImportingFile(true); setImportFileName(files.length === 1 ? files[0].name : `${files.length} файл`)
    try {
      const { collected, skipped, usedLocalParser } = await processImportFiles(files, title, selectedCourseLabel)
      const imported = mapImportedQuestions(collected, questions.length)
      if (!imported.length) throw new Error('Сонгосон файл эсвэл хавтсаас асуулт олдсонгүй.')
      setQuestions([...questions, ...imported]); setQuestionTab('new')
      const parts = [`${imported.length} асуулт нэмэгдлээ.`, usedLocalParser && 'API key байхгүй тул локал parser ашиглалаа.', skipped.length && `${skipped.length} файл алгасагдлаа.`].filter(Boolean).join(' ')
      toast({ title: 'Импорт амжилттай', description: parts })
    } catch (err) { toast({ variant: 'destructive', title: 'Импорт амжилтгүй боллоо', description: err instanceof Error ? err.message : 'Дахин оролдоно уу.' })
    } finally { setImportingFile(false); setImportFileName('') }
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => { await importFiles(e.target.files); e.target.value = '' }
  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => { await importFiles(e.target.files); e.target.value = '' }

  const handleFillGeneralInfoDemo = () => {
    const demoCourse = selectedCourse ?? courses[0]; if (!demoCourse) return
    const sn = SUBJECT_NAMES[demoCourse.subjectId] ?? demoCourse.subjectId
    setCourseId(demoCourse.id); setTitle(`${sn} - 1-р улирлын шалгалт`); setChapter(`${demoCourse.grade}-р ангийн давтлага`)
    setTopic(sn === 'Математик' ? 'Квадрат тэгшитгэл' : `${sn} хичээлийн үндсэн сэдэв`)
    setDescription(`${sn} хичээлийн ойлголт, бодлого бодолт, хэрэглээг шалгах demo шалгалт.`); setDuration(45); setVisibility('private')
  }

  const handleAddDemoQuestions = () => {
    const sn = selectedCourse ? (SUBJECT_NAMES[selectedCourse.subjectId] ?? selectedCourse.subjectId) : 'Ерөнхий'
    setQuestions([...questions, ...generateDemoQuestions(sn, questions.length)])
  }

  const handleSaveExam = () => {
    if (!selectedCourse) return
    saveExamPayload({ questions, title, selectedCourse, chapter, topic, description, duration, totalPoints, visibility, selectedClasses, startDate, startTime, endDate, endTime })
    router.push('/teacher/exams')
  }

  const canProceed = () => { switch (currentStep) { case 1: return true; case 2: return !!(title.trim() && courseId); case 3: return questions.length > 0; case 4: return true } }

  return (
    <div className="flex h-[calc(100vh-36px)]">
      <ExamPreviewPanel title={title} selectedCourseLabel={selectedCourseLabel} subjectColor={subjectColor} duration={duration} questions={questions} totalPoints={totalPoints} onRemoveQuestion={(index) => setQuestions(questions.filter((_, i) => i !== index))} onSave={handleSaveExam} />
      <div className="flex-1 bg-page-bg flex flex-col">
        <StepIndicator currentStep={currentStep} stepLabels={stepLabels} onStepClick={(step) => setCurrentStep(step as Step)} />
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep === 1 && <StepSource source={source} onChange={setSource} />}
          {currentStep === 2 && <StepBasicInfo title={title} courseId={courseId} chapter={chapter} topic={topic} description={description} duration={duration} visibility={visibility} courses={courses} onTitle={setTitle} onCourseId={setCourseId} onChapter={setChapter} onTopic={setTopic} onDescription={setDescription} onDuration={setDuration} onVisibility={setVisibility} onDemo={handleFillGeneralInfoDemo} />}
          {currentStep === 3 && <StepQuestions questions={questions} questionTab={questionTab} questionText={questionText} questionType={questionType} questionOptions={questionOptions} correctAnswer={correctAnswer} questionPoints={questionPoints} bankSearchQuery={bankSearchQuery} selectedBankQuestions={selectedBankQuestions} filteredBankQuestions={filteredBankQuestions} aiTopic={aiTopic} aiDifficulty={aiDifficulty} aiCount={aiCount} aiGenerating={aiGenerating} aiGeneratedQuestions={aiGeneratedQuestions} importingFile={importingFile} importFileName={importFileName} onQuestionTab={setQuestionTab} onQuestionText={setQuestionText} onQuestionType={setQuestionType} onQuestionOptions={setQuestionOptions} onCorrectAnswer={setCorrectAnswer} onQuestionPoints={setQuestionPoints} onBankSearchQuery={setBankSearchQuery} onSelectedBankQuestions={setSelectedBankQuestions} onAddQuestion={handleAddQuestion} onAddFromBank={handleAddFromBank} onAiTopic={setAiTopic} onAiDifficulty={setAiDifficulty} onAiCount={setAiCount} onAiGenerate={handleAiGenerate} onAddAiQuestions={handleAddAiQuestions} onFileUpload={handleFileUpload} onFolderUpload={handleFolderUpload} onDemo={handleAddDemoQuestions} />}
          {currentStep === 4 && <StepSchedule courseId={courseId} selectedClasses={selectedClasses} startDate={startDate} startTime={startTime} endDate={endDate} endTime={endTime} availableClasses={availableClasses} onSelectedClasses={setSelectedClasses} onStartDate={setStartDate} onStartTime={setStartTime} onEndDate={setEndDate} onEndTime={setEndTime} />}
        </div>
        <div className="px-8 py-4 bg-white border-t border-card-border flex items-center justify-between">
          <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as Step)} disabled={currentStep === 1} className="px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-table-header transition-colors disabled:opacity-50">Өмнөх</button>
          <span className="text-[13px] text-text-secondary">{questions.length} асуулт • {totalPoints} оноо</span>
          {currentStep < 4 ? (
            <button onClick={() => setCurrentStep(prev => Math.min(4, prev + 1) as Step)} disabled={!canProceed()} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5">Дараах<ChevronRight size={14} strokeWidth={1.5} /></button>
          ) : (
            <button onClick={handleSaveExam} disabled={!title || questions.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg text-[13px] font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"><Check size={14} strokeWidth={1.5} />Шалгалт үүсгэх</button>
          )}
        </div>
      </div>
    </div>
  )
}
