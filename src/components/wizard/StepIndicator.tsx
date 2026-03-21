import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  onStepClick: (step: number) => void
}

const STEPS: { number: number; label: string }[] = [
  { number: 1, label: 'Physical' },
  { number: 2, label: 'Body' },
  { number: 3, label: 'Frame' },
  { number: 4, label: 'Fit Report' },
  { number: 5, label: 'Results' },
]

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-2 min-h-[44px] items-center">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isUpcoming = step.number > currentStep

          return (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={cn(
                'flex flex-shrink-0 flex-col items-center gap-1 cursor-pointer min-h-[44px] justify-center px-2 bg-transparent border-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-md'
              )}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
            >
              {/* Circle */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full size-8 flex-shrink-0 transition-colors',
                  isActive && 'bg-orange-500 text-white',
                  isCompleted && 'bg-zinc-500 text-white',
                  isUpcoming && 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800'
                )}
              >
                {isCompleted ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'hidden sm:inline text-xs leading-[1.4] whitespace-nowrap',
                  isActive && 'font-semibold text-zinc-950 dark:text-zinc-50',
                  isCompleted && 'text-zinc-500',
                  isUpcoming && 'text-zinc-400'
                )}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
