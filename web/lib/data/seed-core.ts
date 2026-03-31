import type { User, Subject, Course, SchoolClass, Question, Schedule } from '@/lib/types'

export const seedSubjects: Subject[] = [
  { id: 'МАТ', name: 'Математик', colorKey: 'МАТ', patternKey: 'МАТ', hoursPerWeek: 4 },
  { id: 'МОН', name: 'Монгол хэл', colorKey: 'МОН', patternKey: 'МОН', hoursPerWeek: 4 },
  { id: 'ФИЗ', name: 'Физик', colorKey: 'ФИЗ', patternKey: 'ФИЗ', hoursPerWeek: 3 },
  { id: 'ХИМ', name: 'Хими', colorKey: 'ХИМ', patternKey: 'ХИМ', hoursPerWeek: 2 },
  { id: 'БИО', name: 'Биологи', colorKey: 'БИО', patternKey: 'БИО', hoursPerWeek: 2 },
  { id: 'ТҮҮ', name: 'Түүх', colorKey: 'ТҮҮ', patternKey: 'ТҮҮ', hoursPerWeek: 2 },
  { id: 'АНГ', name: 'Англи хэл', colorKey: 'АНГ', patternKey: 'АНГ', hoursPerWeek: 3 },
  { id: 'МЭД', name: 'Мэдээллийн технологи', colorKey: 'МЭД', patternKey: 'МЭД', hoursPerWeek: 2 },
  { id: 'НИЙ', name: 'Нийгмийн ухаан', colorKey: 'НИЙ', patternKey: 'НИЙ', hoursPerWeek: 2 },
  { id: 'ДҮР', name: 'Дүрслэх урлаг', colorKey: 'ДҮР', patternKey: 'ДҮР', hoursPerWeek: 1 },
]

export const seedUsers: User[] = [
  // Teachers (realistic subject combinations)
  { id: 'T001', name: 'Д. Болормаа', role: 'teacher', avatarInitials: 'ДБ', subjectIds: ['МОН'], classIds: ['C07-1', 'C07-2', 'C07-3'] },
  { id: 'T002', name: 'Г. Мөнхбаяр', role: 'teacher', avatarInitials: 'ГМ', subjectIds: ['МАТ'], classIds: ['C07-1', 'C07-2', 'C08-1', 'C08-2'] },
  { id: 'T003', name: 'Б. Цэцэгмаа', role: 'teacher', avatarInitials: 'БЦ', subjectIds: ['МАТ', 'МЭД'], classIds: ['C09-1', 'C09-2', 'C10-1', 'C10-2'] },
  { id: 'T004', name: 'О. Энхбаяр', role: 'teacher', avatarInitials: 'ОЭ', subjectIds: ['ФИЗ'], classIds: ['C10-1', 'C10-2', 'C11-1'] },
  { id: 'T005', name: 'Н. Ариунаа', role: 'teacher', avatarInitials: 'НА', subjectIds: ['ХИМ', 'БИО'], classIds: ['C09-1', 'C09-2', 'C10-1', 'C10-2'] },
  { id: 'T006', name: 'С. Батзориг', role: 'teacher', avatarInitials: 'СБ', subjectIds: ['ТҮҮ', 'НИЙ'], classIds: ['C08-1', 'C08-2', 'C09-1', 'C09-2'] },
  { id: 'T007', name: 'Д. Солонго', role: 'teacher', avatarInitials: 'ДС', subjectIds: ['АНГ'], classIds: ['C08-1', 'C08-2', 'C09-1', 'C10-1'] },
  { id: 'T008', name: 'Х. Мөнхсүрэн', role: 'teacher', avatarInitials: 'ХМ', subjectIds: ['ДҮР'], classIds: ['C07-1', 'C07-2', 'C08-1', 'C08-2'] },
  
  // Admin
  { id: 'A001', name: 'Э. Түмэнбаяр', role: 'admin', avatarInitials: 'ЭТ' },
  
  // Students (Grade 10, Class 1 - sample 25 students)
  { id: 'S1011001', name: 'Б. Болд', role: 'student', avatarInitials: 'ББ', classIds: ['C10-1'] },
  { id: 'S1011002', name: 'Н. Номин', role: 'student', avatarInitials: 'НН', classIds: ['C10-1'] },
  { id: 'S1011003', name: 'Э. Энхбаяр', role: 'student', avatarInitials: 'ЭЭ', classIds: ['C10-1'] },
  { id: 'S1011004', name: 'Ц. Цэцэгмаа', role: 'student', avatarInitials: 'ЦЦ', classIds: ['C10-1'] },
  { id: 'S1011005', name: 'Г. Ганбаяр', role: 'student', avatarInitials: 'ГГ', classIds: ['C10-1'] },
  { id: 'S1011006', name: 'Д. Дэлгэрмаа', role: 'student', avatarInitials: 'ДД', classIds: ['C10-1'] },
  { id: 'S1011007', name: 'М. Мөнхбат', role: 'student', avatarInitials: 'ММ', classIds: ['C10-1'] },
  { id: 'S1011008', name: 'С. Солонго', role: 'student', avatarInitials: 'СС', classIds: ['C10-1'] },
  { id: 'S1011009', name: 'Б. Батзориг', role: 'student', avatarInitials: 'ББ', classIds: ['C10-1'] },
  { id: 'S1011010', name: 'У. Уранчимэг', role: 'student', avatarInitials: 'УУ', classIds: ['C10-1'] },
  { id: 'S1011011', name: 'Т. Төгөлдөр', role: 'student', avatarInitials: 'ТТ', classIds: ['C10-1'] },
  { id: 'S1011012', name: 'Н. Наранцэцэг', role: 'student', avatarInitials: 'НН', classIds: ['C10-1'] },
  { id: 'S1011013', name: 'Б. Бат-Эрдэнэ', role: 'student', avatarInitials: 'ББ', classIds: ['C10-1'] },
  { id: 'S1011014', name: 'Х. Хонгорзул', role: 'student', avatarInitials: 'ХХ', classIds: ['C10-1'] },
  { id: 'S1011015', name: 'А. Анхбаяр', role: 'student', avatarInitials: 'АА', classIds: ['C10-1'] },
  { id: 'S1011016', name: 'Т. Тунгалаг', role: 'student', avatarInitials: 'ТТ', classIds: ['C10-1'] },
  { id: 'S1011017', name: 'Э. Эрдэнэбаяр', role: 'student', avatarInitials: 'ЭЭ', classIds: ['C10-1'] },
  { id: 'S1011018', name: 'М. Мөнхтуяа', role: 'student', avatarInitials: 'ММ', classIds: ['C10-1'] },
  { id: 'S1011019', name: 'Б. Баатарсүрэн', role: 'student', avatarInitials: 'ББ', classIds: ['C10-1'] },
  { id: 'S1011020', name: 'Ц. Цэндсүрэн', role: 'student', avatarInitials: 'ЦЦ', classIds: ['C10-1'] },
  { id: 'S1011021', name: 'О. Оюунчимэг', role: 'student', avatarInitials: 'ОО', classIds: ['C10-1'] },
  { id: 'S1011022', name: 'Д. Даваасүрэн', role: 'student', avatarInitials: 'ДД', classIds: ['C10-1'] },
  { id: 'S1011023', name: 'Б. Батбаяр', role: 'student', avatarInitials: 'ББ', classIds: ['C10-1'] },
  { id: 'S1011024', name: 'Э. Энхжин', role: 'student', avatarInitials: 'ЭЭ', classIds: ['C10-1'] },
  { id: 'S1011025', name: 'Г. Ганзориг', role: 'student', avatarInitials: 'ГГ', classIds: ['C10-1'] },
  
  // Students Grade 10, Class 2 - sample 24 students
  { id: 'S1021001', name: 'А. Алтанцэцэг', role: 'student', avatarInitials: 'АА', classIds: ['C10-2'] },
  { id: 'S1021002', name: 'Б. Бямбадорж', role: 'student', avatarInitials: 'ББ', classIds: ['C10-2'] },
  { id: 'S1021003', name: 'Ц. Цогтбаатар', role: 'student', avatarInitials: 'ЦЦ', classIds: ['C10-2'] },
  { id: 'S1021004', name: 'Д. Дөлгөөн', role: 'student', avatarInitials: 'ДД', classIds: ['C10-2'] },
  { id: 'S1021005', name: 'Э. Эрдэнэцэцэг', role: 'student', avatarInitials: 'ЭЭ', classIds: ['C10-2'] },
]

export const seedClasses: SchoolClass[] = [
  { id: 'C07-1', grade: 7, classNumber: 1, name: '7-1-р анги', studentIds: [], homeroomTeacherId: 'T001' },
  { id: 'C07-2', grade: 7, classNumber: 2, name: '7-2-р анги', studentIds: [], homeroomTeacherId: 'T008' },
  { id: 'C07-3', grade: 7, classNumber: 3, name: '7-3-р анги', studentIds: [], homeroomTeacherId: 'T002' },
  { id: 'C08-1', grade: 8, classNumber: 1, name: '8-1-р анги', studentIds: [], homeroomTeacherId: 'T006' },
  { id: 'C08-2', grade: 8, classNumber: 2, name: '8-2-р анги', studentIds: [], homeroomTeacherId: 'T007' },
  { id: 'C08-3', grade: 8, classNumber: 3, name: '8-3-р анги', studentIds: [], homeroomTeacherId: 'T002' },
  { id: 'C09-1', grade: 9, classNumber: 1, name: '9-1-р анги', studentIds: [], homeroomTeacherId: 'T003' },
  { id: 'C09-2', grade: 9, classNumber: 2, name: '9-2-р анги', studentIds: [], homeroomTeacherId: 'T005' },
  { id: 'C10-1', grade: 10, classNumber: 1, name: '10-1-р анги', studentIds: ['S1011001','S1011002','S1011003','S1011004','S1011005','S1011006','S1011007','S1011008','S1011009','S1011010','S1011011','S1011012','S1011013','S1011014','S1011015','S1011016','S1011017','S1011018','S1011019','S1011020','S1011021','S1011022','S1011023','S1011024','S1011025'], homeroomTeacherId: 'T003' },
  { id: 'C10-2', grade: 10, classNumber: 2, name: '10-2-р анги', studentIds: ['S1021001','S1021002','S1021003','S1021004','S1021005'], homeroomTeacherId: 'T004' },
  { id: 'C11-1', grade: 11, classNumber: 1, name: '11-1-р анги', studentIds: [], homeroomTeacherId: 'T004' },
]

export const seedCourses: Course[] = [
  // T003 - Б. Цэцэгмаа teaches Math to grades 9, 10
  { id: 'CRS-MAT-9', subjectId: 'МАТ', grade: 9, year: '2024–2025', teacherId: 'T003', classIds: ['C09-1', 'C09-2'] },
  { id: 'CRS-MAT-10', subjectId: 'МАТ', grade: 10, year: '2024–2025', teacherId: 'T003', classIds: ['C10-1', 'C10-2'] },
  { id: 'CRS-MED-10', subjectId: 'МЭД', grade: 10, year: '2024–2025', teacherId: 'T003', classIds: ['C10-1', 'C10-2'] },
  
  // T004 - О. Энхбаяр teaches Physics
  { id: 'CRS-FIZ-10', subjectId: 'ФИЗ', grade: 10, year: '2024–2025', teacherId: 'T004', classIds: ['C10-1', 'C10-2'] },
  { id: 'CRS-FIZ-11', subjectId: 'ФИЗ', grade: 11, year: '2024–2025', teacherId: 'T004', classIds: ['C11-1'] },
  
  // T005 - Н. Ариунаа teaches Chemistry & Biology
  { id: 'CRS-HIM-10', subjectId: 'ХИМ', grade: 10, year: '2024–2025', teacherId: 'T005', classIds: ['C10-1', 'C10-2'] },
  { id: 'CRS-BIO-10', subjectId: 'БИО', grade: 10, year: '2024–2025', teacherId: 'T005', classIds: ['C10-1', 'C10-2'] },
]

export const seedSchedules: Schedule[] = [
  { classId: 'C10-1', subjectId: 'МАТ', teacherId: 'T003', periods: [{ day: 0, periodNumber: 3 }, { day: 2, periodNumber: 3 }] },
  { classId: 'C10-2', subjectId: 'МАТ', teacherId: 'T003', periods: [{ day: 1, periodNumber: 2 }, { day: 3, periodNumber: 2 }] },
  { classId: 'C10-1', subjectId: 'ФИЗ', teacherId: 'T004', periods: [{ day: 1, periodNumber: 4 }, { day: 4, periodNumber: 1 }] },
  { classId: 'C10-2', subjectId: 'ФИЗ', teacherId: 'T004', periods: [{ day: 0, periodNumber: 5 }, { day: 3, periodNumber: 4 }] },
  { classId: 'C10-1', subjectId: 'ХИМ', teacherId: 'T005', periods: [{ day: 2, periodNumber: 5 }] },
  { classId: 'C10-1', subjectId: 'МЭД', teacherId: 'T003', periods: [{ day: 4, periodNumber: 6 }] },
]

export const seedQuestions: Question[] = [
  // Math questions
  { id: 'Q001', examId: 'E25МАТ0001', text: 'Квадрат тэгшитгэлийн ерөнхий томъёо аль нь вэ?', type: 'single', options: ['ax² + bx + c = 0', 'ax + b = 0', 'a/x + b = 0', 'ax³ + bx = 0'], correctAnswer: 'ax² + bx + c = 0', points: 2, order: 1, isManualGrade: false },
  { id: 'Q002', examId: 'E25МАТ0001', text: '2 + 2 × 2 = ?', type: 'single', options: ['6', '8', '4', '10'], correctAnswer: '6', points: 1, order: 2, isManualGrade: false },
  { id: 'Q003', examId: 'E25МАТ0001', text: 'Пифагорын теорем: a² + b² = c²', type: 'truefalse', correctAnswer: 'true', points: 1, order: 3, isManualGrade: false },
  { id: 'Q004', examId: 'E25МАТ0001', text: 'Дараах тоонуудаас аль нь анхны тоо вэ?', type: 'multiple', options: ['2', '4', '7', '9', '11'], correctAnswer: ['2', '7', '11'], points: 3, order: 4, isManualGrade: false },
  { id: 'Q005', examId: 'E25МАТ0001', text: 'sin(90°) утгыг олно уу.', type: 'short', correctAnswer: '1', points: 2, order: 5, isManualGrade: false },
  { id: 'Q006', examId: 'E25МАТ0001', text: 'Квадрат функцийн графикийг зураад тайлбарла.', type: 'long', points: 5, order: 6, isManualGrade: true },
  { id: 'Q007', examId: 'E25МАТ0001', text: 'Квадрат язгуурын томъёог бичнэ үү.', type: 'formula', points: 3, order: 7, isManualGrade: true },
  { id: 'Q008', examId: 'E25МАТ0001', text: 'Тэгшитгэлүүдийг тохирох хариутай нь тааруулна уу.', type: 'matching', matchingPairs: [{ left: 'x² = 4', right: 'x = ±2' }, { left: 'x + 5 = 10', right: 'x = 5' }, { left: '2x = 8', right: 'x = 4' }], points: 3, order: 8, isManualGrade: false },
  { id: 'Q009', examId: 'E25МАТ0001', text: 'log₂(8) утгыг олно уу.', type: 'single', options: ['2', '3', '4', '8'], correctAnswer: '3', points: 2, order: 9, isManualGrade: false },
  { id: 'Q010', examId: 'E25МАТ0001', text: 'Геометр прогрессийн ерөнхий гишүүний томъёог бичнэ үү.', type: 'short', correctAnswer: 'aₙ = a₁ × rⁿ⁻¹', points: 2, order: 10, isManualGrade: false },
  
  // Physics questions
  { id: 'Q011', examId: 'E25ФИЗ0001', text: 'Ньютоны хоёрдугаар хууль аль нь вэ?', type: 'single', options: ['F = ma', 'E = mc²', 'V = IR', 'P = W/t'], correctAnswer: 'F = ma', points: 2, order: 1, isManualGrade: false },
  { id: 'Q012', examId: 'E25ФИЗ0001', text: 'Гравитацийн хурдатгал ойролцоогоор 9.8 м/с² байдаг.', type: 'truefalse', correctAnswer: 'true', points: 1, order: 2, isManualGrade: false },
  { id: 'Q013', examId: 'E25ФИЗ0001', text: 'Дараах нэгжүүдээс аль нь хүчний нэгж вэ?', type: 'single', options: ['Ньютон', 'Жоуль', 'Ватт', 'Паскаль'], correctAnswer: 'Ньютон', points: 1, order: 3, isManualGrade: false },
  { id: 'Q014', examId: 'E25ФИЗ0001', text: 'Кинетик энергийн томъёог бичнэ үү.', type: 'formula', points: 2, order: 4, isManualGrade: true },
  { id: 'Q015', examId: 'E25ФИЗ0001', text: 'Термодинамикийн хоёрдугаар хуулийг тайлбарлана уу.', type: 'long', points: 5, order: 5, isManualGrade: true },
]
