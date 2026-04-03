import React, { type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function QuestionTabFile({ importingFile, importFileName, answerInput, onAnswerInput, onFileUpload, onFolderUpload }: {
  importingFile: boolean; importFileName: string
  answerInput: string
  onAnswerInput: (value: string) => void
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void; onFolderUpload: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6">
      <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center"><Upload size={20} className="text-white" strokeWidth={1.5} /></div>
        <div><h3 className="text-[15px] font-semibold text-foreground">Файлаас асуулт импортлох</h3><p className="text-[13px] text-text-secondary">Файл оруулаад асуултаа нэмнэ.</p></div>
      </div>

      <div className="rounded-lg border border-dashed border-input-border bg-table-header/40 p-6">
        <input id="question-file-upload" type="file" accept="*/*" onChange={onFileUpload} className="hidden" disabled={importingFile} multiple />
        <input id="question-folder-upload" type="file" onChange={onFolderUpload} className="hidden" disabled={importingFile} multiple {...({ webkitdirectory: 'true', directory: 'true' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)} />
        <div className="mb-5 flex items-center justify-center gap-3">
          <label htmlFor="question-file-upload" className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors', importingFile ? 'bg-muted text-text-secondary cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 cursor-pointer')}><Upload size={16} strokeWidth={1.5} />Файл сонгох</label>
        </div>

        <div className="rounded-xl border border-card-border bg-white p-4">
          <label className="mb-2 block text-[13px] font-medium text-foreground">
            Хариулт оруулах
          </label>
          <Textarea
            value={answerInput}
            onChange={(event) => onAnswerInput(event.target.value)}
            rows={8}
            placeholder={'1A\n2B\n3Үнэн\n4x=2'}
            className="min-h-[180px] resize-none border-input-border bg-white px-3.5 py-3 text-[14px]"
          />
          <p className="mt-2 text-[12px] text-text-secondary">
            `1A`, `2:B`, `3=Үнэн`, `4 x=2` хэлбэрээр оруулбал импортолсон асуултуудад автоматаар холбоно.
          </p>
        </div>
      </div>

      {(importingFile || importFileName) && (
        <div className="mt-4 rounded-lg border border-card-border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div>
              <p className="text-[13px] font-medium text-foreground">{importFileName || 'Файл боловсруулж байна'}</p>
              <p className="text-[12px] text-text-secondary">Файлыг уншаад асуултын бүтэц рүү хөрвүүлж байна...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
