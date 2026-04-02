'use client'

import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Video, RefreshCw, Upload, Image as ImageIcon, FileText } from 'lucide-react'
import { uploadAnswerAsset } from '@/lib/api/student-exams'

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function AnswerMediaRecorder({
  mode,
  value,
  onChange,
}: {
  mode: 'audio' | 'video'
  value: string
  onChange: (value: string) => void
}) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!isRecording) {
      return
    }

    const timer = window.setInterval(() => {
      setDurationSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRecording])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === 'video',
      })

      streamRef.current = stream
      chunksRef.current = []
      setDurationSeconds(0)

      if (previewRef.current && mode === 'video') {
        previewRef.current.srcObject = stream
      }

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const mimeType = mode === 'video' ? 'video/webm' : 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const dataUrl = await blobToDataUrl(blob)
        onChange(dataUrl)
        stream.getTracks().forEach((track) => track.stop())
        if (previewRef.current && mode === 'video') {
          previewRef.current.srcObject = null
        }
      }

      recorder.start()
      setIsRecording(true)
    } catch (recorderError) {
      setError(
        recorderError instanceof Error
          ? recorderError.message
          : 'Бичлэг эхлүүлж чадсангүй.',
      )
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const uploaded = await uploadAnswerAsset(file)
      onChange(uploaded.url)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Файл upload хийж чадсангүй.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const canRenderImage = Boolean(
    value &&
      (value.includes('/uploads/') ||
        value.startsWith('data:image/') ||
        /\.(png|jpe?g|webp|gif)$/i.test(value)),
  )

  return (
    <div className="space-y-3 rounded-xl border border-card-border bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90"
          >
            {mode === 'video' ? <Video size={15} strokeWidth={1.5} /> : <Mic size={15} strokeWidth={1.5} />}
            {mode === 'video' ? 'Видео бичиж эхлэх' : 'Дуу бичиж эхлэх'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
          >
            <Square size={14} fill="currentColor" strokeWidth={1.5} />
            Бичлэг зогсоох
          </button>
        )}

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-table-header"
          >
            <RefreshCw size={14} strokeWidth={1.5} />
            Дахин бичих
          </button>
        )}

        <div className="rounded-lg bg-table-header px-3 py-2 text-[12px] font-medium text-text-secondary">
          {isUploading
            ? 'Файл upload хийж байна...'
            : isRecording
              ? `Бичиж байна: ${formatDuration(durationSeconds)}`
              : 'Хадгалах үед автоматаар answer руу орно'}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-table-header">
          <Upload size={14} strokeWidth={1.5} />
          {mode === 'audio' ? 'Аудио файл оруулах' : 'Видео/файл оруулах'}
          <input
            type="file"
            className="hidden"
            accept={mode === 'audio' ? 'audio/*' : 'video/*,application/pdf,.doc,.docx,.zip'}
            onChange={(event) => void handleFileUpload(event.target.files?.[0] ?? null)}
          />
        </label>

        {mode === 'video' && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-table-header">
            <ImageIcon size={14} strokeWidth={1.5} />
            Зураг оруулах
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => void handleFileUpload(event.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {mode === 'audio' && value && <audio controls src={value} className="w-full" />}

      {mode === 'video' && isRecording && (
        <video
          ref={previewRef as MutableRefObject<HTMLVideoElement | null>}
          autoPlay
          muted
          playsInline
          className="h-[240px] w-full rounded-lg bg-black object-cover"
        />
      )}

      {value && mode === 'video' && (
        <video controls src={value} className="h-[240px] w-full rounded-lg bg-black object-cover" />
      )}

      {mode === 'video' && canRenderImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Uploaded answer" className="max-h-[320px] w-full rounded-lg border border-card-border object-contain" />
      )}

      {value &&
        mode === 'video' &&
        !canRenderImage &&
        !value.startsWith('data:video/') &&
        !value.includes('.webm') &&
        !value.includes('.mp4') && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-[13px] font-medium text-primary hover:bg-table-header"
          >
            <FileText size={14} strokeWidth={1.5} />
            Upload хийсэн файл нээх
          </a>
        )}

      {error && <div className="text-[12px] text-red-500">{error}</div>}
    </div>
  )
}
