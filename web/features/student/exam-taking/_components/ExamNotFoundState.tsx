import { AlertTriangle, ChevronLeft } from 'lucide-react'

export function ExamNotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 bg-page-bg flex items-center justify-center p-6"
      style={{ top: 'var(--platform-switcher-height)' }}
    >
      <div className="bg-white border border-card-border rounded-2xl p-8 text-center max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-amber-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-[18px] font-semibold text-foreground mb-2">Шалгалт олдсонгүй</h1>
        <p className="text-[14px] text-text-secondary mb-6">
          Энэ холбоос хүчингүй болсон эсвэл шалгалтын мэдээлэл дутуу байна.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Миний шалгалтууд руу буцах
        </button>
      </div>
    </div>
  )
}
