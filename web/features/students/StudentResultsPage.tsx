'use client'

import { useResults } from "../hooks/useResults"
import ResultsList from "../components/ResultsList"

export default function StudentResultsPage() {
  const data = useResults()

  return <ResultsList {...data} />
}