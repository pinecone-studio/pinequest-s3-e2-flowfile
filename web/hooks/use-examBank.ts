'use client'

import { useEffect, useState } from "react"
import { getAll } from "@/lib/data"
import { initialExams, initialUsers, initialQuestions } from "@/lib/data"
import type { Exam, User, Question } from "@/lib/types"

export function useExamBank() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  useEffect(() => {
    const e = getAll<Exam>('exams')
    const u = getAll<User>('users')
    const q = getAll<Question>('questions')

    if (e.length) setExams(e)
    if (u.length) setUsers(u)
    if (q.length) setQuestions(q)
  }, [])

  return { exams, users, questions }
}