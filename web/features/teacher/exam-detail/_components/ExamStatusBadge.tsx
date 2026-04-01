type StatusConfig = { label: string; bg: string; color: string }

export function ExamStatusBadge({ statusConfig }: { statusConfig: StatusConfig }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[12px]"
      style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
    >
      {statusConfig.label}
    </span>
  )
}
