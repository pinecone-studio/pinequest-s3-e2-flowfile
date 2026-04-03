'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Copy, ExternalLink, QrCode } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  buildQrCodeUrl,
  buildStudentExamShareUrl,
  isLocalShareUrl,
  resolvePublicAppOrigin,
} from '@/lib/share-links'

export function ExamShareCard({
  examId,
  title,
  subjectName,
  questionCount,
  durationMinutes,
  anchorId,
}: {
  examId: string
  title: string
  subjectName?: string
  questionCount?: number
  durationMinutes?: number
  anchorId?: string
}) {
  const [origin, setOrigin] = useState(resolvePublicAppOrigin)

  useEffect(() => {
    setOrigin(resolvePublicAppOrigin())
  }, [])

  const shareUrl = useMemo(
    () => buildStudentExamShareUrl(examId, origin),
    [examId, origin],
  )
  const qrCodeUrl = useMemo(() => buildQrCodeUrl(shareUrl), [shareUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Шалгалтын холбоос хуулагдлаа',
        description: 'QR уншуулахгүйгээр шууд холбоосоор тарааж болно.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Холбоос хуулах боломжгүй байна',
        description: 'Clipboard зөвшөөрлөө шалгаад дахин оролдоно уу.',
      })
    }
  }

  const showsLocalWarning = isLocalShareUrl(shareUrl)

  return (
    <div
      id={anchorId}
      className="rounded-[14px] border bg-white p-5"
      style={{ borderColor: '#DDE1E7' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <QrCode size={18} strokeWidth={1.8} style={{ color: '#0066FF' }} />
        <h2 className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>
          QR код
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div
          className="rounded-[18px] border p-4"
          style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
        >
          <div className="mx-auto w-full max-w-[220px] rounded-[14px] bg-white">
            <Image
              src={qrCodeUrl}
              alt={`${title} QR код`}
              width={220}
              height={220}
              className="h-auto w-full rounded-[14px] bg-white"
              unoptimized
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div
              className="text-[17px] font-semibold"
              style={{ color: '#1A1A2E' }}
            >
              {title}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              {subjectName && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}
                >
                  {subjectName}
                </span>
              )}
              {typeof questionCount === 'number' && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}
                >
                  {questionCount} асуулт
                </span>
              )}
              {typeof durationMinutes === 'number' && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}
                >
                  {durationMinutes} минут
                </span>
              )}
            </div>
          </div>

          <div
            className="break-all rounded-xl border px-3.5 py-3 text-[12px]"
            style={{
              borderColor: '#E6EAF0',
              backgroundColor: '#FAFBFD',
              color: '#1A1A2E',
            }}
          >
            {shareUrl}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-medium"
              style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
            >
              <Copy size={14} strokeWidth={1.8} />
              Холбоос хуулах
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
              style={{ backgroundColor: '#1A7A4A' }}
            >
              <ExternalLink size={14} strokeWidth={1.8} />
              Шалгалтыг нээх
            </a>
          </div>

          {showsLocalWarning && (
            <p className="text-[12px]" style={{ color: '#B45309' }}>
              Энэ холбоос өөр төхөөрөмж дээр шууд нээгдэхгүй байж магадгүй.
              Утсаар scan хийх бол нийтэд нээгдэх хаяг ашиглаарай.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
