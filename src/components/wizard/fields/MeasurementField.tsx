import * as React from 'react'
import { Info, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { UnitInput } from './UnitInput'

interface MeasurementFieldProps {
  id: string
  label: string
  unit?: 'mm' | 'degrees'
  guidanceLevel: 'simple' | 'complex'
  guidanceText: React.ReactNode
  isOverridden?: boolean
  overrideNote?: string
  defaultExpanded?: boolean
  skillLevel: 'beginner' | 'pro' | null
  placeholder?: string
  helperText?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

function MeasurementField({
  id,
  label,
  unit = 'mm',
  guidanceText,
  isOverridden = false,
  overrideNote = 'Overridden by your fit report',
  defaultExpanded = false,
  skillLevel,
  placeholder,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  disabled,
}: MeasurementFieldProps) {
  const [open, setOpen] = React.useState(
    isOverridden ? false : defaultExpanded
  )

  const isDisabled = disabled || isOverridden
  const inputId = id
  const guidanceId = `${id}-guidance`

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row with optional Info icon (pro mode) */}
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-semibold leading-none',
            isOverridden && 'text-zinc-400'
          )}
        >
          {label}
        </Label>

        {/* Pro mode: small Info icon toggle */}
        {skillLevel === 'pro' && (
          <button
            type="button"
            aria-label={`${open ? 'Hide' : 'Show'} guidance for ${label}`}
            aria-expanded={open}
            aria-controls={guidanceId}
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center text-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Info size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Collapsible guidance panel */}
      <Collapsible
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
      >
        {/* Beginner mode: visible "How to measure" trigger */}
        {skillLevel === 'beginner' && (
          <CollapsibleTrigger
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => setOpen((prev) => !prev)}
          >
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn(
                'transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
            {open ? 'Hide guidance' : 'How to measure'}
          </CollapsibleTrigger>
        )}

        <CollapsibleContent id={guidanceId}>
          <div className="pt-1 pb-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {guidanceText}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Input */}
      <UnitInput
        id={inputId}
        unit={unit}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-describedby={
          [
            error ? `${id}-error` : '',
            helperText ? `${id}-helper` : '',
            isOverridden ? `${id}-override` : '',
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={cn(
          error && 'border-red-600 focus-visible:ring-red-600/50',
          isOverridden && 'bg-zinc-100 dark:bg-zinc-900'
        )}
      />

      {/* Override note */}
      {isOverridden && (
        <p id={`${id}-override`} className="text-xs italic text-zinc-400">
          {overrideNote}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && !isOverridden && (
        <p id={`${id}-helper`} className="text-sm text-zinc-500">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { MeasurementField }
