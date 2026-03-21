import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { useFitStore } from '@/store/fitStore'
import { MeasurementField } from '@/components/wizard/fields/MeasurementField'

// ---------------------------------------------------------------------------
// Local Zod schema — string inputs from the form
// ---------------------------------------------------------------------------

const fitReportFormSchema = z.object({
  saddleHeight: z.string().optional(),
  saddleForeAft: z.string().optional(),
  handlebarHeight: z.string().optional(),
  handlebarReach: z.string().optional(),
})

type FitReportFormValues = z.infer<typeof fitReportFormSchema>

function validateField(
  value: string | undefined
): string | undefined {
  if (!value || value === '') return undefined
  const num = Number(value)
  if (isNaN(num)) return 'Enter a number in millimeters.'
  if (num <= 0) return 'Enter a positive value in millimeters.'
  return undefined
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FitReportStep() {
  const updateFitReport = useFitStore((s) => s.updateFitReport)
  const fitReport = useFitStore((s) => s.inputs.fitReport)
  const skillLevel = useFitStore((s) => s.skillLevel)

  const defaultValues: FitReportFormValues = {
    saddleHeight:
      fitReport?.saddleHeight !== undefined ? String(fitReport.saddleHeight) : '',
    saddleForeAft:
      fitReport?.saddleForeAft !== undefined ? String(fitReport.saddleForeAft) : '',
    handlebarHeight:
      fitReport?.handlebarHeight !== undefined
        ? String(fitReport.handlebarHeight)
        : '',
    handlebarReach:
      fitReport?.handlebarReach !== undefined
        ? String(fitReport.handlebarReach)
        : '',
  }

  const { watch, setValue } = useForm<FitReportFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(fitReportFormSchema),
    defaultValues,
  })

  const values = watch()

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof FitReportFormValues, string | undefined>>
  >({})

  function handleBlur(fieldName: keyof FitReportFormValues) {
    const raw = values[fieldName]
    const error = validateField(raw)
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    if (!error) {
      const parsed = !raw || raw === '' ? undefined : Number(raw)
      updateFitReport({ [fieldName]: parsed })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Priority banner (D-15) — non-dismissable */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <AlertCircle
          size={16}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-amber-600"
        />
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Values here override your physical measurements for the same axis.
        </p>
      </div>

      {/* Saddle height (fit report) */}
      <MeasurementField
        id="fitSaddleHeight"
        label="Saddle height (fit report)"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Enter the saddle height value from your bike fit report."
        defaultExpanded={skillLevel === 'beginner'}
        skillLevel={skillLevel}
        value={values.saddleHeight}
        onChange={(v) => setValue('saddleHeight', v)}
        onBlur={() => handleBlur('saddleHeight')}
        error={fieldErrors.saddleHeight}
      />

      {/* Saddle fore/aft (fit report) */}
      <MeasurementField
        id="fitSaddleForeAft"
        label="Saddle fore/aft (fit report)"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Enter the saddle setback or fore/aft value from your bike fit report."
        skillLevel={skillLevel}
        value={values.saddleForeAft}
        onChange={(v) => setValue('saddleForeAft', v)}
        onBlur={() => handleBlur('saddleForeAft')}
        error={fieldErrors.saddleForeAft}
      />

      {/* Handlebar height (fit report) */}
      <MeasurementField
        id="fitHandlebarHeight"
        label="Handlebar height (fit report)"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Enter the handlebar height value from your bike fit report."
        skillLevel={skillLevel}
        value={values.handlebarHeight}
        onChange={(v) => setValue('handlebarHeight', v)}
        onBlur={() => handleBlur('handlebarHeight')}
        error={fieldErrors.handlebarHeight}
      />

      {/* Handlebar reach (fit report) */}
      <MeasurementField
        id="fitHandlebarReach"
        label="Handlebar reach (fit report)"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Enter the handlebar reach value from your bike fit report."
        skillLevel={skillLevel}
        value={values.handlebarReach}
        onChange={(v) => setValue('handlebarReach', v)}
        onBlur={() => handleBlur('handlebarReach')}
        error={fieldErrors.handlebarReach}
      />
    </div>
  )
}
