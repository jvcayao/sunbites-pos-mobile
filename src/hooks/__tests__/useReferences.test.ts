import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useInventoryItemLogs } from '../useReferences'
import { referencesApi } from '@/api/references'

jest.mock('@/api/references', () => ({
  referencesApi: {
    inventory: {
      logs: jest.fn(),
    },
  },
}))

const mockLogs = referencesApi.inventory.logs as jest.MockedFunction<typeof referencesApi.inventory.logs>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useInventoryItemLogs', () => {
  it('queries /references/inventory/{id}/logs and returns data', async () => {
    const logs = [{ id: 1, type: 'restock', quantity_change: 10, stock_after: 20 }]
    mockLogs.mockResolvedValue({ data: logs } as any)

    const { result } = renderHook(() => useInventoryItemLogs(5), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockLogs).toHaveBeenCalledWith(5)
    expect(result.current.data).toEqual(logs)
  })

  it('uses query key [references, inventory-item-logs, id]', async () => {
    mockLogs.mockResolvedValue({ data: [] } as any)
    const { result } = renderHook(() => useInventoryItemLogs(99), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockLogs).toHaveBeenCalledWith(99)
  })
})
