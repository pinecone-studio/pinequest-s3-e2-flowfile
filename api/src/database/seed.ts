import { db } from './client';
import { users } from './schema/users.schema';
import { exams, examEnrollments } from './schema/exams.schema';
import { questions } from './schema/questions.schema';

async function seed() {
  const now = new Date().toISOString();

  // Teacher: Oyun
  await db
    .insert(users)
    .values({
      id: 'demo-teacher-oyun',
      name: 'О. Оюун',
      email: 'oyun@demo.mn',
      clerkUserId: 'dev_oyun_demo_mn',
      role: 'teacher',
      imageUrl: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  // Students: 6 demo students
  const studentData = [
    { id: 'demo-student-1', name: 'Б. Мишээл', email: 'misheel@demo.mn', clerkUserId: 'dev_misheel_demo_mn' },
    { id: 'demo-student-2', name: 'Д. Болд', email: 'bold@demo.mn', clerkUserId: 'dev_bold_demo_mn' },
    { id: 'demo-student-3', name: 'Н. Номин', email: 'nomin@demo.mn', clerkUserId: 'dev_nomin_demo_mn' },
    { id: 'demo-student-4', name: 'Г. Ганболд', email: 'ganbold@demo.mn', clerkUserId: 'dev_ganbold_demo_mn' },
    { id: 'demo-student-5', name: 'Х. Сувд', email: 'suvd@demo.mn', clerkUserId: 'dev_suvd_demo_mn' },
    { id: 'demo-student-6', name: 'Ц. Мөнхбаяр', email: 'munkhbayar@demo.mn', clerkUserId: 'dev_munkhbayar_demo_mn' },
  ];

  for (const s of studentData) {
    await db
      .insert(users)
      .values({ ...s, role: 'student', imageUrl: null, isActive: true, createdAt: now, updatedAt: now })
      .onConflictDoNothing();
  }

  // Demo exam
  await db
    .insert(exams)
    .values({
      id: 'demo-exam-math',
      teacherId: 'demo-teacher-oyun',
      title: 'Математик — 1-р улирлын шалгалт',
      subject: 'МАТ',
      description: 'Демо шалгалт',
      status: 'published',
      durationMinutes: 5,
      shuffleQuestions: false,
      allowCopyPaste: false,
      requireFullscreen: false,
      maxTabSwitches: 3,
      startsAt: new Date(Date.now() - 3600000).toISOString(),
      endsAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  // 5 MCQ questions
  const questionData = [
    { id: 'demo-q1', content: '2 + 2 = ?', optionsJson: '["2","4","6","8"]', correctAnswer: '4' },
    { id: 'demo-q2', content: '10 × 5 = ?', optionsJson: '["40","45","50","55"]', correctAnswer: '50' },
    { id: 'demo-q3', content: 'Монгол улсын нийслэл хот аль нь вэ?', optionsJson: '["Дархан","Эрдэнэт","Улаанбаатар","Чойбалсан"]', correctAnswer: 'Улаанбаатар' },
    { id: 'demo-q4', content: '100 ÷ 4 = ?', optionsJson: '["20","25","30","35"]', correctAnswer: '25' },
    { id: 'demo-q5', content: 'Гурвалжны дотоод өнцгүүдийн нийлбэр хэд вэ?', optionsJson: '["90°","120°","180°","360°"]', correctAnswer: '180°' },
  ];

  for (const [i, q] of questionData.entries()) {
    await db
      .insert(questions)
      .values({
        id: q.id,
        examId: 'demo-exam-math',
        orderIndex: i + 1,
        content: q.content,
        inputType: 'mcq',
        points: 2,
        isRequired: true,
        optionsJson: q.optionsJson,
        correctAnswer: q.correctAnswer,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

  // Enroll all students
  for (const [i, s] of studentData.entries()) {
    await db
      .insert(examEnrollments)
      .values({
        id: `demo-enrollment-${i + 1}`,
        examId: 'demo-exam-math',
        studentId: s.id,
        assignedAt: now,
      })
      .onConflictDoNothing();
  }

  console.log('✓ Seed complete');
  console.log('  Teacher: oyun@demo.mn / dev token: demo-teacher-oyun');
  console.log('  Student: misheel@demo.mn / dev token: demo-student-1');
  console.log('  Exam ID: demo-exam-math');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
