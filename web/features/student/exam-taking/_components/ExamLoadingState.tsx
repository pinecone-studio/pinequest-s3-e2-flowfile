export function ExamLoadingState() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 bg-page-bg flex items-center justify-center"
      style={{ top: 'var(--platform-switcher-height)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-text-secondary text-[14px]">Шалгалт ачааллаж байна...</div>
      </div>
    </div>
  )
}
