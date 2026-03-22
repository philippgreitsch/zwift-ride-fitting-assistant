import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface OutOfRangeAlertProps {
  /** Axis display name, e.g. "Saddle Height" */
  label: string
  direction: 'above' | 'below'
  achievable_mm: number
  ideal_mm: number
}

export function OutOfRangeAlert({ label, direction, achievable_mm, ideal_mm }: OutOfRangeAlertProps) {
  const directionText = direction === 'above'
    ? 'too high for the Zwift Ride'
    : 'too low for the Zwift Ride'

  const diff = Math.round(Math.abs(ideal_mm - achievable_mm))

  return (
    <Alert variant="destructive">
      <AlertTitle>{label}: Target out of range</AlertTitle>
      <AlertDescription>
        <p>
          Your target of <strong>{Math.round(ideal_mm)} mm</strong> is {diff} mm {directionText}.
        </p>
        <p className="mt-1">
          Closest achievable position: <strong>{Math.round(achievable_mm)} mm</strong>.
          Set to this position as the best available match.
        </p>
      </AlertDescription>
    </Alert>
  )
}
