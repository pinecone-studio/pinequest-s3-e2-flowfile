import Link from "next/link"

export default function DetailHeader({ exam, cls }: any) {
  return (
    <>
      <Link href="/teacher/grading">← Буцах</Link>
      <h1 className="text-xl font-semibold">{exam.title}</h1>
      <p className="text-sm text-gray-500">{cls.name}</p>
    </>
  )
}