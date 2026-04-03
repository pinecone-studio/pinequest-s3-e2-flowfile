'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getAll, initialClasses, initialCourses, initialQuestions } from '@/lib/data'
import { SUBJECT_COLORS, SUBJECT_NAMES } from '@/lib/constants'
import type { Course, Question, QuestionType, SchoolClass } from '@/lib/types'
import { ExamPreviewPanel } from './_components/ExamPreviewPanel'
import { StepBasicInfo } from './_components/StepBasicInfo'
import { QuestionEditorDialog } from './_components/QuestionEditorDialog'
import { StepIndicator } from './_components/StepIndicator'
import { StepQuestions } from './_components/StepQuestions'
import { StepSchedule } from './_components/StepSchedule'
import {
  generateDemoQuestions,
  generateMockAIQuestions,
  getCourseLabel,
  isManualQuestionType,
  mapImportedQuestions,
  processImportFiles,
  saveExamPayload,
  stepLabels,
} from './createExamUtils'

type Step = 1 | 2 | 3
type QuestionTab = 'new' | 'bank' | 'ai' | 'file'

export function CreateExamClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [existingQuestions, setExistingQuestions] = useState<Question[]>(initialQuestions)
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(45)
  const [visibility, setVisibility] = useState<'private' | 'school'>('private')
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionTab, setQuestionTab] = useState<QuestionTab>('new')
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('single')
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>('')
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' },
    { left: '', right: '' },
  ])
  const [questionPoints, setQuestionPoints] = useState(2)
  const [bankSearchQuery, setBankSearchQuery] = useState('')
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<string[]>([])
  const [aiTopic, setAiTopic] = useState('')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [aiCount, setAiCount] = useState(5)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([])
  const [importingFile, setImportingFile] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)

  useEffect(() => {
    const localCourses = getAll<Course>('courses')
    const localClasses = getAll<SchoolClass>('classes')
    const localQuestions = getAll<Question>('questions')
    if (localCourses.length > 0) setCourses(localCourses)
    if (localClasses.length > 0) setClasses(localClasses)
    if (localQuestions.length > 0) setExistingQuestions(localQuestions)
  }, [])

  const selectedCourse = courses.find((course) => course.id === courseId)
  const availableClasses = selectedCourse
    ? classes.filter((schoolClass) => selectedCourse.classIds.includes(schoolClass.id))
    : []
  const subjectColor =
    SUBJECT_COLORS[(selectedCourse?.subjectId || 'math') as keyof typeof SUBJECT_COLORS] ||
    SUBJECT_COLORS.math
  const selectedCourseLabel = selectedCourse ? getCourseLabel(selectedCourse) : ''
  const totalPoints = questions.reduce((sum, question) => sum + (question.points || 0), 0)
  const editingQuestion =
    editingQuestionIndex !== null ? questions[editingQuestionIndex] ?? null : null
  const filteredBankQuestions = existingQuestions.filter(
    (question) =>
      !questions.some((existingQuestion) => existingQuestion.id === question.id) &&
      (bankSearchQuery === '' ||
        question.text.toLowerCase().includes(bankSearchQuery.toLowerCase())),
  )

  const resetQuestionForm = () => {
    setQuestionText('')
    setQuestionType('single')
    setQuestionOptions(['', '', '', ''])
    setCorrectAnswer('')
    setMatchingPairs([
      { left: '', right: '' },
      { left: '', right: '' },
    ])
    setQuestionPoints(2)
  }

  const handleAddQuestion = () => {
    if (!questionText.trim()) return
    const newQuestion: Question = {
      id: `q-new-${Date.now()}`,
      examId: '',
      text: questionText,
      type: questionType,
      points: questionPoints,
      order: questions.length + 1,
      isManualGrade: isManualQuestionType(questionType),
    }
    if (questionType === 'single' || questionType === 'multiple') {
      newQuestion.options = questionOptions.filter((option) => option.trim())
      newQuestion.correctAnswer = correctAnswer
    } else if (questionType === 'truefalse') {
      newQuestion.correctAnswer = correctAnswer
    } else if (questionType === 'matching') {
      newQuestion.matchingPairs = matchingPairs.filter(
        (pair) => pair.left.trim() && pair.right.trim(),
      )
    }
    setQuestions((prev) => [...prev, newQuestion])
    resetQuestionForm()
  }

  const handleAddFromBank = () => {
    setQuestions((prev) => [
      ...prev,
      ...existingQuestions.filter((question) => selectedBankQuestions.includes(question.id)),
    ])
    setSelectedBankQuestions([])
  }

  const handleAiGenerate = async () => {
    setAiGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setAiGeneratedQuestions(generateMockAIQuestions(aiTopic, aiDifficulty, aiCount))
    setAiGenerating(false)
  }

  const handleAddAiQuestions = (ids: string[]) => {
    setQuestions((prev) => [
      ...prev,
      ...aiGeneratedQuestions.filter((question) => ids.includes(question.id)),
    ])
    setAiGeneratedQuestions((prev) => prev.filter((question) => !ids.includes(question.id)))
  }

  const importFiles = async (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : []
    if (files.length === 0) return
    setImportingFile(true)
    setImportFileName(files.length === 1 ? files[0].name : `${files.length} файл`)
    try {
      const { collected, failures } = await processImportFiles(files, title, selectedCourseLabel)
      const importedQuestions = mapImportedQuestions(collected, questions.length)
      if (importedQuestions.length === 0) {
        throw new Error('Сонгосон файл эсвэл хавтсаас асуулт олдсонгүй.')
      }
      setQuestions((prev) => [...prev, ...importedQuestions])
      setQuestionTab('new')
      if (failures.length > 0) {
        const [firstFailure] = failures
        toast({
          variant: 'destructive',
          title: `${failures.length} файл алгасагдлаа`,
          description: `${firstFailure.fileName}: ${firstFailure.reason}`,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Импорт амжилтгүй боллоо',
        description: error instanceof Error ? error.message : 'Дахин оролдоно уу.',
      })
    } finally {
      setImportingFile(false)
      setImportFileName('')
    }
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await importFiles(event.target.files)
    event.target.value = ''
  }

  const handleFolderUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await importFiles(event.target.files)
    event.target.value = ''
  }

  const handleFillGeneralInfoDemo = () => {
    const demoCourse = selectedCourse ?? courses[0]
    if (!demoCourse) return
    const subjectName = SUBJECT_NAMES[demoCourse.subjectId] ?? demoCourse.subjectId
    setCourseId(demoCourse.id)
    setTitle(`${subjectName} - 1-р улирлын шалгалт`)
    setChapter(`${demoCourse.grade}-р ангийн давтлага`)
    setTopic(
      subjectName === 'Математик' ? 'Квадрат тэгшитгэл' : `${subjectName} хичээлийн үндсэн сэдэв`,
    )
    setDescription(`${subjectName} хичээлийн ойлголт, бодлого бодолт, хэрэглээг шалгах demo шалгалт.`)
    setDuration(45)
    setVisibility('private')
  }

  const handleAddDemoQuestions = () => {
    const subjectName = selectedCourse
      ? SUBJECT_NAMES[selectedCourse.subjectId] ?? selectedCourse.subjectId
      : 'Ерөнхий'
    setQuestions((prev) => [...prev, ...generateDemoQuestions(subjectName, prev.length)])
  }

  const handleSaveExam = async () => {
    if (!selectedCourse || saving) return
    setSaving(true)
    try {
      await saveExamPayload({
        questions,
        title,
        selectedCourse,
        chapter,
        topic,
        description,
        duration,
        totalPoints,
        visibility,
        selectedClasses,
        startDate,
        startTime,
        endDate,
        endTime,
        classes,
      })
      router.push('/teacher/exams')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Шалгалт хадгалах үед алдаа гарлаа',
        description: error instanceof Error ? error.message : 'Дахин оролдоно уу.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((question, i) => ({ ...question, order: i + 1 })),
    )
    setEditingQuestionIndex((prev) => {
      if (prev === null) return prev
      if (prev === index) return null
      if (prev > index) return prev - 1
      return prev
    })
  }

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (editingQuestionIndex === null) return
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === editingQuestionIndex ? { ...updatedQuestion, order: i + 1 } : question,
      ),
    )
    setEditingQuestionIndex(null)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return Boolean(title.trim() && courseId)
      case 2: return questions.length > 0
      case 3: return true
    }
  }

  return (
    <div className="flex h-[calc(100vh-36px)]">
      <ExamPreviewPanel
        title={title}
        selectedCourseLabel={selectedCourseLabel}
        subjectColor={subjectColor}
        duration={duration}
        questions={questions}
        totalPoints={totalPoints}
        onRemoveQuestion={handleRemoveQuestion}
        onSelectQuestion={setEditingQuestionIndex}
        onSave={handleSaveExam}
      />
      <div className="flex-1 bg-page-bg flex flex-col">
        <StepIndicator
          currentStep={currentStep}
          stepLabels={stepLabels}
          onStepClick={(step) => setCurrentStep(step as Step)}
        />
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep === 1 && (
            <StepBasicInfo
              title={title}
              courseId={courseId}
              chapter={chapter}
              topic={topic}
              description={description}
              duration={duration}
              visibility={visibility}
              courses={courses}
              onTitle={setTitle}
              onCourseId={setCourseId}
              onChapter={setChapter}
              onTopic={setTopic}
              onDescription={setDescription}
              onDuration={setDuration}
              onVisibility={setVisibility}
              onDemo={handleFillGeneralInfoDemo}
            />
          )}
          {currentStep === 2 && (
            <StepQuestions
              questionTab={questionTab}
              questionText={questionText}
              questionType={questionType}
              questionOptions={questionOptions}
              correctAnswer={correctAnswer}
              questionPoints={questionPoints}
              matchingPairs={matchingPairs}
              bankSearchQuery={bankSearchQuery}
              selectedBankQuestions={selectedBankQuestions}
              filteredBankQuestions={filteredBankQuestions}
              aiTopic={aiTopic}
              aiDifficulty={aiDifficulty}
              aiCount={aiCount}
              aiGenerating={aiGenerating}
              aiGeneratedQuestions={aiGeneratedQuestions}
              importingFile={importingFile}
              importFileName={importFileName}
              onQuestionTab={setQuestionTab}
              onQuestionText={setQuestionText}
              onQuestionType={setQuestionType}
              onQuestionOptions={setQuestionOptions}
              onCorrectAnswer={setCorrectAnswer}
              onQuestionPoints={setQuestionPoints}
              onMatchingPairs={setMatchingPairs}
              onBankSearchQuery={setBankSearchQuery}
              onSelectedBankQuestions={setSelectedBankQuestions}
              onAddQuestion={handleAddQuestion}
              onAddFromBank={handleAddFromBank}
              onAiTopic={setAiTopic}
              onAiDifficulty={setAiDifficulty}
              onAiCount={setAiCount}
              onAiGenerate={handleAiGenerate}
              onAddAiQuestions={handleAddAiQuestions}
              onFileUpload={handleFileUpload}
              onFolderUpload={handleFolderUpload}
              onDemo={handleAddDemoQuestions}
            />
          )}
          {currentStep === 3 && (
            <StepSchedule
              courseId={courseId}
              selectedClasses={selectedClasses}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              availableClasses={availableClasses}
              onSelectedClasses={setSelectedClasses}
              onStartDate={setStartDate}
              onStartTime={setStartTime}
              onEndDate={setEndDate}
              onEndTime={setEndTime}
            />
          )}
        </div>
        <div className="px-8 py-4 bg-white border-t border-card-border flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-table-header transition-colors disabled:opacity-50"
          >
            Өмнөх
          </button>
          <span className="text-[13px] text-text-secondary">
            {questions.length} асуулт • {totalPoints} оноо
          </span>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1) as Step)}
              disabled={!canProceed()}
              className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              Дараах
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={handleSaveExam}
              disabled={!title || questions.length === 0 || saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-[13px] font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check size={14} strokeWidth={1.5} />
              {saving ? 'Хадгалж байна...' : 'Шалгалт үүсгэх'}
            </button>
          )}
        </div>
      </div>
      <QuestionEditorDialog
        open={editingQuestion !== null}
        question={editingQuestion}
        questionNumber={editingQuestionIndex !== null ? editingQuestionIndex + 1 : undefined}
        onOpenChange={(open) => {
          if (!open) setEditingQuestionIndex(null)
        }}
        onSave={handleUpdateQuestion}
      />
    </div>
  )
}
