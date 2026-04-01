import React, { type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuestionTabFile({ importingFile, importFileName, onFileUpload, onFolderUpload }: {
  importingFile: boolean; importFileName: string
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void; onFolderUpload: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6">
      <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center"><Upload size={20} className="text-white" strokeWidth={1.5} /></div>
        <div><h3 className="text-[15px] font-semibold text-foreground">Файлаас асуулт импортлох</h3><p className="text-[13px] text-text-secondary">Файл эсвэл хавтаснаас асуултуудыг автоматаар таньж редакторт нэмнэ</p></div>
      </div>
      <div className="rounded-lg border border-dashed border-input-border bg-table-header/40 p-6 text-center">
        <input id="question-file-upload" type="file" accept="*/*" onChange={onFileUpload} className="hidden" disabled={importingFile} multiple />
        <input id="question-folder-upload" type="file" onChange={onFolderUpload} className="hidden" disabled={importingFile} multiple {...({ webkitdirectory: 'true', directory: 'true' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)} />
        <div className="flex items-center justify-center gap-3">
          <label htmlFor="question-file-upload" className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors', importingFile ? 'bg-muted text-text-secondary cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 cursor-pointer')}><Upload size={16} strokeWidth={1.5} />Файл сонгох</label>
          <label htmlFor="question-folder-upload" className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors border', importingFile ? 'bg-white border-card-border text-text-secondary cursor-not-allowed' : 'bg-white border-card-border text-foreground hover:bg-table-header cursor-pointer')}><Upload size={16} strokeWidth={1.5} />Хавтас сонгох</label>
        </div>
        <p className="mt-3 text-[13px] text-text-secondary">Сонгосон файл эсвэл хавтас дээр үндэслэн асуулт, төрөл, зөв хариулт, оноог автоматаар бөглөнө.</p>
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
