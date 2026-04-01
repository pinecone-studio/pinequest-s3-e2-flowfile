import { AlertTriangle } from 'lucide-react'

interface SubmitModalProps {
  isOpen: boolean
  answeredCount: number
  unansweredCount: number
  markedCount: number
  onCancel: () => void
  onConfirm: () => void
}

export function SubmitModal({
  isOpen,
  answeredCount,
  unansweredCount,
  markedCount,
  onCancel,
  onConfirm,
}: SubmitModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-2xl shadow-xl z-50 overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-amber-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-[18px] font-bold text-foreground text-center mb-2">Шалгалтыг дуусгах уу?</h2>
          <p className="text-[14px] text-text-secondary text-center mb-6">
            Дуусгасны дараа хариултаа засах боломжгүй болно.
          </p>

          <div className="bg-table-header rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Хариулсан</span>
              <span className="font-semibold text-green-600">{answeredCount} асуулт</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Хариулаагүй</span>
              <span className="font-semibold text-red-500">{unansweredCount} асуулт</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Тэмдэглэсэн</span>
              <span className="font-semibold text-amber-600">{markedCount} асуулт</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-card-border text-foreground text-[14px] font-medium rounded-xl hover:bg-table-header transition-colors"
            >
              Буцах
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-primary text-white text-[14px] font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Дуусгах
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
