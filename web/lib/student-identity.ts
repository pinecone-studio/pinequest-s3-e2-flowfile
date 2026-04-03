import { save } from '@/lib/data'
import { setDevAuthIdentity } from '@/lib/api/client'
import type { User } from '@/lib/types'

const QR_STUDENT_PROFILE_PREFIX = 'student.qr-entry'

export type QrStudentProfile = {
  examId: string
  studentId: string
  name: string
  className: string
  createdAt: string
}

function getQrStudentProfileKey(examId: string) {
  return `${QR_STUDENT_PROFILE_PREFIX}.${examId}`
}

function buildAvatarInitials(name: string) {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (tokens.length === 0) {
    return 'СУ'
  }

  return tokens.map((token) => token[0]?.toUpperCase() ?? '').join('')
}

function buildQrStudentId() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `QR${Date.now().toString(36).toUpperCase()}${randomPart}`
}

function buildQrStudentEmail(studentId: string) {
  return `${studentId.toLowerCase()}@qr.e-shalgalt.local`
}

export function readQrStudentProfile(examId: string) {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(getQrStudentProfileKey(examId))

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as QrStudentProfile
  } catch {
    return null
  }
}

export function registerQrStudentProfile(params: {
  examId: string
  name: string
  className: string
}) {
  const normalizedName = params.name.trim()
  const normalizedClassName = params.className.trim()
  const existingProfile = readQrStudentProfile(params.examId)
  const canReuseExistingProfile =
    existingProfile &&
    existingProfile.name.trim().toLowerCase() === normalizedName.toLowerCase() &&
    existingProfile.className.trim().toLowerCase() === normalizedClassName.toLowerCase()

  const studentId = canReuseExistingProfile
    ? existingProfile.studentId
    : buildQrStudentId()
  const createdAt = canReuseExistingProfile
    ? existingProfile.createdAt
    : new Date().toISOString()
  const profile: QrStudentProfile = {
    examId: params.examId,
    studentId,
    name: normalizedName,
    className: normalizedClassName,
    createdAt,
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      getQrStudentProfileKey(params.examId),
      JSON.stringify(profile),
    )
  }

  setDevAuthIdentity('student', {
    userId: studentId,
    email: buildQrStudentEmail(studentId),
    name: normalizedName,
  })

  const localUser: User = {
    id: studentId,
    name: normalizedName,
    role: 'student',
    avatarInitials: buildAvatarInitials(normalizedName),
  }

  save('users', localUser)

  return profile
}
