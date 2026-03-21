import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown } from 'lucide-react'
import { useFitStore } from '@/store/fitStore'
import { MeasurementField } from '@/components/wizard/fields/MeasurementField'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { HandlebarType } from '@/types/fit'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Local Zod schema — string inputs from the form (all fields stored as strings)
// ---------------------------------------------------------------------------

const physicalFormSchema = z.object({
  saddleHeight: z.string().optional(),
  saddleForeAft: z.string().optional(),
  handlebarHeight: z.string().optional(),
  handlebarReach: z.string().optional(),
  crankLength: z.string().optional(),
  dropBarHoodHeightOffset: z.string().optional(),
  dropBarHoodReachOffset: z.string().optional(),
})

type PhysicalFormValues = z.infer<typeof physicalFormSchema>

// Validation ranges matching physicalMeasurementsSchema
const RANGES = {
  saddleHeight: { min: 400, max: 1000 },
  saddleForeAft: { min: 0, max: 200 },
  handlebarHeight: { min: 600, max: 1200 },
  handlebarReach: { min: 200, max: 800 },
  crankLength: { min: 140, max: 200 },
  dropBarHoodHeightOffset: { min: 0, max: 100 },
  dropBarHoodReachOffset: { min: 0, max: 150 },
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

export function PhysicalStep() {
  const updatePhysical = useFitStore((s) => s.updatePhysical)
  const physical = useFitStore((s) => s.inputs.physical)
  const fitReport = useFitStore((s) => s.inputs.fitReport)
  const skillLevel = useFitStore((s) => s.skillLevel)
  const handlebarType = useFitStore((s) => s.inputs.physical?.handlebarType)

  const [dropOffsetOpen, setDropOffsetOpen] = React.useState(false)

  // When handlebar type changes to 'drop', expand the offsets section
  const prevHandlebarType = React.useRef(handlebarType)
  React.useEffect(() => {
    if (handlebarType === 'drop' && prevHandlebarType.current !== 'drop') {
      setDropOffsetOpen(true)
    }
    prevHandlebarType.current = handlebarType
  }, [handlebarType])

  // Override state — derived from fitReport (not RHF)
  const overriddenAxes = {
    saddleHeight: fitReport?.saddleHeight != null,
    saddleForeAft: fitReport?.saddleForeAft != null,
    handlebarHeight: fitReport?.handlebarHeight != null,
    handlebarReach: fitReport?.handlebarReach != null,
  }

  // Default values from Zustand store, converted to strings for controlled inputs
  const defaultValues: PhysicalFormValues = {
    saddleHeight:
      physical?.saddleHeight !== undefined ? String(physical.saddleHeight) : '',
    saddleForeAft:
      physical?.saddleForeAft !== undefined ? String(physical.saddleForeAft) : '',
    handlebarHeight:
      physical?.handlebarHeight !== undefined ? String(physical.handlebarHeight) : '',
    handlebarReach:
      physical?.handlebarReach !== undefined ? String(physical.handlebarReach) : '',
    crankLength:
      physical?.crankLength !== undefined ? String(physical.crankLength) : '',
    dropBarHoodHeightOffset:
      physical?.dropBarHoodHeightOffset !== undefined
        ? String(physical.dropBarHoodHeightOffset)
        : '',
    dropBarHoodReachOffset:
      physical?.dropBarHoodReachOffset !== undefined
        ? String(physical.dropBarHoodReachOffset)
        : '',
  }

  const { watch, setValue } = useForm<PhysicalFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(physicalFormSchema),
    defaultValues,
  })

  const values = watch()

  // Per-field inline error state (triggered on blur)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof PhysicalFormValues, string | undefined>>
  >({})

  // Blur sync helper — validates inline, then writes to Zustand
  function handleBlur(fieldName: keyof typeof RANGES) {
    const raw = values[fieldName]
    const error = validateField(fieldName, raw)
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    if (!error) {
      const parsed =
        !raw || raw === '' ? undefined : Number(raw)
      updatePhysical({ [fieldName]: parsed })
    }
  }

  // Dynamic labels based on handlebar type
  const handlebarHeightLabel =
    handlebarType === 'drop' ? 'Hood height' : 'Handlebar height'
  const handlebarReachLabel =
    handlebarType === 'drop' ? 'Hood reach' : 'Handlebar reach'

  return (
    <div className="flex flex-col gap-6">
      {/* Handlebar type selector */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold leading-none">
          Handlebar type
        </Label>
        <Select
          value={handlebarType ?? ''}
          onValueChange={(value) => {
            if (value === 'drop' || value === 'flat') {
              updatePhysical({ handlebarType: value as HandlebarType })
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select handlebar type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="drop">Drop bars</SelectItem>
            <SelectItem value="flat">Flat bars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Saddle height */}
      <MeasurementField
        id="saddleHeight"
        label="Saddle height"
        unit="mm"
        guidanceLevel="complex"
        guidanceText={
          <>
            Measure from the <strong>center of the bottom bracket axle</strong> to
            the <strong>top of the saddle</strong>. Sit on the bike and ensure the
            saddle is at your normal riding position. Do not measure to the rails.
          </>
        }
        isOverridden={overriddenAxes.saddleHeight}
        defaultExpanded={skillLevel === 'beginner'}
        skillLevel={skillLevel}
        value={values.saddleHeight}
        onChange={(v) => setValue('saddleHeight', v)}
        onBlur={() => handleBlur('saddleHeight')}
        error={fieldErrors.saddleHeight}
      />

      {/* Saddle fore/aft */}
      <MeasurementField
        id="saddleForeAft"
        label="Saddle fore/aft (setback)"
        unit="mm"
        guidanceLevel="complex"
        guidanceText={
          <>
            Measure the horizontal distance from the{' '}
            <strong>center of the bottom bracket</strong> to the{' '}
            <strong>tip of the saddle nose</strong>. Use a plumb line or straight
            edge dropped vertically.
          </>
        }
        isOverridden={overriddenAxes.saddleForeAft}
        skillLevel={skillLevel}
        value={values.saddleForeAft}
        onChange={(v) => setValue('saddleForeAft', v)}
        onBlur={() => handleBlur('saddleForeAft')}
        error={fieldErrors.saddleForeAft}
      />

      {/* Handlebar height (label changes with handlebar type) */}
      <MeasurementField
        id="handlebarHeight"
        label={handlebarHeightLabel}
        unit="mm"
        guidanceLevel="complex"
        guidanceText={
          <>
            Measure from the <strong>floor</strong> to the{' '}
            <strong>center of the handlebar</strong> (or the top of the hoods for
            drop bars). Stand the bike on a level surface.
          </>
        }
        isOverridden={overriddenAxes.handlebarHeight}
        skillLevel={skillLevel}
        value={values.handlebarHeight}
        onChange={(v) => setValue('handlebarHeight', v)}
        onBlur={() => handleBlur('handlebarHeight')}
        error={fieldErrors.handlebarHeight}
      />

      {/* Handlebar reach (label changes with handlebar type) */}
      <MeasurementField
        id="handlebarReach"
        label={handlebarReachLabel}
        unit="mm"
        guidanceLevel="complex"
        guidanceText={
          <>
            Measure the horizontal distance from the{' '}
            <strong>tip of the saddle nose</strong> to the{' '}
            <strong>center of the handlebar</strong> (or the brake hood contact
            point for drop bars).
          </>
        }
        isOverridden={overriddenAxes.handlebarReach}
        skillLevel={skillLevel}
        value={values.handlebarReach}
        onChange={(v) => setValue('handlebarReach', v)}
        onBlur={() => handleBlur('handlebarReach')}
        error={fieldErrors.handlebarReach}
      />

      {/* Crank length */}
      <MeasurementField
        id="crankLength"
        label="Crank length"
        unit="mm"
        guidanceLevel="simple"
        guidanceText="Check the inside of your crank arm — the length is usually printed there (e.g. 170, 172.5, 175)."
        placeholder="172.5"
        helperText="Optional — defaults to 172.5mm (most common road bike crank)"
        skillLevel={skillLevel}
        value={values.crankLength}
        onChange={(v) => setValue('crankLength', v)}
        onBlur={() => handleBlur('crankLength')}
        error={fieldErrors.crankLength}
      />

      {/* Drop bar hood offsets — only visible when handlebar type is 'drop' */}
      {handlebarType === 'drop' && (
        <Collapsible open={dropOffsetOpen} onOpenChange={setDropOffsetOpen}>
          <CollapsibleTrigger
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
          >
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn(
                'transition-transform duration-200',
                dropOffsetOpen && 'rotate-180'
              )}
            />
            Drop bar hood offsets (advanced)
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-6 mt-4 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
              {/* Hood height offset */}
              <MeasurementField
                id="dropBarHoodHeightOffset"
                label="Hood height offset"
                unit="mm"
                guidanceLevel="simple"
                guidanceText="How much lower the hoods sit below the bar clamp center."
                placeholder="40"
                helperText="Default 40mm — override if you've measured your own hoods."
                skillLevel={skillLevel}
                value={values.dropBarHoodHeightOffset}
                onChange={(v) => setValue('dropBarHoodHeightOffset', v)}
                onBlur={() => handleBlur('dropBarHoodHeightOffset')}
                error={fieldErrors.dropBarHoodHeightOffset}
              />

              {/* Hood reach offset */}
              <MeasurementField
                id="dropBarHoodReachOffset"
                label="Hood reach offset"
                unit="mm"
                guidanceLevel="simple"
                guidanceText="How much further forward the hoods sit compared to the bar clamp center."
                placeholder="50"
                helperText="Default 50mm — override if you've measured your own hoods."
                skillLevel={skillLevel}
                value={values.dropBarHoodReachOffset}
                onChange={(v) => setValue('dropBarHoodReachOffset', v)}
                onBlur={() => handleBlur('dropBarHoodReachOffset')}
                error={fieldErrors.dropBarHoodReachOffset}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
