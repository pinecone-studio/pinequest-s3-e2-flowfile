'use client'

import { initialExamAssignments } from "@/lib/data"

export function useExamDetail(id: string) {
  const exam = initialExamAssignments.find(e => e.id === id)
  return { exam }
}