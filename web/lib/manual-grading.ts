export type ManualGradingFeedback = Record<
  string,
  { score: number; comment: string }
>

type StoredManualGrading = {
  feedback: ManualGradingFeedback
  updatedAt: string
}

function getStorageKey(sessionId: string) {
  return `manual-grading:${sessionId}`
}

export function readManualGrading(sessionId: string): ManualGradingFeedback {
  if (typeof window === 'undefined') {
    return {}
  }

  const raw = window.localStorage.getItem(getStorageKey(sessionId))

  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as StoredManualGrading
    return parsed.feedback ?? {}
  } catch {
    return {}
  }
}

export function writeManualGrading(
  sessionId: string,
  feedback: ManualGradingFeedback,
) {
  if (typeof window === 'undefined') {
    return
  }

  const payload: StoredManualGrading = {
    feedback,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(payload))
}
