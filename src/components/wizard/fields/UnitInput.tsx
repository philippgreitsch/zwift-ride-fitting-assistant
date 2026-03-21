import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface UnitInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  unit?: 'mm' | 'degrees'
}

function UnitInput({ unit = 'mm', className, ...props }: UnitInputProps) {
  const unitLabel = unit === 'degrees' ? '°' : 'mm'

  return (
    <div className="relative w-full">
      <Input
        type="text"
        inputMode="decimal"
        className={cn('pr-12', className)}
        {...props}
      />
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-500"
        aria-hidden="true"
      >
        {unitLabel}
      </span>
    </div>
  )
}

export { UnitInput }
