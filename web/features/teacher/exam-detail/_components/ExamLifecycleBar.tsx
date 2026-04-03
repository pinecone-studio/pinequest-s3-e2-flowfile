'use client'
import { STAGE_CONFIGS, type VisualStage } from '../examStageUtils'

export function ExamLifecycleBar({ currentStage, activeStage, onSelect }: {
  currentStage: VisualStage; activeStage: VisualStage; onSelect: (s: VisualStage) => void
}) {
  const currentIdx = STAGE_CONFIGS.findIndex(s => s.key === currentStage)
  return (
    <div>
      <div className="flex items-start overflow-x-auto pb-2">
        {STAGE_CONFIGS.map((stage, idx) => {
          const isDone = idx < currentIdx
          const isCurrent = stage.key === currentStage
          const isFuture = idx > currentIdx
          const isViewing = stage.key === activeStage
          return (
            <div key={stage.key} className="flex items-center">
              <button
                onClick={() => !isFuture && onSelect(stage.key)}
                disabled={isFuture}
                className="flex flex-col items-center"
                style={{ minWidth: 80, padding: '0 4px' }}
              >
                <div
                  className={isCurrent ? 'animate-bounce' : ''}
                  style={{
                    width: isCurrent ? 36 : 28,
                    height: isCurrent ? 36 : 28,
                    borderRadius: '50%',
                    border: `2px solid ${isFuture ? '#E2E8F0' : stage.color}`,
                    backgroundColor: isFuture ? 'white' : (isDone || isCurrent) ? stage.color : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isCurrent ? 13 : 11, fontWeight: 700,
                    color: isFuture ? '#C0C8D2' : (isDone || isCurrent) ? 'white' : stage.color,
                    outline: (isViewing && !isCurrent) ? `3px solid ${stage.color}` : undefined,
                    outlineOffset: 2, transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span style={{
                  display: 'block', marginTop: 6, fontSize: 10, textAlign: 'center', lineHeight: 1.3,
                  maxWidth: 72, color: isFuture ? '#C0C8D2' : isCurrent ? stage.color : '#5A6474',
                  fontWeight: (isCurrent || isViewing) ? 600 : 400,
                }}>
                  {isCurrent ? stage.activeLabel : stage.label}
                </span>
              </button>
              {idx < STAGE_CONFIGS.length - 1 && (
                <div style={{
                  width: 24, height: 2, marginBottom: 20, flexShrink: 0,
                  backgroundColor: idx < currentIdx ? STAGE_CONFIGS[idx].color : '#E2E8F0',
                  transition: 'background-color 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-1 text-[12px] font-medium" style={{ color: STAGE_CONFIGS.find(s => s.key === activeStage)?.color ?? '#5A6474' }}>
        Харж байна: {STAGE_CONFIGS.find(s => s.key === activeStage)?.label}
      </div>
    </div>
  )
}
