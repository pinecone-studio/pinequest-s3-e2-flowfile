'use client'

import { initialResults, CURRENT_STUDENT_ID } from "@/lib/data"

export function useResults() {
  const results = initialResults.filter(r => r.studentId === CURRENT_STUDENT_ID)
  return { results }
}