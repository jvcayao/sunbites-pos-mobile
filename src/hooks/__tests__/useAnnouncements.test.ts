import { renderHook, waitFor, act } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useAnnouncementList,
  useAnnouncementDetail,
  useCreateAnnouncement,
} from '../useAnnouncements'
import { announcementsApi } from '@/api/announcements'

jest.mock('@/api/announcements', () => ({
  announcementsApi: {
    list: jest.fn(),
    show: jest.fn(),
    create: jest.fn(),
  },
}))

const mockApi = announcementsApi as jest.Mocked<typeof announcementsApi>

let queryClient: QueryClient

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeEach(() => jest.clearAllMocks())

describe('useAnnouncementList', () => {
  it('fetches first page via useInfiniteQuery', async () => {
    const page1 = {
      data: [{ id: 1, title: 'Test', message_preview: 'Preview', sender_name: 'Admin', recipient_type: 'parents', recipient_count: 5, read_count: 3, created_at: '2026-06-20T08:00:00Z' }],
      meta: { current_page: 1, last_page: 2, total: 2, per_page: 15, from: 1, to: 1 },
      links: { first: '', last: '', prev: null, next: 'page2' },
    }
    mockApi.list.mockResolvedValue({ data: page1 } as any)

    const { result } = renderHook(() => useAnnouncementList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.list).toHaveBeenCalledWith({ page: 1 })
    expect(result.current.data?.pages[0]).toEqual(page1)
  })

  it('returns empty pages on empty list', async () => {
    const emptyPage = {
      data: [],
      meta: { current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 },
      links: { first: '', last: '', prev: null, next: null },
    }
    mockApi.list.mockResolvedValue({ data: emptyPage } as any)

    const { result } = renderHook(() => useAnnouncementList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.pages[0].data).toEqual([])
  })

  it('is in error state when API fails', async () => {
    mockApi.list.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useAnnouncementList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useAnnouncementDetail', () => {
  it('fetches announcement detail by id', async () => {
    const detail = {
      id: 42,
      title: 'Holiday',
      message_preview: 'Canteen closed',
      message: 'Full message here',
      sender_name: 'Admin',
      recipient_type: 'parents',
      recipient_count: 3,
      read_count: 1,
      created_at: '2026-06-20T08:00:00Z',
      recipients: [{ id: 1, full_name: 'Parent A', read_at: null }],
    }
    mockApi.show.mockResolvedValue({ data: detail } as any)

    const { result } = renderHook(() => useAnnouncementDetail(42), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.show).toHaveBeenCalledWith(42)
    expect(result.current.data).toEqual(detail)
  })

  it('does not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useAnnouncementDetail(undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.show).not.toHaveBeenCalled()
  })
})

describe('useCreateAnnouncement', () => {
  it('calls create API and invalidates announcement list on success', async () => {
    mockApi.create.mockResolvedValue({ data: {} } as any)
    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      result.current.mutate({
        message: 'Test announcement',
        recipient_type: 'staff',
        recipient_ids: [1, 2],
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.create).toHaveBeenCalledWith({
      message: 'Test announcement',
      recipient_type: 'staff',
      recipient_ids: [1, 2],
    })
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['announcements'] }),
    )
  })

  it('is in error state when create API fails', async () => {
    mockApi.create.mockRejectedValue(new Error('Validation error'))
    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ message: 'x', recipient_type: 'parents', recipient_ids: [] })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
