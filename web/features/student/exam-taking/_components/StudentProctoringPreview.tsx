'use client'

import { useEffect, useRef, useState } from 'react'

export function StudentProctoringPreview({
  onVisibilityViolation,
}: {
  onVisibilityViolation?: (type: 'tab_switch' | 'window_blur') => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let isMounted = true

    void navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 320,
          height: 180,
          facingMode: 'user',
        },
        audio: false,
      })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => null)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onVisibilityViolation?.('tab_switch')
      }
    }

    const handleBlur = () => onVisibilityViolation?.('window_blur')

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [onVisibilityViolation])

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setPosition((prev) => {
          if (prev.x !== 0 || prev.y !== 0) {
            return prev
          }

          const width = 184
          const height = 132

          return {
            x: Math.max(12, window.innerWidth - width - 12),
            y: Math.max(104, window.innerHeight - height - 96),
          }
        })
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const clampPosition = (x: number, y: number) => {
    const width = 184
    const height = 132

    return {
      x: Math.min(Math.max(12, x), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(88, y), Math.max(88, window.innerHeight - height - 12)),
    }
  }

  const startDrag = (clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX - position.x, y: clientY - position.y }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!dragStartRef.current) {
      return
    }

    const next = clampPosition(
      clientX - dragStartRef.current.x,
      clientY - dragStartRef.current.y,
    )
    setPosition(next)
  }

  useEffect(() => {
    if (!isMobile) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => moveDrag(event.clientX, event.clientY)
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) {
        return
      }
      moveDrag(touch.clientX, touch.clientY)
    }
    const stopDrag = () => {
      dragStartRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', stopDrag)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', stopDrag)
    }
  }, [isMobile, position.x, position.y])

  if (isMobile) {
    return (
      <div
        className="fixed z-40 overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
        style={{
          left: position.x,
          top: position.y,
          width: 184,
        }}
        onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
        onTouchStart={(event) => {
          const touch = event.touches[0]
          if (!touch) {
            return
          }
          startDrag(touch.clientX, touch.clientY)
        }}
      >
        <div className="flex items-center justify-between bg-black/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">
          <span>Camera</span>
          <span>Move</span>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-[104px] w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-[132px] w-[220px] object-cover"
      />
    </div>
  )
}
