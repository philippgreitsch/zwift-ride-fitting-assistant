import { useFitStore } from '@/store/fitStore'
import { SkillLevelSelector } from './SkillLevelSelector'
import { StepIndicator } from './StepIndicator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const STEP_BADGES: Record<number, { text: string; variant: 'default' | 'secondary' }> = {
  1: { text: 'Start here', variant: 'default' },
  2: { text: 'Optional', variant: 'secondary' },
  3: { text: 'Optional', variant: 'secondary' },
  4: { text: 'Optional', variant: 'secondary' },
}

function StepPlaceholder({ step }: { step: number }) {
  if (step === 5) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <h2 className="text-[28px] font-semibold leading-[1.15] text-zinc-950 dark:text-zinc-50">
            Your settings are ready
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-[16px] leading-[1.5] text-zinc-950 dark:text-zinc-50">
            We've calculated your Zwift Ride target positions. Full adjustment guide coming in the next update.
          </p>
          <p className="text-[14px] text-zinc-500">
            Come back soon — or check the project for updates.
          </p>
        </CardContent>
      </Card>
    )
  }

  const badge = STEP_BADGES[step]

  return (
    <div className="flex flex-col gap-3">
      {badge && (
        <div className="flex items-center gap-2">
          <Badge
            variant={badge.variant}
            className={badge.variant === 'default' ? 'bg-orange-500 text-white border-transparent' : undefined}
          >
            {badge.text}
          </Badge>
        </div>
      )}
      <p className="text-[16px] leading-[1.5] text-zinc-500">
        Fill in what you have. Anything left blank will be estimated or skipped.
      </p>
      <div className="py-6">
        <p className="text-zinc-500">Step {step} content — coming soon</p>
      </div>
    </div>
  )
}

export function WizardShell() {
  const { currentStep, setCurrentStep } = useFitStore()

  const isSkillSelector = currentStep === 0
  const isResults = currentStep === 5
  const isLastInputStep = currentStep === 4

  const content = (
    <div className="flex flex-col gap-6 py-6">
      {/* App title */}
      <h1 className="text-[28px] font-semibold leading-[1.15] text-zinc-950 dark:text-zinc-50">
        Zwift Ride Fitting Assistant
      </h1>

      {/* 48px gap before content per UI-SPEC 2xl spacing */}
      <div className="mt-6">
        {isSkillSelector ? (
          <SkillLevelSelector />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Step indicator */}
            <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

            {/* Step content */}
            <div className="mt-2">
              <StepPlaceholder step={currentStep} />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-4">
              {/* Back button — shown on all steps except step 1 */}
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  className="min-h-[44px] w-full sm:w-auto"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← Back
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {/* Next / CTA button — hide on results step */}
              {!isResults && (
                isLastInputStep ? (
                  <Button
                    className="min-h-[44px] w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                    onClick={() => setCurrentStep(5)}
                  >
                    Set up my Zwift Ride →
                  </Button>
                ) : (
                  <Button
                    className="min-h-[44px] w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next →
                  </Button>
                )
              )}

              {/* Results step: back only */}
              {isResults && (
                <Button
                  variant="ghost"
                  className="min-h-[44px] w-full sm:w-auto"
                  onClick={() => setCurrentStep(4)}
                >
                  ← Back
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8 sm:flex sm:items-start sm:justify-center sm:pt-12">
      {/* Mobile: full-bleed, no card chrome. Desktop: max-w-[600px] centered in Card */}
      <div className="w-full sm:hidden">
        {content}
      </div>
      <div className="hidden sm:block w-full max-w-[600px]">
        <Card className="p-6">
          {content}
        </Card>
      </div>
    </div>
  )
}
