// lib/data.ts
import type { User, Course, Class, Exam, Question, Schedule, Attempt, Result } from './types'

// localStorage service
export function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  const items = getAll<T>(key)
  return items.find(item => item.id === id)
}

export function save<T extends { id: string }>(key: string, item: T): void {
  const items = getAll<T>(key)
  const existingIndex = items.findIndex(i => i.id === item.id)
  if (existingIndex >= 0) {
    items[existingIndex] = item
  } else {
    items.push(item)
  }
  localStorage.setItem(key, JSON.stringify(items))
}

export function update<T extends { id: string }>(key: string, id: string, patch: Partial<T>): void {
  const items = getAll<T>(key)
  const index = items.findIndex(i => i.id === id)
  if (index >= 0) {
    items[index] = { ...items[index], ...patch }
    localStorage.setItem(key, JSON.stringify(items))
  }
}

export function remove(key: string, id: string): void {
  const items = getAll<{ id: string }>(key)
  const filtered = items.filter(i => i.id !== id)
  localStorage.setItem(key, JSON.stringify(filtered))
}

// Seed data
const seedUsers: User[] = [
  { id: 'teacher-1', name: 'Батбаяр Ганболд', role: 'teacher', avatarInitials: 'БГ' },
  { id: 'teacher-2', name: 'Оюунчимэг Дорж', role: 'teacher', avatarInitials: 'ОД' },
  { id: 'admin-1', name: 'Энхболд Түмэн', role: 'admin', avatarInitials: 'ЭТ' },
  { id: 'student-1', name: 'Болд Эрдэнэ', role: 'student', avatarInitials: 'БЭ' },
  { id: 'student-2', name: 'Номин Баяр', role: 'student', avatarInitials: 'НБ' },
  { id: 'student-3', name: 'Энхбаяр Сүхээ', role: 'student', avatarInitials: 'ЭС' },
  { id: 'student-4', name: 'Цэцэг Мөнхбат', role: 'student', avatarInitials: 'ЦМ' },
  { id: 'student-5', name: 'Ганбаяр Төмөр', role: 'student', avatarInitials: 'ГТ' },
  { id: 'student-6', name: 'Сарангэрэл Бат', role: 'student', avatarInitials: 'СБ' },
  { id: 'student-7', name: 'Тэмүүлэн Очир', role: 'student', avatarInitials: 'ТО' },
  { id: 'student-8', name: 'Мөнхзул Дэлгэр', role: 'student', avatarInitials: 'МД' },
  { id: 'student-9', name: 'Батчимэг Нарантуяа', role: 'student', avatarInitials: 'БН' },
  { id: 'student-10', name: 'Өлзий Ганзориг', role: 'student', avatarInitials: 'ӨГ' },
]

const seedCourses: Course[] = [
  { id: 'course-1', name: 'Математик', grade: 'X анги', year: '2024-2025', termBadge: 'I улирал', colorAccent: 'slate' },
  { id: 'course-2', name: 'Монгол хэл', grade: 'IX анги', year: '2024-2025', termBadge: 'I улирал', colorAccent: 'teal' },
  { id: 'course-3', name: 'Физик', grade: 'XI анги', year: '2024-2025', termBadge: 'I улирал', colorAccent: 'amber' },
]

const seedClasses: Class[] = [
  { id: 'class-1', courseId: 'course-1', name: '10А анги', schedule: 'Даваа, Лхагва 08:00–09:30', studentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'], teacherId: 'teacher-1' },
  { id: 'class-2', courseId: 'course-1', name: '10Б анги', schedule: 'Мягмар, Пүрэв 10:00–11:30', studentIds: ['student-6', 'student-7', 'student-8', 'student-9', 'student-10'], teacherId: 'teacher-1' },
  { id: 'class-3', courseId: 'course-2', name: '9А анги', schedule: 'Даваа, Пүрэв 13:00–14:30', studentIds: ['student-1', 'student-3', 'student-5', 'student-7', 'student-9'], teacherId: 'teacher-2' },
  { id: 'class-4', courseId: 'course-2', name: '9Б анги', schedule: 'Мягмар, Баасан 08:00–09:30', studentIds: ['student-2', 'student-4', 'student-6', 'student-8', 'student-10'], teacherId: 'teacher-2' },
  { id: 'class-5', courseId: 'course-3', name: '11А анги', schedule: 'Лхагва, Баасан 10:00–11:30', studentIds: ['student-1', 'student-2', 'student-6', 'student-7', 'student-8'], teacherId: 'teacher-1' },
  { id: 'class-6', courseId: 'course-3', name: '11Б анги', schedule: 'Даваа, Мягмар 14:00–15:30', studentIds: ['student-3', 'student-4', 'student-5', 'student-9', 'student-10'], teacherId: 'teacher-1' },
]

const seedQuestions: Question[] = [
  // Math questions
  { id: 'q-1', text: 'Квадрат тэгшитгэлийн ерөнхий томъёо аль нь вэ?', type: 'single', options: ['ax² + bx + c = 0', 'ax + b = 0', 'a/x + b = 0', 'ax³ + bx = 0'], correctAnswer: 'ax² + bx + c = 0', points: 2 },
  { id: 'q-2', text: '2 + 2 × 2 = ?', type: 'single', options: ['6', '8', '4', '10'], correctAnswer: '6', points: 1 },
  { id: 'q-3', text: 'Пифагорын теорем зөв үү?', type: 'truefalse', correctAnswer: 'true', points: 1 },
  { id: 'q-4', text: 'Дараах тоонуудаас аль нь анхны тоо вэ?', type: 'multiple', options: ['2', '4', '7', '9', '11'], correctAnswer: ['2', '7', '11'], points: 3 },
  { id: 'q-5', text: 'sin(90°) утгыг олно уу.', type: 'short', correctAnswer: '1', points: 2 },
  { id: 'q-6', text: 'Квадрат функцийн графикийг зураад тайлбарла.', type: 'long', points: 5 },
  { id: 'q-7', text: 'Тооны квадрат язгуурыг олох томъёог бичнэ үү.', type: 'formula', points: 3 },
  { id: 'q-8', text: 'Тэгшитгэлүүдийг тохирох хариутай нь тааруулна уу.', type: 'matching', matchingPairs: [{ left: 'x² = 4', right: 'x = ±2' }, { left: 'x + 5 = 10', right: 'x = 5' }, { left: '2x = 8', right: 'x = 4' }], points: 3 },
  { id: 'q-9', text: 'log₂(8) утгыг олно уу.', type: 'single', options: ['2', '3', '4', '8'], correctAnswer: '3', points: 2 },
  { id: 'q-10', text: 'Геометр прогрессийн ерөнхий гишүүний томъёог бичнэ үү.', type: 'short', correctAnswer: 'aₙ = a₁ × rⁿ⁻¹', points: 2 },
  
  // Mongolian language questions
  { id: 'q-11', text: '"Монгол нууц товчоо" хэдэн онд бичигдсэн бэ?', type: 'single', options: ['1227 он', '1240 он', '1260 он', '1206 он'], correctAnswer: '1240 он', points: 2 },
  { id: 'q-12', text: 'Үйл үг гэж юу вэ?', type: 'long', points: 5 },
  { id: 'q-13', text: 'Монгол хэлний үсгийн тоог бичнэ үү.', type: 'short', correctAnswer: '35', points: 1 },
  { id: 'q-14', text: '"Эх орон" гэсэн үгэнд хэдэн үе байна вэ?', type: 'single', options: ['2', '3', '4', '5'], correctAnswer: '3', points: 1 },
  { id: 'q-15', text: 'Д.Нацагдорж "Миний нутаг" шүлгийг бичсэн.', type: 'truefalse', correctAnswer: 'true', points: 1 },
  { id: 'q-16', text: 'Зохиолч болон бүтээлийг тааруулна уу.', type: 'matching', matchingPairs: [{ left: 'Д.Нацагдорж', right: 'Миний нутаг' }, { left: 'Б.Ринчен', right: 'Их хувилгаан' }, { left: 'Ц.Дамдинсүрэн', right: 'Хөхөө намар' }], points: 3 },
  { id: 'q-17', text: 'Өгүүлбэрийн гишүүдийг нэрлэнэ үү.', type: 'multiple', options: ['Өгүүлэгдэхүүн', 'Өгүүлэхүүн', 'Тодотгол', 'Нэмэлт', 'Байц'], correctAnswer: ['Өгүүлэгдэхүүн', 'Өгүүлэхүүн', 'Тодотгол', 'Нэмэлт', 'Байц'], points: 5 },
  { id: 'q-18', text: 'Монгол бичгийн түүхийн талаар товч бичнэ үү.', type: 'long', points: 10 },
  
  // Physics questions
  { id: 'q-19', text: 'Ньютоны хоёрдугаар хууль аль нь вэ?', type: 'single', options: ['F = ma', 'E = mc²', 'V = IR', 'P = W/t'], correctAnswer: 'F = ma', points: 2 },
  { id: 'q-20', text: 'Гравитацийн хурдатгал ойролцоогоор 9.8 м/с² байдаг.', type: 'truefalse', correctAnswer: 'true', points: 1 },
  { id: 'q-21', text: 'Дараах нэгжүүдээс аль нь хүчний нэгж вэ?', type: 'single', options: ['Ньютон', 'Жоуль', 'Ватт', 'Паскаль'], correctAnswer: 'Ньютон', points: 1 },
  { id: 'q-22', text: 'Томъёонуудыг тохирох хэмжигдэхүүнтэй нь тааруулна уу.', type: 'matching', matchingPairs: [{ left: 'F = ma', right: 'Хүч' }, { left: 'E = mc²', right: 'Энерги' }, { left: 'V = IR', right: 'Хүчдэл' }], points: 3 },
  { id: 'q-23', text: 'Кинетик энергийн томъёог бичнэ үү.', type: 'formula', points: 2 },
  { id: 'q-24', text: 'Гэрлийн хурдыг бичнэ үү (м/с).', type: 'short', correctAnswer: '299792458', points: 2 },
  { id: 'q-25', text: 'Термодинамикийн хоёрдугаар хуулийг тайлбарлана уу.', type: 'long', points: 5 },
  { id: 'q-26', text: 'Дараах бодисуудаас аль нь дамжуулагч вэ?', type: 'multiple', options: ['Зэс', 'Резин', 'Алт', 'Шил', 'Мөнгө'], correctAnswer: ['Зэс', 'Алт', 'Мөнгө'], points: 3 },
]

const seedExams: Exam[] = [
  { 
    id: 'exam-1', 
    title: 'Математик - I улирлын шалгалт', 
    courseId: 'course-1', 
    chapter: '1-3 бүлэг',
    topic: 'Квадрат тэгшитгэл',
    description: 'Квадрат тэгшитгэл болон функцийн шалгалт',
    duration: 45, 
    visibility: 'school', 
    ownerId: 'teacher-1', 
    createdAt: '2024-09-15T08:00:00Z', 
    questionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5', 'q-6', 'q-7', 'q-8'],
    status: 'active'
  },
  { 
    id: 'exam-2', 
    title: 'Математик - Хяналтын ажил №1', 
    courseId: 'course-1', 
    chapter: '4-5 бүлэг',
    duration: 30, 
    visibility: 'private', 
    ownerId: 'teacher-1', 
    createdAt: '2024-10-01T08:00:00Z', 
    questionIds: ['q-9', 'q-10', 'q-2', 'q-3'],
    status: 'closed'
  },
  { 
    id: 'exam-3', 
    title: 'Монгол хэл - Уран зохиолын шалгалт', 
    courseId: 'course-2', 
    chapter: 'Уран зохиол',
    description: 'Монгол уран зохиолын түүх ба зохиолчид',
    duration: 60, 
    visibility: 'school', 
    ownerId: 'teacher-2', 
    createdAt: '2024-09-20T08:00:00Z', 
    questionIds: ['q-11', 'q-12', 'q-15', 'q-16', 'q-17', 'q-18'],
    status: 'scheduled'
  },
  { 
    id: 'exam-4', 
    title: 'Монгол хэл - Дүрмийн шалгалт', 
    courseId: 'course-2', 
    chapter: 'Хэл зүй',
    duration: 40, 
    visibility: 'private', 
    ownerId: 'teacher-2', 
    createdAt: '2024-10-05T08:00:00Z', 
    questionIds: ['q-13', 'q-14', 'q-17'],
    status: 'closed'
  },
  { 
    id: 'exam-5', 
    title: 'Физик - Механикийн шалгалт', 
    courseId: 'course-3', 
    chapter: 'Механик',
    topic: 'Ньютоны хуулиуд',
    description: 'Сонгодог механикийн үндсэн ойлголтууд',
    duration: 50, 
    visibility: 'school', 
    ownerId: 'teacher-1', 
    createdAt: '2024-09-25T08:00:00Z', 
    questionIds: ['q-19', 'q-20', 'q-21', 'q-22', 'q-23', 'q-24', 'q-25', 'q-26'],
    status: 'active'
  },
  { 
    id: 'exam-6', 
    title: 'Физик - Цахилгаан хэлхээ', 
    courseId: 'course-3', 
    chapter: 'Цахилгаан',
    duration: 35, 
    visibility: 'private', 
    ownerId: 'teacher-1', 
    createdAt: '2024-10-10T08:00:00Z', 
    questionIds: ['q-21', 'q-22', 'q-26'],
    status: 'draft'
  },
]

const seedSchedules: Schedule[] = [
  { id: 'schedule-1', examId: 'exam-1', classId: 'class-1', startTime: '2024-11-20T08:00:00Z', endTime: '2024-11-20T08:45:00Z', isPaused: false, extendedMinutes: 0 },
  { id: 'schedule-2', examId: 'exam-1', classId: 'class-2', startTime: '2024-11-20T10:00:00Z', endTime: '2024-11-20T10:45:00Z', isPaused: false, extendedMinutes: 0 },
  { id: 'schedule-3', examId: 'exam-3', classId: 'class-3', startTime: '2024-11-22T13:00:00Z', endTime: '2024-11-22T14:00:00Z', isPaused: false, extendedMinutes: 0 },
  { id: 'schedule-4', examId: 'exam-5', classId: 'class-5', startTime: '2024-11-21T10:00:00Z', endTime: '2024-11-21T10:50:00Z', isPaused: false, extendedMinutes: 0 },
  { id: 'schedule-5', examId: 'exam-2', classId: 'class-1', startTime: '2024-10-15T08:00:00Z', endTime: '2024-10-15T08:30:00Z', isPaused: false, extendedMinutes: 0 },
  { id: 'schedule-6', examId: 'exam-4', classId: 'class-3', startTime: '2024-10-20T13:00:00Z', endTime: '2024-10-20T13:40:00Z', isPaused: false, extendedMinutes: 0 },
]

const seedAttempts: Attempt[] = [
  { id: 'attempt-1', examId: 'exam-2', studentId: 'student-1', answers: { 'q-9': '3', 'q-10': 'aₙ = a₁ × rⁿ⁻¹', 'q-2': '6', 'q-3': 'true' }, startedAt: '2024-10-15T08:02:00Z', submittedAt: '2024-10-15T08:25:00Z', isComplete: true },
  { id: 'attempt-2', examId: 'exam-2', studentId: 'student-2', answers: { 'q-9': '2', 'q-10': 'wrong', 'q-2': '6', 'q-3': 'true' }, startedAt: '2024-10-15T08:01:00Z', submittedAt: '2024-10-15T08:28:00Z', isComplete: true },
  { id: 'attempt-3', examId: 'exam-2', studentId: 'student-3', answers: { 'q-9': '3', 'q-10': 'aₙ = a₁ × rⁿ⁻¹', 'q-2': '8', 'q-3': 'false' }, startedAt: '2024-10-15T08:03:00Z', submittedAt: '2024-10-15T08:27:00Z', isComplete: true },
  { id: 'attempt-4', examId: 'exam-4', studentId: 'student-1', answers: { 'q-13': '35', 'q-14': '3', 'q-17': ['Өгүүлэгдэхүүн', 'Өгүүлэхүүн'] }, startedAt: '2024-10-20T13:02:00Z', submittedAt: '2024-10-20T13:35:00Z', isComplete: true },
  { id: 'attempt-5', examId: 'exam-4', studentId: 'student-3', answers: { 'q-13': '35', 'q-14': '4', 'q-17': ['Өгүүлэгдэхүүн', 'Өгүүлэхүүн', 'Тодотгол', 'Нэмэлт', 'Байц'] }, startedAt: '2024-10-20T13:01:00Z', submittedAt: '2024-10-20T13:38:00Z', isComplete: true },
]

const seedResults: Result[] = [
  { id: 'result-1', attemptId: 'attempt-1', studentId: 'student-1', examId: 'exam-2', scorePerQuestion: { 'q-9': 2, 'q-10': 2, 'q-2': 1, 'q-3': 1 }, totalScore: 6, maxScore: 6, isPublished: true },
  { id: 'result-2', attemptId: 'attempt-2', studentId: 'student-2', examId: 'exam-2', scorePerQuestion: { 'q-9': 0, 'q-10': 0, 'q-2': 1, 'q-3': 1 }, totalScore: 2, maxScore: 6, isPublished: true },
  { id: 'result-3', attemptId: 'attempt-3', studentId: 'student-3', examId: 'exam-2', scorePerQuestion: { 'q-9': 2, 'q-10': 2, 'q-2': 0, 'q-3': 0 }, totalScore: 4, maxScore: 6, isPublished: true },
  { id: 'result-4', attemptId: 'attempt-4', studentId: 'student-1', examId: 'exam-4', scorePerQuestion: { 'q-13': 1, 'q-14': 1, 'q-17': 2 }, totalScore: 4, maxScore: 7, isPublished: true },
  { id: 'result-5', attemptId: 'attempt-5', studentId: 'student-3', examId: 'exam-4', scorePerQuestion: { 'q-13': 1, 'q-14': 0, 'q-17': 5 }, totalScore: 6, maxScore: 7, isPublished: true },
]

export function initializeData(): void {
  if (typeof window === 'undefined') return
  
  // Check if already initialized
  if (localStorage.getItem('e_shalgalt_initialized') === 'true') return
  
  // Seed all data
  localStorage.setItem('users', JSON.stringify(seedUsers))
  localStorage.setItem('courses', JSON.stringify(seedCourses))
  localStorage.setItem('classes', JSON.stringify(seedClasses))
  localStorage.setItem('questions', JSON.stringify(seedQuestions))
  localStorage.setItem('exams', JSON.stringify(seedExams))
  localStorage.setItem('schedules', JSON.stringify(seedSchedules))
  localStorage.setItem('attempts', JSON.stringify(seedAttempts))
  localStorage.setItem('results', JSON.stringify(seedResults))
  
  // Mark as initialized
  localStorage.setItem('e_shalgalt_initialized', 'true')
}

// Export seed data for server-side rendering fallback
export const initialUsers = seedUsers
export const initialCourses = seedCourses
export const initialClasses = seedClasses
export const initialQuestions = seedQuestions
export const initialExams = seedExams
export const initialSchedules = seedSchedules
export const initialAttempts = seedAttempts
export const initialResults = seedResults

export type MockTeacher = {
  id: string
  name: string
  subject: string
  email: string
  phone: string
  avatar: string
  examCount: number
  status: 'active' | 'inactive'
}

export type MockStudent = {
  id: string
  name: string
  grade: string
  avatar: string
}

export type MockClass = {
  id: string
  name: string
  grade: string
  teacherId: string
  studentCount: number
  examCount: number
}

export type MockExam = {
  id: string
  title: string
  subject: string
  teacherId: string
  duration: number
  totalQuestions: number
  totalPoints: number
  totalStudents: number
  status: 'draft' | 'scheduled' | 'active' | 'completed'
}

const courseById = new Map(seedCourses.map((course) => [course.id, course]))
const classById = new Map(seedClasses.map((courseClass) => [courseClass.id, courseClass]))
const questionById = new Map(seedQuestions.map((question) => [question.id, question]))

export const mockTeachers: MockTeacher[] = seedUsers
  .filter((user) => user.role === 'teacher')
  .map((teacher, index) => {
    const taughtCourseNames = Array.from(
      new Set(
        seedClasses
          .filter((courseClass) => courseClass.teacherId === teacher.id)
          .map((courseClass) => courseById.get(courseClass.courseId)?.name)
          .filter((courseName): courseName is string => Boolean(courseName))
      )
    )
    const examCount = seedExams.filter((exam) => exam.ownerId === teacher.id).length

    return {
      id: teacher.id,
      name: teacher.name,
      subject: taughtCourseNames.join(', ') || 'Тодорхойгүй',
      email: `${teacher.id}@school.mn`,
      phone: `99${String(index + 1).padStart(6, '0')}`,
      avatar: '',
      examCount,
      status: examCount > 0 ? 'active' : 'inactive',
    }
  })

export const mockStudents: MockStudent[] = seedUsers
  .filter((user) => user.role === 'student')
  .map((student) => {
    const studentClass = seedClasses.find((courseClass) => courseClass.studentIds.includes(student.id))

    return {
      id: student.id,
      name: student.name,
      grade: studentClass ? (courseById.get(studentClass.courseId)?.grade ?? 'Тодорхойгүй') : 'Тодорхойгүй',
      avatar: '',
    }
  })

export const mockClasses: MockClass[] = seedClasses.map((courseClass) => ({
  id: courseClass.id,
  name: courseClass.name,
  grade: courseById.get(courseClass.courseId)?.grade ?? 'Тодорхойгүй',
  teacherId: courseClass.teacherId,
  studentCount: courseClass.studentIds.length,
  examCount: seedSchedules.filter((schedule) => schedule.classId === courseClass.id).length,
}))

export const mockExams: MockExam[] = seedExams.map((exam) => {
  const scheduledStudentIds = new Set(
    seedSchedules
      .filter((schedule) => schedule.examId === exam.id)
      .flatMap((schedule) => classById.get(schedule.classId)?.studentIds ?? [])
  )

  return {
    id: exam.id,
    title: exam.title,
    subject: courseById.get(exam.courseId)?.name ?? 'Тодорхойгүй',
    teacherId: exam.ownerId,
    duration: exam.duration,
    totalQuestions: exam.questionIds.length,
    totalPoints: exam.questionIds.reduce((sum, questionId) => sum + (questionById.get(questionId)?.points ?? 0), 0),
    totalStudents: scheduledStudentIds.size,
    status: exam.status === 'closed' ? 'completed' : exam.status,
  }
})
