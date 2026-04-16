import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChipSelect } from './chip-select'

const options = [
  { value: 'male', label: 'Чоловік' },
  { value: 'female', label: 'Жінка' },
]

describe('ChipSelect', () => {
  it('renders all options', () => {
    render(<ChipSelect options={options} value={null} onChange={vi.fn()} />)
    expect(screen.getByText('Чоловік')).toBeInTheDocument()
    expect(screen.getByText('Жінка')).toBeInTheDocument()
  })

  it('calls onChange when chip clicked', () => {
    const onChange = vi.fn()
    render(<ChipSelect options={options} value={null} onChange={onChange} />)
    fireEvent.click(screen.getByText('Чоловік'))
    expect(onChange).toHaveBeenCalledWith('male')
  })

  it('marks selected chip as active', () => {
    render(<ChipSelect options={options} value="female" onChange={vi.fn()} />)
    const chip = screen.getByText('Жінка').closest('button')
    expect(chip).toHaveAttribute('data-active', 'true')
  })

  it('supports multi-select mode', () => {
    const onChange = vi.fn()
    render(
      <ChipSelect
        options={options}
        value={['male']}
        onChange={onChange}
        multi
      />
    )
    fireEvent.click(screen.getByText('Жінка'))
    expect(onChange).toHaveBeenCalledWith(['male', 'female'])
  })
})
