import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import PreRegistrationsScreen from '../index'
import { usePreRegistrationList } from '@/hooks/usePreRegistrations'
import { useAuthStore } from '@/store/auth'

jest.mock('@/hooks/usePreRegistrations', () => ({
  usePreRegistrationList: jest.fn(),
  usePendingCount: jest.fn(() => ({ data: 0 })),
}))

jest.mock('@/hooks/useNotifications', () => ({
  useNotificationUnreadCount: jest.fn(() => ({ data: { count: 0 } })),
}))

const mockUsePreRegistrationList = usePreRegistrationList as jest.MockedFunction<typeof usePreRegistrationList>

const mockBranch = { id: 1, name: 'Main Branch', slug: 'main-branch' }

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ activeBranch: mockBranch, token: 'tok', user: null })
  mockUsePreRegistrationList.mockReturnValue({
    data: { pages: [{ data: [], meta: { current_page: 1, last_page: 1 } }] },
    isLoading: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    refetch: jest.fn(),
    isRefetching: false,
  } as any)
})

describe('PreRegistrationsScreen — header (REQ-MORE-007)', () => {
  it('renders BranchPill via AppHeader', () => {
    render(<PreRegistrationsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Main Branch')).toBeTruthy()
  })

  it('renders the Pre-Registrations title', () => {
    render(<PreRegistrationsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Pre-Registrations')).toBeTruthy()
  })
})
