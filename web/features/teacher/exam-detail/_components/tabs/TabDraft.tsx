import type { TabProps } from '../ExamStatusTabContent'

export function TabDraft({ exam, questions }: TabProps) {
  return (
    <div className="max-w-xl">
      <div className="bg-white border rounded-[10px] p-5 border-l-4" style={{ borderColor: '#DDE1E7', borderLeftColor: '#6366F1' }}>
        <div className="text-[15px] font-semibold mb-1" style={{ color: '#1A1A2E' }}>{exam.title}</div>
        <div className="flex items-center gap-4 text-[13px] mt-2" style={{ color: '#5A6474' }}>
          <span>{questions.length} асуулт</span>
          <span>{exam.duration} минут</span>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-[10px] border-l-4" style={{ backgroundColor: '#EEF2FF', borderLeftColor: '#6366F1', borderColor: '#C7D2FE' }}>
        <div className="text-[13px] font-medium" style={{ color: '#4338CA' }}>
          Шалгалтыг товлохын тулд ангид оноож хуваарилна уу
        </div>
        <div className="text-[12px] mt-1" style={{ color: '#6366F1' }}>
          Шалгалт бэлэн болсон тул хуваарь тохируулж, сурагчдад илгээнэ үү.
        </div>
      </div>
    </div>
  )
}
