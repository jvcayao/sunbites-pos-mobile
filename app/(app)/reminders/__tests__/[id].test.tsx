import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'
import { PaperProvider } from 'react-native-paper'
import ParentDetailScreen from '../[id]'
import { useReminderParentDetail, useSendReminders } from '@/hooks/useReminders'
import { usePermission } from '@/lib/permissions'

jest.mock('@/hooks/useReminders', () => ({
  useReminderParentDetail: jest.fn(),
  useSendReminders: jest.fn(),
}))

jest.mock('@/lib/permissions', () => ({
  usePermission: jest.fn(),
}))

jest.mock('@/lib/formatters', () => ({
  formatCurrency: (n: number) => `₱${n.toFixed(2)}`,
  formatDate: (s: string) => s,
}))

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: '1' }),
}))

const mockUseReminderParentDetail = useReminderParentDetail as jest.MockedFunction<
  typeof useReminderParentDetail
>
const mockUseSendReminders = useSendReminders as jest.MockedFunction<typeof useSendReminders>
const mockUsePermission = usePermission as jest.MockedFunction<typeof usePermission>

const parentDetail = {
  id: 1,
  full_name: 'Maria Santos',
  email: 'maria@example.com',
  phone: '09123456789',
  students: [
    {
      id: 1,
      full_name: 'Ana Santos',
      grade_level: 'Grade 3',
      payment_history: [
        { id: 1, school_month: 'June', school_year: 2026, amount: 810, status: 'paid' as const, paid_at: '2026-06-05T00:00:00Z' },
        { id: 2, school_month: 'July', school_year: 2026, amount: 810, status: 'unpaid' as const, paid_at: null },
      ],
    },
  ],
}

function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <PaperProvider>{children}</PaperProvider>
}

function renderScreen() {
  return render(<ParentDetailScreen />, { wrapper: Wrapper })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseReminderParentDetail.mockReturnValue({
    data: parentDetail,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
  } as any)
  mockUseSendReminders.mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  mockUsePermission.mockReturnValue(true)
})

describe('ParentDetailScreen — content', () => {
  it('shows parent contact info', () => {
    renderScreen()
    expect(screen.getByText('Maria Santos')).toBeTruthy()
    expect(screen.getByText('maria@example.com')).toBeTruthy()
    expect(screen.getByText('09123456789')).toBeTruthy()
  })

  it('shows student name and grade', () => {
    renderScreen()
    expect(screen.getByText('Ana Santos')).toBeTruthy()
    expect(screen.getByText(/grade 3/i)).toBeTruthy()
  })

  it('shows payment history with month, amount, and status columns', () => {
    renderScreen()
    expect(screen.getByText('June')).toBeTruthy()
    expect(screen.getByText('July')).toBeTruthy()
    expect(screen.getByText('Paid')).toBeTruthy()
    expect(screen.getByText('Unpaid')).toBeTruthy()
  })
})

describe('ParentDetailScreen — send reminder button', () => {
  it('shows Send Reminder button for admin/manager', () => {
    mockUsePermission.mockReturnValue(true)
    renderScreen()
    expect(screen.getByTestId('send-reminder-single-btn')).toBeTruthy()
  })

  it('hides Send Reminder button for supervisor', () => {
    mockUsePermission.mockReturnValue(false)
    renderScreen()
    expect(screen.queryByTestId('send-reminder-single-btn')).toBeNull()
  })

  it('calls send API with this parent id on press', async () => {
    const mutate = jest.fn()
    mockUseSendReminders.mockReturnValue({ mutate, isPending: false } as any)
    mockUsePermission.mockReturnValue(true)
    renderScreen()

    fireEvent.press(screen.getByTestId('send-reminder-single-btn'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { parent_ids: [1] },
        expect.any(Object),
      )
    })
  })
})

describe('ParentDetailScreen — loading state', () => {
  it('shows loading indicator when fetching', () => {
    mockUseReminderParentDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
    renderScreen()
    expect(screen.getByTestId('parent-detail-loading')).toBeTruthy()
  })
})
