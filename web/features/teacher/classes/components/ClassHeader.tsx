import Link from "next/link"

export default function ClassHeader({ cls }: any) {
  return (
    <>
      <Link href="/teacher" className="text-blue-500 text-sm mb-4 inline-block">
        ← Хичээлүүд
      </Link>

      <h1 className="text-[22px] font-semibold mb-6">
        {cls.name}
      </h1>
    </>
  )
}