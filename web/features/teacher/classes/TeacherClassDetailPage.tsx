'use client'

import { useClassDetail } from "@/hooks/useClassDetail"
import ClassHeader from "./components/ClassHeader"
import ClassTabs from "./components/ClassTabs"
import ExamsTab from "./components/ExamsTab"
import StudentsTab from "./components/StudentsTab"



export default function TeacherClassDetailPage({ id }: { id: string }) {
  const data = useClassDetail(id)

  if (!data.cls) {
    return <div className="p-6">Анги олдсонгүй</div>
  }

  return (
    <div className="p-6">
      <ClassHeader {...data} />
      <ClassTabs {...data} />

      {data.activeTab === 'exams' && <ExamsTab {...data} />}
      {data.activeTab === 'students' && <StudentsTab {...data} />}
    </div>
  )
}