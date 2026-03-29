'use client'

import { useState } from "react"

export function useCreateExam() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<any[]>([])

  return { step, setStep, title, setTitle, questions, setQuestions }
}