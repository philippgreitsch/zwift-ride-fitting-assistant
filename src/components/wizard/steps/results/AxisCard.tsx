import type { AxisOutput } from '@/types/fit'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OutOfRangeAlert } from './OutOfRangeAlert'

interface AxisCardProps {
  /** Display label for this axis, e.g. "Saddle Height" */
  label: string
  /** null when no input data was provided for this axis */
  axis: AxisOutput | null
  /** Static instruction string explaining how to physically make this adjustment on the Zwift Ride */
  instruction: string
}

const SOURCE_LABEL: Record<string, string> = {
  'fit-report': 'Fit report',
  measured: 'Direct measurement',
  derived: 'Frame geometry',
  estimated: 'Body estimate',
}

export function AxisCard({ label, axis, instruction }: AxisCardProps) {
  // State 1: no input data for this axis
  if (axis === null) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 opacity-50">
        <CardHeader>
          <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{label}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No data entered for this axis.</p>
        </CardContent>
      </Card>
    )
  }

  // State 2: out of range
  if (axis.out_of_range) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{label}</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <OutOfRangeAlert
            label={label}
            direction={axis.direction!}
            achievable_mm={axis.achievable_mm}
            ideal_mm={axis.ideal_mm}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{instruction}</p>
        </CardContent>
      </Card>
    )
  }

  // States 3 & 4: in range — letter known or unknown
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{label}</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-4">
          {axis.letter_position !== null ? (
            // State 3: letter known — show letter large, mm secondary
            <>
              <span className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">
                {axis.letter_position}
              </span>
              <span className="text-lg text-zinc-500">{Math.round(axis.achievable_mm)} mm</span>
            </>
          ) : (
            // State 4: letter unknown — show mm primary, note secondary
            <>
              <span className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">
                {Math.round(axis.achievable_mm)} mm
              </span>
            </>
          )}
        </div>

        {axis.letter_position === null && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Letter position not yet confirmed — lookup table not populated. Use the mm measurement above.
          </p>
        )}

        <p className="text-sm text-zinc-600 dark:text-zinc-400">{instruction}</p>

        <Badge variant="secondary" className="w-fit">
          {SOURCE_LABEL[axis.source] ?? axis.source}
        </Badge>
      </CardContent>
    </Card>
  )
}
