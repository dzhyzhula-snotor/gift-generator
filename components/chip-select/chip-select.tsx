'use client'
import styles from './chip-select.module.css'

interface ChipOption {
  value: string
  label: string
}

interface ChipSelectProps {
  options: ChipOption[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  multi?: boolean
}

export function ChipSelect({ options, value, onChange, multi = false }: ChipSelectProps) {
  function handleClick(optionValue: string) {
    if (multi) {
      const current = (value as string[]) ?? []
      const next = current.includes(optionValue)
        ? current.filter(v => v !== optionValue)
        : [...current, optionValue]
      onChange(next)
    } else {
      onChange(optionValue)
    }
  }

  function isActive(optionValue: string): boolean {
    if (multi) return ((value as string[]) ?? []).includes(optionValue)
    return value === optionValue
  }

  return (
    <div className={styles.chips}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={styles.chip}
          data-active={isActive(option.value)}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
