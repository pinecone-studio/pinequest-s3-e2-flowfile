'use client'

import { useEffect, useState } from 'react'
import { Loader2, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StudentQrEntryGate({
  defaultName = '',
  defaultClassName = '',
  isSubmitting = false,
  onSubmit,
}: {
  defaultName?: string
  defaultClassName?: string
  isSubmitting?: boolean
  onSubmit: (payload: { name: string; className: string }) => void | Promise<void>
}) {
  const [name, setName] = useState(defaultName)
  const [className, setClassName] = useState(defaultClassName)

  useEffect(() => {
    setName(defaultName)
  }, [defaultName])

  useEffect(() => {
    setClassName(defaultClassName)
  }, [defaultClassName])

  const isDisabled = isSubmitting || !name.trim() || !className.trim()

  return (
    <div
      className="min-h-screen bg-page-bg px-4 pb-10"
      style={{ paddingTop: 'calc(var(--platform-switcher-height) + 1.5rem)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-var(--platform-switcher-height)-1.5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full max-w-xl rounded-[28px] border border-card-border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF5FF] text-[#0066FF]">
              <QrCode size={24} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-foreground">
                Шалгалтад орохын өмнө мэдээллээ оруулна уу
              </h1>
              <p className="text-[13px] text-text-secondary">
                Нэр болон ангиа оруулаад шалгалтаа эхлүүлнэ.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-student-name">Нэр</Label>
              <Input
                id="qr-student-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Жишээ: Б. Номин"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-student-class">Анги</Label>
              <Input
                id="qr-student-class"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Жишээ: 10-1"
                className="h-11"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onSubmit({ name, className })}
            disabled={isDisabled}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" strokeWidth={1.8} />}
            Шалгалт эхлэх
          </button>
        </div>
      </div>
    </div>
  )
}
