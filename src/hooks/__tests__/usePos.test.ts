import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useLinkedStock, useAttachLinkedStock, useDetachLinkedStock } from '../usePos'
import { posApi } from '@/api/pos'

jest.mock('@/api/pos', () => ({
  posApi: {
    getLinkedStock: jest.fn(),
    attachLinkedStock: jest.fn(),
    detachLinkedStock: jest.fn(),
    menuItems: jest.fn(),
  },
}))

const mockGetLinkedStock    = posApi.getLinkedStock    as jest.MockedFunction<typeof posApi.getLinkedStock>
const mockAttachLinkedStock = posApi.attachLinkedStock as jest.MockedFunction<typeof posApi.attachLinkedStock>
const mockDetachLinkedStock = posApi.detachLinkedStock as jest.MockedFunction<typeof posApi.detachLinkedStock>

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => jest.clearAllMocks())

describe('useLinkedStock', () => {
  it('queries /references/menu-items/{id}/ingredients', async () => {
    const linked = [{ id: 1, name: 'Juice', unit: 'piece', quantity_used: 1 }]
    mockGetLinkedStock.mockResolvedValue({ data: linked } as any)

    const { result } = renderHook(() => useLinkedStock(10), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetLinkedStock).toHaveBeenCalledWith(10)
    expect(result.current.data).toEqual(linked)
  })
})

describe('useAttachLinkedStock', () => {
  it('calls posApi.attachLinkedStock and invalidates pos-linked-stock + pos-menu-items', async () => {
    mockAttachLinkedStock.mockResolvedValue({ data: {} } as any)

    const { result } = renderHook(() => useAttachLinkedStock(), { wrapper: createWrapper() })

    result.current.mutate({ menuItemId: 10, data: { inventory_item_id: 3, quantity_used: 1 } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockAttachLinkedStock).toHaveBeenCalledWith(10, { inventory_item_id: 3, quantity_used: 1 })
  })
})

describe('useDetachLinkedStock', () => {
  it('calls posApi.detachLinkedStock and invalidates pos-linked-stock + pos-menu-items', async () => {
    mockDetachLinkedStock.mockResolvedValue({ data: {} } as any)

    const { result } = renderHook(() => useDetachLinkedStock(), { wrapper: createWrapper() })

    result.current.mutate({ menuItemId: 10, inventoryItemId: 3 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockDetachLinkedStock).toHaveBeenCalledWith(10, 3)
  })
})
