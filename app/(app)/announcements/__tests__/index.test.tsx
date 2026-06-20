import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import AnnouncementsScreen from '../index'
import { useAnnouncementList } from '@/hooks/useAnnouncements'
import { usePermission } from '@/lib/permissions'
import { router } from 'expo-router'

jest.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncementList: jest.fn(),
}))

jest.mock('@/lib/permissions', () => ({
  usePermission: jest.fn(),
}))

const mockUseAnnouncementList = useAnnouncementList as jest.MockedFunction<typeof useAnnouncementList>
const mockUsePermission = usePermission as jest.MockedFunction<typeof usePermission>

const mockAnnouncementListItem = {
  id: 1,
  title: 'Holiday Notice',
  message_preview: 'Canteen will be closed on Monday.',
  sender_name: 'Admin User',
  recipient_type: 'parents' as const,
  recipient_count: 12,
  read_count: 8,
  created_at: '2026-06-20T08:00:00Z',
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUsePermission.mockReturnValue(true)
})

describe('AnnouncementsScreen — loading', () => {
  it('shows activity indicator while loading', () => {
    mockUseAnnouncementList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByTestId('loading-indicator')).toBeTruthy()
  })
})

describe('AnnouncementsScreen — empty state', () => {
  it('shows empty state when no announcements', () => {
    mockUseAnnouncementList.mockReturnValue({
      data: { pages: [{ data: [], meta: { current_page: 1, last_page: 1 } }] },
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('No announcements yet')).toBeTruthy()
  })
})

describe('AnnouncementsScreen — with data', () => {
  beforeEach(() => {
    mockUseAnnouncementList.mockReturnValue({
      data: {
        pages: [{
          data: [mockAnnouncementListItem],
          meta: { current_page: 1, last_page: 1 },
        }],
      },
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
  })

  it('renders announcement rows', () => {
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Admin User')).toBeTruthy()
    expect(screen.getByText('Canteen will be closed on Monday.')).toBeTruthy()
  })

  it('shows Parents badge for parents announcements', () => {
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Parents')).toBeTruthy()
  })

  it('navigates to detail when row is pressed', () => {
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    fireEvent.press(screen.getByTestId('announcement-row'))
    expect(router.push).toHaveBeenCalledWith('/(app)/announcements/1')
  })
})

describe('AnnouncementsScreen — FAB', () => {
  beforeEach(() => {
    mockUseAnnouncementList.mockReturnValue({
      data: { pages: [{ data: [], meta: { current_page: 1, last_page: 1 } }] },
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
  })

  it('shows FAB when user has create permission', () => {
    mockUsePermission.mockReturnValue(true)
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByTestId('create-announcement-fab')).toBeTruthy()
  })

  it('hides FAB when user lacks create permission', () => {
    mockUsePermission.mockReturnValue(false)
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.queryByTestId('create-announcement-fab')).toBeNull()
  })

  it('navigates to create screen when FAB is pressed', () => {
    mockUsePermission.mockReturnValue(true)
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    fireEvent.press(screen.getByTestId('create-announcement-fab'))
    expect(router.push).toHaveBeenCalledWith('/(app)/announcements/create')
  })
})

// --- Smoke tests: AppHeader migration (REQ-MORE-007) ---
jest.mock('@/hooks/useNotifications', () => ({
  useNotificationUnreadCount: jest.fn(() => ({ data: { count: 0 } })),
}))

describe('AnnouncementsScreen — header (REQ-MORE-007)', () => {
  const mockBranch = { id: 1, name: 'Main Branch', slug: 'main-branch' }

  beforeEach(() => {
    const { useAuthStore } = require('@/store/auth')
    useAuthStore.setState({ activeBranch: mockBranch, token: 'tok', user: null })
    mockUseAnnouncementList.mockReturnValue({
      data: { pages: [{ data: [], meta: { current_page: 1, last_page: 1 } }] },
      isLoading: false, isFetchingNextPage: false, fetchNextPage: jest.fn(),
      hasNextPage: false, refetch: jest.fn(), isRefetching: false,
    } as any)
  })

  it('renders BranchPill via AppHeader', () => {
    render(<AnnouncementsScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Main Branch')).toBeTruthy()
  })
})
