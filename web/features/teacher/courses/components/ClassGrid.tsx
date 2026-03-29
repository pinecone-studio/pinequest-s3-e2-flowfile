import ClassCard from "./ClassCard"

export default function ClassGrid({
  courseClasses,
  subjectColor,
  subjectPattern,
  getUpcomingExamCount
}: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseClasses.map((cls: any) => (
          <ClassCard
            key={cls.id}
            cls={cls}
            subjectColor={subjectColor}
            subjectPattern={subjectPattern}
            upcomingExamCount={getUpcomingExamCount(cls.id)}
          />
        ))}
      </div>

      {courseClasses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Анги бүртгэгдээгүй байна.
        </div>
      )}
    </>
  )
}