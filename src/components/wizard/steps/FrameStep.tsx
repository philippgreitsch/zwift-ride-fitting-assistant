import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as React from 'react'
import { useFitStore } from '@/store/fitStore'
import { MeasurementField } from '@/components/wizard/fields/MeasurementField'

// ---------------------------------------------------------------------------
// Local Zod schema — string inputs from the form
// ---------------------------------------------------------------------------

const frameFormSchema = z.object({
  stack: z.string().optional(),
  reach: z.string().optional(),
  seatTubeAngle: z.string().optional(),
})

type FrameFormValues = z.infer<typeof frameFormSchema>

// Validation ranges matching frameGeometrySchema
const RANGES = {
  stack: { min: 400, max: 700, unit: 'mm' as const },
  reach: { min: 350, max: 450, unit: 'mm' as const },
  seatTubeAngle: { min: 70, max: 80, unit: 'degrees' as const },
}

function validateField(
  fieldName: keyof typeof RANGES,
  value: string | undefined
): string | undefined {
  if (!value || value === '') return undefined
  const num = Number(value)
  if (isNaN(num)) {
    return fieldName === 'seatTubeAngle'
      ? 'Enter a number in degrees.'
      : 'Enter a number in millimeters.'
  }
  const { min, max, unit } = RANGES[fieldName]
  if (num < min || num > max) {
    return unit === 'degrees'
      ? `Enter a value between ${min} and ${max} degrees.`
      : `Enter a value between ${min} and ${max} mm.`
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FrameStep() {
  const updateFrame = useFitStore((s) => s.updateFrame)
  const frame = useFitStore((s) => s.inputs.frame)
  const skillLevel = useFitStore((s) => s.skillLevel)

  const defaultValues: FrameFormValues = {
    stack: frame?.stack !== undefined ? String(frame.stack) : '',
    reach: frame?.reach !== undefined ? String(frame.reach) : '',
    seatTubeAngle:
      frame?.seatTubeAngle !== undefined ? String(frame.seatTubeAngle) : '',
  }

  const { watch, setValue, getValues } = useForm<FrameFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(frameFormSchema),
    defaultValues,
  })

  const values = watch()

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof FrameFormValues, string | undefined>>
  >({})

  function handleBlur(fieldName: keyof typeof RANGES) {
    const raw = getValues(fieldName)
    const error = validateField(fieldName, raw)
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    if (!error) {
      const parsed = !raw || raw === '' ? undefined : Number(raw)
      updateFrame({ [fieldName]: parsed })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Frame stack */}
      <MeasurementField
        id="stack"
        label="Frame stack"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Found on your bike manufacturer's geometry chart. Measured vertically from the center of the bottom bracket to the top of the head tube."
        defaultExpanded={skillLevel === 'beginner'}
        skillLevel={skillLevel}
        value={values.stack}
        onChange={(v) => setValue('stack', v)}
        onBlur={() => handleBlur('stack')}
        error={fieldErrors.stack}
      />

      {/* Frame reach */}
      <MeasurementField
        id="reach"
        label="Frame reach"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Found on your bike manufacturer's geometry chart. Measured horizontally from the center of the bottom bracket to the top-center of the head tube."
        skillLevel={skillLevel}
        value={values.reach}
        onChange={(v) => setValue('reach', v)}
        onBlur={() => handleBlur('reach')}
        error={fieldErrors.reach}
      />

      {/* Seat tube angle — degrees, not mm (FRAME-03) */}
      <MeasurementField
        id="seatTubeAngle"
        label="Seat tube angle"
        unit="degrees"
        guidanceLevel="simple"
        guidanceText="Found on your bike manufacturer's geometry chart. Typical road bikes are 72-75 degrees."
        skillLevel={skillLevel}
        value={values.seatTubeAngle}
        onChange={(v) => setValue('seatTubeAngle', v)}
        onBlur={() => handleBlur('seatTubeAngle')}
        error={fieldErrors.seatTubeAngle}
      />
    </div>
  )
}
