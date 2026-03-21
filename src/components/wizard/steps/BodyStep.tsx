import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFitStore } from '@/store/fitStore'
import { MeasurementField } from '@/components/wizard/fields/MeasurementField'

// ---------------------------------------------------------------------------
// Local Zod schema — string inputs from the form
// ---------------------------------------------------------------------------

const bodyFormSchema = z.object({
  inseam: z.string().optional(),
  torso: z.string().optional(),
  arm: z.string().optional(),
})

type BodyFormValues = z.infer<typeof bodyFormSchema>

// Validation ranges matching bodyMeasurementsSchema
const RANGES = {
  inseam: { min: 500, max: 1100 },
  torso: { min: 300, max: 800 },
  arm: { min: 400, max: 900 },
}

function validateField(
  fieldName: keyof typeof RANGES,
  value: string | undefined
): string | undefined {
  if (!value || value === '') return undefined
  const num = Number(value)
  if (isNaN(num)) return 'Enter a number in millimeters.'
  const { min, max } = RANGES[fieldName]
  if (num < min || num > max) return `Enter a value between ${min} and ${max} mm.`
  return undefined
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BodyStep() {
  const updateBody = useFitStore((s) => s.updateBody)
  const body = useFitStore((s) => s.inputs.body)
  const skillLevel = useFitStore((s) => s.skillLevel)

  const defaultValues: BodyFormValues = {
    inseam: body?.inseam !== undefined ? String(body.inseam) : '',
    torso: body?.torso !== undefined ? String(body.torso) : '',
    arm: body?.arm !== undefined ? String(body.arm) : '',
  }

  const { watch, setValue } = useForm<BodyFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(bodyFormSchema),
    defaultValues,
  })

  const values = watch()

  // Per-field inline error state (triggered on blur)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof BodyFormValues, string | undefined>>
  >({})

  // Blur sync helper — validates inline, then writes to Zustand
  function handleBlur(fieldName: keyof typeof RANGES) {
    const raw = values[fieldName]
    const error = validateField(fieldName, raw)
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    if (!error) {
      const parsed = !raw || raw === '' ? undefined : Number(raw)
      updateBody({ [fieldName]: parsed })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Inseam */}
      <MeasurementField
        id="inseam"
        label="Inseam"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Stand barefoot on a hard floor. Measure from the floor to the top of your crotch (where a book spine would press snugly)."
        defaultExpanded={skillLevel === 'beginner'}
        skillLevel={skillLevel}
        value={values.inseam}
        onChange={(v) => setValue('inseam', v)}
        onBlur={() => handleBlur('inseam')}
        error={fieldErrors.inseam}
      />

      {/* Torso length */}
      <MeasurementField
        id="torso"
        label="Torso length"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Measure from the bony bump at the base of your neck (C7 vertebra) down to the top of your hip bone (sacrum)."
        skillLevel={skillLevel}
        value={values.torso}
        onChange={(v) => setValue('torso', v)}
        onBlur={() => handleBlur('torso')}
        error={fieldErrors.torso}
      />

      {/* Arm length */}
      <MeasurementField
        id="arm"
        label="Arm length"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Measure from the bony point of your shoulder to the center of your wrist bone, arm straight."
        skillLevel={skillLevel}
        value={values.arm}
        onChange={(v) => setValue('arm', v)}
        onBlur={() => handleBlur('arm')}
        error={fieldErrors.arm}
      />
    </div>
  )
}
