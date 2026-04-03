import { Suspense } from 'react'
import { StudentResultsClient } from './StudentResultsClient'

export function StudentResults() {
  return (
    <Suspense fallback={null}>
      <StudentResultsClient />
    </Suspense>
  )
}
