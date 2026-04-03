'use client'

import { memo, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { StudentProctoringViolationType } from '@/lib/api/student-exams'

type FacePoint = {
  x: number
  y: number
}

type DetectedLandmark = {
  type?: string
  x?: number
  y?: number
  locations?: FacePoint[]
}

type DetectedFace = {
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks?: DetectedLandmark[]
}

type BrowserFaceDetector = {
  detect: (input: ImageBitmapSource) => Promise<DetectedFace[]>
}

type BrowserFaceDetectorConstructor = new (options?: {
  fastMode?: boolean
  maxDetectedFaces?: number
}) => BrowserFaceDetector

type BrowserNavigator = Navigator & {
  deviceMemory?: number
}

type ProctoringPreviewStatus =
  | 'camera'
  | 'tracking'
  | 'unsupported'
  | 'face_not_detected'
  | 'multiple_faces_detected'
  | 'looking_left'
  | 'looking_right'
  | 'looking_up'
  | 'looking_down'

type ProctoringAlertType = Extract<
  StudentProctoringViolationType,
  | 'face_not_detected'
  | 'multiple_faces_detected'
  | 'looking_left'
  | 'looking_right'
  | 'looking_up'
  | 'looking_down'
>

type LookDirection = Extract<
  StudentProctoringViolationType,
  'looking_left' | 'looking_right' | 'looking_up' | 'looking_down'
>

type StudentProctoringPreviewProps = {
  onProctoringViolation?: (
    violation:
      | StudentProctoringViolationType
      | {
          type: StudentProctoringViolationType
          details?: string
          metadata?: Record<string, string | number | boolean | null>
        },
  ) => void
}

declare global {
  interface Window {
    FaceDetector?: BrowserFaceDetectorConstructor
  }
}

const STATUS_LABELS: Record<ProctoringPreviewStatus, string> = {
  camera: 'Camera',
  tracking: 'Tracking',
  unsupported: 'Camera only',
  face_not_detected: 'Face missing',
  multiple_faces_detected: 'Multiple faces',
  looking_left: 'Looking left',
  looking_right: 'Looking right',
  looking_up: 'Looking up',
  looking_down: 'Looking down',
}

const ANALYSIS_INTERVAL_MS = 3000
const SUSTAINED_ALERT_FRAMES = 2
const DETECTION_CANVAS_WIDTH = 160
const DETECTION_CANVAS_HEIGHT = 120
const MAX_SLOW_ANALYSIS_MS = 450
const MAX_SLOW_ANALYSIS_COUNT = 3

function averagePoint(points: FacePoint[]) {
  if (points.length === 0) {
    return null
  }

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 },
  )

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  }
}

function getLandmarkPoints(face: DetectedFace, type: string) {
  return (face.landmarks ?? [])
    .filter((landmark) => landmark.type === type)
    .flatMap((landmark) => {
      if (landmark.locations?.length) {
        return landmark.locations
      }

      if (typeof landmark.x === 'number' && typeof landmark.y === 'number') {
        return [{ x: landmark.x, y: landmark.y }]
      }

      return []
    })
}

function detectLookDirection(face: DetectedFace): LookDirection | null {
  const eyePoints = getLandmarkPoints(face, 'eye')
  const nosePoints = getLandmarkPoints(face, 'nose')
  const mouthPoints = getLandmarkPoints(face, 'mouth')

  if (eyePoints.length < 2 || nosePoints.length === 0) {
    return null
  }

  const sortedEyes = [...eyePoints].sort((left, right) => left.x - right.x)
  const leftEye = sortedEyes[0]
  const rightEye = sortedEyes[sortedEyes.length - 1]
  const nose = averagePoint(nosePoints)
  const eyeCenter = averagePoint([leftEye, rightEye])
  const mouthCenter =
    averagePoint(mouthPoints) ?? {
      x: face.boundingBox.x + face.boundingBox.width / 2,
      y: face.boundingBox.y + face.boundingBox.height * 0.75,
    }

  if (!nose || !eyeCenter) {
    return null
  }

  const faceCenter = {
    x: (eyeCenter.x + mouthCenter.x) / 2,
    y: (eyeCenter.y + mouthCenter.y) / 2,
  }
  const horizontalSpan = Math.max(Math.abs(rightEye.x - leftEye.x), 1)
  const verticalSpan = Math.max(Math.abs(mouthCenter.y - eyeCenter.y), 1)
  const horizontalOffset = (nose.x - faceCenter.x) / horizontalSpan
  const verticalOffset = (nose.y - faceCenter.y) / verticalSpan

  if (horizontalOffset >= 0.18) {
    return 'looking_left'
  }

  if (horizontalOffset <= -0.18) {
    return 'looking_right'
  }

  if (verticalOffset <= -0.16) {
    return 'looking_up'
  }

  if (verticalOffset >= 0.16) {
    return 'looking_down'
  }

  return null
}

function StudentProctoringPreviewComponent({
  onProctoringViolation,
}: StudentProctoringPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const detectorRef = useRef<BrowserFaceDetector | null>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const detectionTimeoutRef = useRef<number | null>(null)
  const isAnalyzingRef = useRef(false)
  const trackingEnabledRef = useRef(false)
  const noFaceFramesRef = useRef(0)
  const multiFaceFramesRef = useRef(0)
  const slowAnalysisCountRef = useRef(0)
  const stableDirectionRef = useRef<{ type: LookDirection | null; count: number }>({
    type: null,
    count: 0,
  })
  const activeAlertRef = useRef<ProctoringAlertType | null>(null)
  const statusRef = useRef<ProctoringPreviewStatus>('camera')
  const [isMobile, setIsMobile] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [status, setStatus] = useState<ProctoringPreviewStatus>('camera')

  const setPreviewStatus = useEffectEvent((nextStatus: ProctoringPreviewStatus) => {
    if (statusRef.current === nextStatus) {
      return
    }

    statusRef.current = nextStatus
    setStatus(nextStatus)
  })

  const emitViolation = useEffectEvent(
    (
      violation:
        | StudentProctoringViolationType
        | {
            type: StudentProctoringViolationType
            details?: string
            metadata?: Record<string, string | number | boolean | null>
          },
    ) => {
      onProctoringViolation?.(violation)
    },
  )

  useEffect(() => {
    let isMounted = true

    void navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 256 },
          height: { ideal: 144 },
          frameRate: { ideal: 10, max: 12 },
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
        emitViolation('tab_switch')
      }
    }

    const handleBlur = () => emitViolation('window_blur')

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)

      if (detectionTimeoutRef.current) {
        window.clearTimeout(detectionTimeoutRef.current)
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [emitViolation])

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const navigatorInfo = navigator as BrowserNavigator
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const isLowPowerDevice =
      isCoarsePointer ||
      window.innerWidth < 768 ||
      (typeof navigator.hardwareConcurrency === 'number' &&
        navigator.hardwareConcurrency <= 4) ||
      (typeof navigatorInfo.deviceMemory === 'number' &&
        navigatorInfo.deviceMemory <= 4)

    if (!window.FaceDetector || isLowPowerDevice) {
      trackingEnabledRef.current = false
      detectorRef.current = null
      setPreviewStatus('unsupported')
      return
    }

    try {
      detectorRef.current = new window.FaceDetector({
        fastMode: true,
        maxDetectedFaces: 2,
      })
      detectionCanvasRef.current = document.createElement('canvas')
      detectionCanvasRef.current.width = DETECTION_CANVAS_WIDTH
      detectionCanvasRef.current.height = DETECTION_CANVAS_HEIGHT
      trackingEnabledRef.current = true
      setPreviewStatus('tracking')
    } catch {
      detectorRef.current = null
      trackingEnabledRef.current = false
      setPreviewStatus('unsupported')
    }
  }, [setPreviewStatus])

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
  }, [isMobile])

  useEffect(() => {
    if (!trackingEnabledRef.current || !detectorRef.current) {
      return
    }

    let isCancelled = false

    const resetTrackingState = () => {
      noFaceFramesRef.current = 0
      multiFaceFramesRef.current = 0
      slowAnalysisCountRef.current = 0
      stableDirectionRef.current = { type: null, count: 0 }

      if (activeAlertRef.current !== null) {
        activeAlertRef.current = null
        setPreviewStatus('tracking')
      }
    }

    const disableAdvancedTracking = () => {
      trackingEnabledRef.current = false
      detectorRef.current = null
      activeAlertRef.current = null
      stableDirectionRef.current = { type: null, count: 0 }
      setPreviewStatus('unsupported')
    }

    const emitStableAlert = (
      type: ProctoringAlertType,
      metadata?: Record<string, string | number | boolean | null>,
    ) => {
      if (activeAlertRef.current === type) {
        return
      }

      activeAlertRef.current = type
      setPreviewStatus(type)
      emitViolation({
        type,
        metadata,
      })
    }

    const analyzeFrame = async () => {
      const video = videoRef.current
      const detector = detectorRef.current
      const canvas = detectionCanvasRef.current

      if (
        !trackingEnabledRef.current ||
        !video ||
        !detector ||
        !canvas ||
        document.visibilityState !== 'visible' ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return
      }

      const context = canvas.getContext('2d')

      if (!context) {
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const startedAt = performance.now()
      const faces = await detector.detect(canvas)
      const analysisDuration = performance.now() - startedAt

      if (analysisDuration > MAX_SLOW_ANALYSIS_MS) {
        slowAnalysisCountRef.current += 1
      } else {
        slowAnalysisCountRef.current = 0
      }

      if (slowAnalysisCountRef.current >= MAX_SLOW_ANALYSIS_COUNT) {
        disableAdvancedTracking()
        return
      }

      if (faces.length === 0) {
        noFaceFramesRef.current += 1
        multiFaceFramesRef.current = 0
        stableDirectionRef.current = { type: null, count: 0 }

        if (noFaceFramesRef.current >= SUSTAINED_ALERT_FRAMES) {
          emitStableAlert('face_not_detected', {
            detector: 'FaceDetector',
          })
        }
        return
      }

      noFaceFramesRef.current = 0

      if (faces.length > 1) {
        multiFaceFramesRef.current += 1
        stableDirectionRef.current = { type: null, count: 0 }

        if (multiFaceFramesRef.current >= SUSTAINED_ALERT_FRAMES) {
          emitStableAlert('multiple_faces_detected', {
            detector: 'FaceDetector',
            faceCount: faces.length,
          })
        }
        return
      }

      multiFaceFramesRef.current = 0
      const direction = detectLookDirection(faces[0])

      if (!direction) {
        resetTrackingState()
        return
      }

      const nextDirectionState =
        stableDirectionRef.current.type === direction
          ? {
              type: direction,
              count: stableDirectionRef.current.count + 1,
            }
          : {
              type: direction,
              count: 1,
            }

      stableDirectionRef.current = nextDirectionState

      if (nextDirectionState.count >= SUSTAINED_ALERT_FRAMES) {
        emitStableAlert(direction, {
          detector: 'FaceDetector',
          analysisDurationMs: Math.round(analysisDuration),
        })
      }
    }

    const scheduleNextAnalysis = () => {
      if (isCancelled) {
        return
      }

      detectionTimeoutRef.current = window.setTimeout(() => {
        void runAnalysisLoop()
      }, ANALYSIS_INTERVAL_MS)
    }

    const runAnalysisLoop = async () => {
      if (isCancelled) {
        return
      }

      if (isAnalyzingRef.current) {
        scheduleNextAnalysis()
        return
      }

      isAnalyzingRef.current = true

      try {
        await analyzeFrame()
      } catch {
        disableAdvancedTracking()
      } finally {
        isAnalyzingRef.current = false
      }

      scheduleNextAnalysis()
    }

    scheduleNextAnalysis()

    return () => {
      isCancelled = true

      if (detectionTimeoutRef.current) {
        window.clearTimeout(detectionTimeoutRef.current)
      }
    }
  }, [emitViolation, setPreviewStatus])

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
          <span>{STATUS_LABELS[status]}</span>
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
      <div className="flex items-center justify-between bg-black/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">
        <span>{STATUS_LABELS[status]}</span>
        <span>Live</span>
      </div>
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

export const StudentProctoringPreview = memo(StudentProctoringPreviewComponent)

StudentProctoringPreview.displayName = 'StudentProctoringPreview'
