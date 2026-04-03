'use client'

import { useEffect, useRef } from 'react'
import { subscribeToTeacherProctoringStream } from '@/lib/api/teacher-proctoring'
import { isApiConfigured } from '@/lib/api/client'
import { useToast } from '@/components/ui/use-toast'

function formatViolationDescription(params: {
  studentName: string
  examTitle: string
  severity: 'low' | 'medium' | 'high'
  details: string | null
}) {
  const severityLabel =
    params.severity === 'high'
      ? 'Өндөр'
      : params.severity === 'medium'
        ? 'Дунд'
        : 'Бага'

  const suffix = params.details ? ` ${params.details}` : ''

  return `${params.studentName} "${params.examTitle}" шалгалтын үед сэжигтэй үйлдэл илэрлээ. Эрсдэл: ${severityLabel}.${suffix}`
}

export function useTeacherLiveProctoringAlerts() {
  const { toast } = useToast()
  const shownViolationIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }

    return subscribeToTeacherProctoringStream({
      onEvent: (event) => {
        if (event.type !== 'violation') {
          return
        }

        if (shownViolationIdsRef.current.has(event.violation.id)) {
          return
        }

        shownViolationIdsRef.current.add(event.violation.id)

        toast({
          title: 'Шуурхай хяналтын дохио',
          description: formatViolationDescription({
            studentName: event.violation.studentName,
            examTitle: event.violation.examTitle,
            severity: event.violation.severity,
            details: event.violation.details,
          }),
          variant: event.violation.severity === 'high' ? 'destructive' : 'default',
        })
      },
    })
  }, [toast])
}
