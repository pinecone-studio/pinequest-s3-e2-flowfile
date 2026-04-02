'use client'

import dynamic from 'next/dynamic'

const ChemistryEditorClient = dynamic(
  () => import('./ChemistryEditorClient').then((mod) => mod.ChemistryEditorClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-card-border bg-white text-[14px] text-text-secondary">
        Chemistry editor ачааллаж байна...
      </div>
    ),
  },
)

export function AnswerChemistry({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return <ChemistryEditorClient value={value} onChange={onChange} />
}
