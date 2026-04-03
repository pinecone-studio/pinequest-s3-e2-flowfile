const LOCAL_APP_ORIGIN = 'http://localhost:3000'
const DEFAULT_QR_CODE_SIZE = 220

function normalizeOrigin(candidate: string) {
  const value = candidate.trim()

  if (!value) {
    return LOCAL_APP_ORIGIN
  }

  try {
    return new URL(value).origin
  } catch {
    try {
      return new URL(`https://${value}`).origin
    } catch {
      return value.replace(/\/$/, '')
    }
  }
}

export function resolvePublicAppOrigin(origin?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const fallbackOrigin =
    origin?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : LOCAL_APP_ORIGIN)

  return normalizeOrigin(configured || fallbackOrigin)
}

export function buildStudentExamShareUrl(
  examId: string,
  origin = resolvePublicAppOrigin(),
) {
  return new URL(
    `/student/exams/${examId}?entry=qr`,
    `${normalizeOrigin(origin)}/`,
  ).toString()
}

export function buildQrCodeUrl(
  shareUrl: string,
  size = DEFAULT_QR_CODE_SIZE,
) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(shareUrl)}`
}

export function isLocalShareUrl(shareUrl: string) {
  return (
    shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1')
  )
}
