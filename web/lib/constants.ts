// lib/constants.ts - Centralized configuration constants for e-Shalgalt

// Course/Subject colors (hex values)
export const COURSE_COLORS: Record<string, string> = {
  'МАТ': '#1D4ED8',   // Math — blue
  'МОН': '#7C3AED',   // Mongolian — purple  
  'ФИЗ': '#0369A1',   // Physics — deep cyan
  'ХИМ': '#065F46',   // Chemistry — forest green
  'БИО': '#92400E',   // Biology — warm brown
  'ТҮҮ': '#9F1239',   // History — burgundy
  'ГАЗ': '#1E40AF',   // Geography — navy variant
  'АНГ': '#374151',   // English — charcoal
  'ДҮР': '#6B21A8',   // Art/Drawing — deep purple
  'МЭД': '#0F766E',   // IT/Computer — teal
  'НИЙ': '#B45309',   // Social studies — amber
  'default': '#1D4ED8'
}

// Subject patterns (CSS SVG data URIs)
export const PATTERNS: Record<string, string> = {
  'МАТ': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23fff' stroke-width='1' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
  'МОН': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='%23fff' stroke-width='1' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
  'ФИЗ': `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23fff' opacity='0.15'/%3E%3C/svg%3E")`,
  'ХИМ': `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z' fill='%23fff' fill-opacity='0.12'/%3E%3C/svg%3E")`,
  'БИО': `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z' fill='%23fff' fill-opacity='0.12'/%3E%3C/svg%3E")`,
  'ТҮҮ': `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23fff' fill-opacity='0.12'/%3E%3C/svg%3E")`,
  'НИЙ': `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23fff' fill-opacity='0.12'/%3E%3C/svg%3E")`,
  'ГАЗ': `url("data:image/svg+xml,%3Csvg width='36' height='72' viewBox='0 0 36 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z' fill='%23fff' fill-opacity='0.12'/%3E%3C/svg%3E")`,
  'АНГ': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='1' fill='none' opacity='0.12'/%3E%3Ccircle cx='30' cy='30' r='4' fill='%23fff' opacity='0.12'/%3E%3C/svg%3E")`,
  'МЭД': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='1' fill='none' opacity='0.12'/%3E%3Ccircle cx='30' cy='30' r='4' fill='%23fff' opacity='0.12'/%3E%3C/svg%3E")`,
  'ДҮР': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0' stroke='%23fff' stroke-width='1' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
  'default': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23fff' stroke-width='1' fill='none' opacity='0.15'/%3E%3C/svg%3E")`
}

// Period times (Mongolian school schedule)
export const PERIODS: Record<number, { start: string; end: string; label: string }> = {
  1: { start: '08:00', end: '08:40', label: '1-р цаг' },
  2: { start: '08:45', end: '09:25', label: '2-р цаг' },
  3: { start: '09:30', end: '10:10', label: '3-р цаг' },
  4: { start: '10:30', end: '11:10', label: '4-р цаг' },  // After big break
  5: { start: '11:15', end: '11:55', label: '5-р цаг' },
  6: { start: '12:00', end: '12:40', label: '6-р цаг' },
  7: { start: '12:45', end: '13:25', label: '7-р цаг' },
  8: { start: '13:30', end: '14:10', label: '8-р цаг' },
}

// Day abbreviations
export const DAY_ABBREV: Record<number, string> = {
  0: 'Да',  // Monday
  1: 'Мя',  // Tuesday
  2: 'Лх',  // Wednesday
  3: 'Пү',  // Thursday
  4: 'Ба',  // Friday
}

export const DAY_FULL: Record<number, string> = {
  0: 'Даваа',
  1: 'Мягмар',
  2: 'Лхагва',
  3: 'Пүрэв',
  4: 'Баасан',
}

// Subject full names
export const SUBJECT_NAMES: Record<string, string> = {
  'МАТ': 'Математик',
  'МОН': 'Монгол хэл',
  'ФИЗ': 'Физик',
  'ХИМ': 'Хими',
  'БИО': 'Биологи',
  'ТҮҮ': 'Түүх',
  'ГАЗ': 'Газар зүй',
  'АНГ': 'Англи хэл',
  'ДҮР': 'Дүрслэх урлаг',
  'МЭД': 'Мэдээллийн технологи',
  'НИЙ': 'Нийгмийн ухаан',
}

// Exam status labels
export const EXAM_STATUS_LABELS: Record<string, string> = {
  'draft': 'Ноорог',
  'private': 'Хувийн',
  'published': 'Нийтэлсэн',
  'scheduled': 'Товлогдсон',
  'active': 'Явагдаж буй',
  'completed': 'Дууссан',
}

// Grading status labels
export const GRADING_STATUS_LABELS: Record<string, string> = {
  'ungraded': 'Үнэлэгдээгүй',
  'partial': 'Хэсэгчлэн үнэлэгдсэн',
  'graded': 'Үнэлэгдсэн',
  'approved': 'Баталгаажсан',
}

// Subject colors with bg color for cards
export const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  'math': { bg: '#1D4ED8', text: '#FFFFFF' },
  'МАТ': { bg: '#1D4ED8', text: '#FFFFFF' },
  'mongolian': { bg: '#7C3AED', text: '#FFFFFF' },
  'МОН': { bg: '#7C3AED', text: '#FFFFFF' },
  'physics': { bg: '#0369A1', text: '#FFFFFF' },
  'ФИЗ': { bg: '#0369A1', text: '#FFFFFF' },
  'chemistry': { bg: '#065F46', text: '#FFFFFF' },
  'ХИМ': { bg: '#065F46', text: '#FFFFFF' },
  'biology': { bg: '#92400E', text: '#FFFFFF' },
  'БИО': { bg: '#92400E', text: '#FFFFFF' },
  'history': { bg: '#9F1239', text: '#FFFFFF' },
  'ТҮҮ': { bg: '#9F1239', text: '#FFFFFF' },
  'geography': { bg: '#1E40AF', text: '#FFFFFF' },
  'ГАЗ': { bg: '#1E40AF', text: '#FFFFFF' },
  'english': { bg: '#374151', text: '#FFFFFF' },
  'АНГ': { bg: '#374151', text: '#FFFFFF' },
  'default': { bg: '#1D4ED8', text: '#FFFFFF' },
}

// Status configuration for exam assignments
export const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  'scheduled': { label: 'Товлогдсон', bg: '#FEF3C7', color: '#B45309' },
  'active': { label: 'Идэвхтэй', bg: '#D1FAE5', color: '#059669' },
  'completed': { label: 'Дууссан', bg: '#E0E7FF', color: '#4F46E5' },
  'closed': { label: 'Хаагдсан', bg: '#F3F4F6', color: '#6B7280' },
}

// Question type configuration for display
export const QUESTION_TYPE_CONFIG: Record<string, { label: string; icon?: string }> = {
  'single': { label: 'Нэг сонголт' },
  'multiple': { label: 'Олон сонголт' },
  'truefalse': { label: 'Үнэн/Худал' },
  'matching': { label: 'Тааруулах' },
  'short': { label: 'Богино хариулт' },
  'long': { label: 'Урт хариулт' },
  'formula': { label: 'Томъёо' },
  'chemistry': { label: 'Химийн бүтэц' },
  'code': { label: 'Код' },
  'voice': { label: 'Дуу бичлэг' },
  'video': { label: 'Видео бичлэг' },
  'handwritten': { label: 'Гараар зурсан/медиа' },
  'fillblank': { label: 'Нөхөх' },
  'essay': { label: 'Эссэ' },
  'ordering': { label: 'Дараалал' },
}
