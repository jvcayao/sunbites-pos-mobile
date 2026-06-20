import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'
import React from 'react'
import { PaperProvider } from 'react-native-paper'
import RemindersScreen from '../index'
import { useEligibleParents, useSendReminders } from '@/hooks/useReminders'
import { usePermission } from '@/lib/permissions'

jest.mock('@/hooks/useReminders', () => ({
  useReminderBellCount: () => ({ data: { count: 2 }, refetch: jest.fn() }),
  useEligibleParents: jest.fn(),
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
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb: () => void) => cb(),
}))

const mockUseEligibleParents = useEligibleParents as jest.MockedFunction<typeof useEligibleParents>
const mockUseSendReminders = useSendReminders as jest.MockedFunction<typeof useSendReminders>
const mockUsePermission = usePermission as jest.MockedFunction<typeof usePermission>

const parentUnsent = {
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

const parentSent = {
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

const fakePage = {
  data: [parentUnsent, parentSent],
  meta: { current_page: 1, last_page: 1, total: 2, per_page: 15, from: 1, to: 2 },
  links: { first: '', last: '', prev: null, next: null },
}

function setupMocks({
  canSend = true,
  mutate = jest.fn(),
}: { canSend?: boolean; mutate?: jest.Mock } = {}) {
  mockUseEligibleParents.mockReturnValue({
    data: { pages: [fakePage], pageParams: [1] },
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
    isRefetching: false,
    status: 'success',
  } as any)

  mockUseSendReminders.mockReturnValue({
    mutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
  } as any)

  mockUsePermission.mockImplementation((key) => {
    if (key === 'reminders_send') return canSend
    return true
  })
}

function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <PaperProvider>{children}</PaperProvider>
}

function renderScreen() {
  return render(<RemindersScreen />, { wrapper: Wrapper })
}

beforeEach(() => jest.clearAllMocks())

describe('RemindersScreen — list renders', () => {
  it('shows eligible parents', () => {
    setupMocks()
    renderScreen()
    expect(screen.getByText('Maria Santos')).toBeTruthy()
    expect(screen.getByText('Juan dela Cruz')).toBeTruthy()
  })

  it('shows loading indicator when fetching', () => {
    mockUseEligibleParents.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
      status: 'loading',
    } as any)
    mockUseSendReminders.mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    mockUsePermission.mockReturnValue(true)
    renderScreen()
    expect(screen.getByTestId('reminders-loading')).toBeTruthy()
  })
})

describe('RemindersScreen — selection', () => {
  it('selecting an unsent parent via checkbox enables the send button', async () => {
    setupMocks()
    renderScreen()
    await act(async () => {
      fireEvent.press(screen.getByTestId('parent-checkbox-1'))
    })
    expect(screen.getByText(/send \(1\)/i)).toBeTruthy()
  })

  it('"Select All Unsent" selects only unsent parents', async () => {
    setupMocks()
    renderScreen()
    await act(async () => {
      fireEvent.press(screen.getByTestId('select-all-btn'))
    })
    expect(screen.getByText(/send \(1\)/i)).toBeTruthy()
  })
})

describe('RemindersScreen — send action', () => {
  it('calls send API with selected parent IDs', async () => {
    const mutate = jest.fn()
    setupMocks({ mutate })
    renderScreen()

    await act(async () => {
      fireEvent.press(screen.getByTestId('parent-checkbox-1'))
    })
    await act(async () => {
      fireEvent.press(screen.getByTestId('send-reminders-btn'))
    })

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ parent_ids: [1] }),
      expect.any(Object),
    )
  })

  it('send button is hidden (not rendered) for supervisor', () => {
    setupMocks({ canSend: false })
    renderScreen()
    expect(screen.queryByTestId('send-reminders-btn')).toBeNull()
  })
})

// --- Smoke tests: AppHeader migration (REQ-MORE-007) ---
jest.mock('@/hooks/useNotifications', () => ({
  useNotificationUnreadCount: jest.fn(() => ({ data: { count: 0 } })),
}))

describe('RemindersScreen — header (REQ-MORE-007)', () => {
  const mockBranch = { id: 1, name: 'Main Branch', slug: 'main-branch' }

  beforeEach(() => {
    const { useAuthStore } = require('@/store/auth')
    useAuthStore.setState({ activeBranch: mockBranch, token: 'tok', user: null })
    setupMocks({})
  })

  it('renders BranchPill via AppHeader', () => {
    renderScreen()
    expect(screen.getByText('Main Branch')).toBeTruthy()
  })

  it('preserves the Select All Unsent control in AppHeader right slot', () => {
    renderScreen()
    expect(screen.getByTestId('select-all-btn')).toBeTruthy()
  })
})
