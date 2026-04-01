import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepIndicator({
  currentStep,
  stepLabels,
  onStepClick,
}: {
  currentStep: number
  stepLabels: string[]
  onStepClick: (step: number) => void
}) {
  return (
    <div className="px-8 py-4 bg-white border-b border-card-border">
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => step < currentStep && onStepClick(step)}
              disabled={step > currentStep}
              className="flex flex-col items-center"
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold border-2 transition-colors',
                currentStep > step ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step ? 'border-primary text-primary bg-white'
                    : 'border-card-border text-text-secondary bg-white'
              )}>
                {currentStep > step ? <Check size={14} strokeWidth={2} /> : step}
              </div>
              <span className={cn('text-[11px] mt-1.5', currentStep === step ? 'text-primary font-medium' : 'text-text-secondary')}>
                {stepLabels[index]}
              </span>
            </button>
            {index < 3 && (
              <div className={cn('w-20 h-[2px] mx-3 mt-[-16px]', currentStep > step ? 'bg-green-500' : 'bg-card-border')} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
