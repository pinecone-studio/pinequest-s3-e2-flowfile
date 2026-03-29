import Link from "next/link"

export default function CourseHeader({
  subjectName,
  courseClasses
}: any) {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[14px] mb-4 text-gray-500">
        <Link href="/teacher" className="text-blue-500">
          Хичээлүүд
        </Link>
        <span>/</span>
        <span className="text-black">{subjectName}</span>
      </nav>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold">{subjectName}</h1>

        <span className="px-3 py-1 text-[13px] rounded-full bg-blue-100 text-blue-600">
          {courseClasses.length} анги
        </span>
      </div>
    </>
  )
}