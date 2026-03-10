import * as React from "react"
import type { TimeValue } from "react-aria-components"

interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: TimeValue | string | number
  onChange?: (value: TimeValue | null) => void
  hourCycle?: number
  granularity?: string
}

export function TimeInput({ value, onChange, hourCycle, granularity, ...props }: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value as any)
  }

  return (
    <input
      type="time"
      className="rounded border px-3 py-2"
      value={typeof value === 'string' ? value : ''}
      onChange={handleChange}
      {...props}
    />
  )
}
