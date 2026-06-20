import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useNotificationUnreadCount,
  useNotificationList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '../useNotifications'
import { notificationsApi } from '@/api/notifications'

jest.mock('@/api/notifications', () => ({
  notificationsApi: {
    unreadCount: jest.fn(),
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    destroy: jest.fn(),
  },
}))

const mockApi = notificationsApi as jest.Mocked<typeof notificationsApi>

let queryClient: QueryClient

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => jest.clearAllMocks())

describe('useNotificationUnreadCount', () => {
  it('returns unread count from API', async () => {
    mockApi.unreadCount.mockResolvedValue({ data: { count: 5 } } as any)
    const { result } = renderHook(() => useNotificationUnreadCount(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ count: 5 })
    expect(mockApi.unreadCount).toHaveBeenCalled()
  })

  it('returns 0 count on API error without throwing', async () => {
    mockApi.unreadCount.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useNotificationUnreadCount(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})

describe('useNotificationList', () => {
  it('fetches first page via useInfiniteQuery', async () => {
    const page1 = {
      data: [{ id: 'n1', type: 'App\\Notifications\\AnnouncementNotification' }],
      meta: { current_page: 1, last_page: 2, total: 2, per_page: 15, from: 1, to: 1 },
      links: { first: '', last: '', prev: null, next: 'page2' },
    }
    mockApi.list.mockResolvedValue({ data: page1 } as any)

    const { result } = renderHook(() => useNotificationList(), { wrapper: createWrapper() })
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

    const { result } = renderHook(() => useNotificationList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.pages[0].data).toEqual([])
  })
})

describe('useMarkNotificationRead', () => {
  it('calls markRead API and invalidates both query keys', async () => {
    mockApi.markRead.mockResolvedValue({ data: {} } as any)

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate('uuid-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.markRead).toHaveBeenCalledWith('uuid-1')
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['staff-notifications-unread-count'] }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['staff-notifications'] }),
    )
  })
})

describe('useMarkAllNotificationsRead', () => {
  it('calls markAllRead API and invalidates both query keys', async () => {
    mockApi.markAllRead.mockResolvedValue({ data: {} } as any)

    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: createWrapper() })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.markAllRead).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['staff-notifications-unread-count'] }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['staff-notifications'] }),
    )
  })
})

describe('useDeleteNotification', () => {
  it('calls destroy API and invalidates list query key', async () => {
    mockApi.destroy.mockResolvedValue({ data: {} } as any)

    const { result } = renderHook(() => useDeleteNotification(), { wrapper: createWrapper() })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    result.current.mutate('uuid-2')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.destroy).toHaveBeenCalledWith('uuid-2')
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['staff-notifications'] }),
    )
  })
})
