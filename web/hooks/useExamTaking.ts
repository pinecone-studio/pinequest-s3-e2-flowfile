'use client'

import { useState } from "react"

export function useExamTaking() {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [index, setIndex] = useState(0)

  return { answers, setAnswers, index, setIndex }
}