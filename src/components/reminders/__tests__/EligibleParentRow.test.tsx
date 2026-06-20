import { render, fireEvent, screen } from '@testing-library/react-native'
import React from 'react'
import { PaperProvider } from 'react-native-paper'
import { EligibleParentRow } from '../EligibleParentRow'
import type { EligibleParent } from '@/types/reminder'

jest.mock('@/lib/formatters', () => ({
  formatCurrency: (n: number) => `₱${n.toFixed(2)}`,
  formatDate: (s: string) => s,
}))

const unsentParent: EligibleParent = {
  id: 1,
  full_name: 'Maria Santos',
  email: 'maria@example.com',
  total_send_count: 0,
  has_overdue: false,
  unpaid_periods: [
    {
      school_month: 'June',
      year: 2026,
      was_sent: false,
      last_sent_at: null,
      send_count: 0,
      total_amount: 810,
      students: [{ id: 1, full_name: 'Ana Santos' }],
    },
  ],
}

const sentParent: EligibleParent = {
  id: 2,
  full_name: 'Juan dela Cruz',
  email: 'juan@example.com',
  total_send_count: 1,
  has_overdue: false,
  unpaid_periods: [
    {
      school_month: 'June',
      year: 2026,
      was_sent: true,
      last_sent_at: '2026-06-10T08:00:00Z',
      send_count: 1,
      total_amount: 810,
      students: [{ id: 2, full_name: 'Ben dela Cruz' }],
    },
  ],
}

function wrap(element: React.ReactElement): React.ReactElement {
  return <PaperProvider>{element}</PaperProvider>
}

beforeEach(() => jest.clearAllMocks())

describe('EligibleParentRow', () => {
  it('renders parent name and email', () => {
    render(
      wrap(
        <EligibleParentRow
          parent={unsentParent}
          isSelected={false}
          onPress={jest.fn()}
          onToggle={jest.fn()}
          onLongPress={jest.fn()}
        />,
      ),
    )
    expect(screen.getByText('Maria Santos')).toBeTruthy()
    expect(screen.getByText('maria@example.com')).toBeTruthy()
  })

  it('calls onPress when row is tapped (navigate to detail)', () => {
    const onPress = jest.fn()
    render(
      wrap(
        <EligibleParentRow
          parent={unsentParent}
          isSelected={false}
          onPress={onPress}
          onToggle={jest.fn()}
          onLongPress={jest.fn()}
        />,
      ),
    )
    fireEvent.press(screen.getByTestId('parent-row-1'))
    expect(onPress).toHaveBeenCalledWith(1)
  })

  it('calls onToggle when checkbox is pressed for unsent parent', () => {
    const onToggle = jest.fn()
    render(
      wrap(
        <EligibleParentRow
          parent={unsentParent}
          isSelected={false}
          onPress={jest.fn()}
          onToggle={onToggle}
          onLongPress={jest.fn()}
        />,
      ),
    )
    fireEvent.press(screen.getByTestId('parent-checkbox-1'))
    expect(onToggle).toHaveBeenCalledWith(1)
  })

  it('checkbox is checked when isSelected=true', () => {
    render(
      wrap(
        <EligibleParentRow
          parent={unsentParent}
          isSelected
          onPress={jest.fn()}
          onToggle={jest.fn()}
          onLongPress={jest.fn()}
        />,
      ),
    )
    expect(
      screen.getByTestId('parent-checkbox-1').props.accessibilityState?.checked,
    ).toBe(true)
  })

  it('sent row shows sent badge and checkbox is disabled', () => {
    render(
      wrap(
        <EligibleParentRow
          parent={sentParent}
          isSelected={false}
          onPress={jest.fn()}
          onToggle={jest.fn()}
          onLongPress={jest.fn()}
        />,
      ),
    )
    expect(screen.getByTestId('sent-badge-2')).toBeTruthy()
    expect(
      screen.getByTestId('parent-checkbox-2').props.accessibilityState?.disabled,
    ).toBe(true)
  })

  it('calls onLongPress on long press', () => {
    const onLongPress = jest.fn()
    render(
      wrap(
        <EligibleParentRow
          parent={sentParent}
          isSelected={false}
          onPress={jest.fn()}
          onToggle={jest.fn()}
          onLongPress={onLongPress}
        />,
      ),
    )
    fireEvent(screen.getByTestId('parent-row-2'), 'longPress')
    expect(onLongPress).toHaveBeenCalledWith(2)
  })
})
