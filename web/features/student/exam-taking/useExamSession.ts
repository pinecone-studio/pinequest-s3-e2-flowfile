'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAll } from '@/lib/data'
import type { Course, Exam, ExamAssignment, Question, Subject } from '@/lib/types'
import { initialCourses, initialExamAssignments, initialExams, initialQuestions, initialSubjects, CURRENT_STUDENT_ID } from '@/lib/data'

type LegacyExam = Exam & { courseId?: string }

export function useExamSession(id: string) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [assignment, setAssignment] = useState<ExamAssignment | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const currentStudentId = CURRENT_STUDENT_ID

  useEffect(() => {
    const allExams = getAll<LegacyExam>('exams')
    const allAssignments = getAll<ExamAssignment>('examAssignments')
    const allCourses = getAll<Course>('courses')
    const examList = allExams.length ? allExams : (initialExams as LegacyExam[])
    const assignmentList = allAssignments.length ? allAssignments : initialExamAssignments
    const courseList = allCourses.length ? allCourses : initialCourses

    const loadedAssignment = assignmentList.find(item => item.id === id) || null
    const loadedExam =
      (loadedAssignment ? examList.find(item => item.id === loadedAssignment.examId) : null) ||
      examList.find(item => item.id === id) ||
      null

    setAssignment(loadedAssignment)

    if (!loadedExam) { setIsLoaded(true); return }

    const resolvedSubjectId =
      loadedExam.subjectId ||
      courseList.find(course => course.id === loadedExam.courseId)?.subjectId ||
      null

    setExam(loadedExam)
    setSubject(resolvedSubjectId ? initialSubjects.find(item => item.id === resolvedSubjectId) || null : null)

    const storedQuestions = getAll<Question>('questions')
    const questionPool = storedQuestions.length ? storedQuestions : initialQuestions
    setQuestions(
      questionPool
        .filter(question => loadedExam.questionIds.includes(question.id))
        .sort((left, right) => left.order - right.order)
    )

    const attemptKey = loadedAssignment?.id ?? loadedExam.id
    const savedKey = `attempt_${attemptKey}_${CURRENT_STUDENT_ID}`
    const savedAnswers = localStorage.getItem(savedKey)
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
    setIsLoaded(true)
  }, [id])

  const autoSave = useCallback(() => {
    if (!exam) return
    const savedKey = `attempt_${assignment?.id ?? exam.id}_${currentStudentId}`
    localStorage.setItem(savedKey, JSON.stringify(answers))
    setLastSaved(new Date())
  }, [answers, assignment?.id, currentStudentId, exam])

  useEffect(() => { autoSave() }, [answers, autoSave])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    exam, assignment, subject, questions, isLoaded,
    answers, setAnswers,
    markedForReview, setMarkedForReview,
    lastSaved, currentStudentId, formatTime,
  }
}
