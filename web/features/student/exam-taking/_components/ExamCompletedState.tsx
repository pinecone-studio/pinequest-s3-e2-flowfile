import { CheckCircle2, ChevronLeft } from 'lucide-react'

export function ExamCompletedState({
  title,
  description,
  onBack,
}: {
  title: string
  description: string
  onBack: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-9 flex items-center justify-center bg-page-bg p-6">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={24} className="text-green-600" strokeWidth={1.5} />
        </div>
        <h1 className="mb-2 text-[18px] font-semibold text-foreground">{title}</h1>
        <p className="mb-6 text-[14px] text-text-secondary">{description}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Миний шалгалтууд руу буцах
        </button>
      </div>
    </div>
  )
}
