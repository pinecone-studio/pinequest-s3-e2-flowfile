import type { Exam } from '@/lib/types'

import { seedExamsPartA } from './seed-exams-part-a'
import { seedExamsPartB } from './seed-exams-part-b'

export const seedExams: Exam[] = [...seedExamsPartA, ...seedExamsPartB]
