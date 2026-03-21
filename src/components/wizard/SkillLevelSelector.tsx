import { useFitStore } from '@/store/fitStore'
import { cn } from '@/lib/utils'

export function SkillLevelSelector() {
  const { skillLevel, setSkillLevel, setCurrentStep } = useFitStore()

  function handleSelect(level: 'beginner' | 'pro') {
    setSkillLevel(level)
    setCurrentStep(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold leading-[1.15]">
        How do you want to use this tool?
      </h1>
      <div className="flex flex-col gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-pressed={skillLevel === 'beginner'}
          onClick={() => handleSelect('beginner')}
          onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSelect('beginner') : undefined}
          className={cn(
            'min-h-[72px] cursor-pointer rounded-xl border-2 px-4 py-4 flex flex-col justify-center gap-1 transition-colors',
            skillLevel === 'beginner'
              ? 'border-orange-500 bg-orange-500/10'
              : 'border border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600'
          )}
        >
          <span className="text-[14px] font-semibold leading-[1.4] text-zinc-950 dark:text-zinc-50">
            I'm new to bike fitting
          </span>
          <span className="text-[14px] text-zinc-500">
            I'll see measurement tips as I go
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={skillLevel === 'pro'}
          onClick={() => handleSelect('pro')}
          onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSelect('pro') : undefined}
          className={cn(
            'min-h-[72px] cursor-pointer rounded-xl border-2 px-4 py-4 flex flex-col justify-center gap-1 transition-colors',
            skillLevel === 'pro'
              ? 'border-orange-500 bg-orange-500/10'
              : 'border border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600'
          )}
        >
          <span className="text-[14px] font-semibold leading-[1.4] text-zinc-950 dark:text-zinc-50">
            I know my measurements
          </span>
          <span className="text-[14px] text-zinc-500">
            I'll keep tips collapsed
          </span>
        </div>
      </div>
    </div>
  )
}
