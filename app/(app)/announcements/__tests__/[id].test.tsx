import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import AnnouncementDetailScreen from '../[id]'
import { useAnnouncementDetail } from '@/hooks/useAnnouncements'
import { useLocalSearchParams } from 'expo-router'

jest.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncementDetail: jest.fn(),
}))

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useLocalSearchParams: jest.fn(),
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}))

const mockUseAnnouncementDetail = useAnnouncementDetail as jest.MockedFunction<typeof useAnnouncementDetail>
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>

const mockDetail = {
  id: 42,
  title: 'Holiday Notice',
  message: 'The canteen will be closed on Monday due to a national holiday.',
  message_preview: 'The canteen will be closed on Monday.',
  sender_name: 'Admin User',
  recipient_type: 'parents' as const,
  recipient_count: 3,
  read_count: 1,
  created_at: '2026-06-20T08:00:00Z',
  recipients: [
    { id: 1, full_name: 'Maria Santos', read_at: '2026-06-20T10:00:00Z' },
    { id: 2, full_name: 'Ana Reyes', read_at: null },
    { id: 3, full_name: 'Juan de la Cruz', read_at: null },
  ],
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseLocalSearchParams.mockReturnValue({ id: '42' })
})

describe('AnnouncementDetailScreen — loading', () => {
  it('shows activity indicator while loading', () => {
    mockUseAnnouncementDetail.mockReturnValue({ data: undefined, isLoading: true, refetch: jest.fn(), isRefetching: false } as any)
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByTestId('loading-indicator')).toBeTruthy()
  })
})

describe('AnnouncementDetailScreen — with data', () => {
  beforeEach(() => {
    mockUseAnnouncementDetail.mockReturnValue({
      data: mockDetail,
      isLoading: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as any)
  })

  it('displays the announcement title', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Holiday Notice')).toBeTruthy()
  })

  it('displays sender name', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByText(/Admin User/)).toBeTruthy()
  })

  it('displays full message body', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByText('The canteen will be closed on Monday due to a national holiday.')).toBeTruthy()
  })

  it('displays recipient type badge', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByText('Parents')).toBeTruthy()
  })

  it('shows read summary header', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByText('1 of 3 recipients have read this')).toBeTruthy()
  })

  it('shows read_at timestamp for read recipients', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    expect(screen.getByTestId('read-timestamp-1')).toBeTruthy()
  })

  it('shows "Not yet read" for unread recipients', () => {
    render(<AnnouncementDetailScreen />, { wrapper: Wrapper })
    const notYetRead = screen.getAllByText('Not yet read')
    expect(notYetRead.length).toBe(2)
  })
})
