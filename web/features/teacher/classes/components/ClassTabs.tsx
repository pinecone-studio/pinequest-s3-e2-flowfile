import { cn } from "@/lib/utils"

export default function ClassTabs({ activeTab, setActiveTab, classStudents }: any) {
  return (
    <div className="border-b mb-6">
      <div className="flex gap-6">
        <button
          onClick={() => setActiveTab('exams')}
          className={cn("pb-3 border-b-2", activeTab === 'exams' && "text-blue-500")}
        >
          Шалгалтууд
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={cn("pb-3 border-b-2", activeTab === 'students' && "text-blue-500")}
        >
          Сурагчид ({classStudents.length})
        </button>
      </div>
    </div>
  )
}