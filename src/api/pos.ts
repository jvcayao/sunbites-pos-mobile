import client from './client'
import type { PosMenuItem } from '@/types/menu'
import type { Order } from '@/types/order'
import type { CheckoutPayload, StockAdjustDto, AttachLinkedStockDto, LinkedStockItem } from '@/types/pos'

export const posApi = {
  // Students
  lookupStudent: (data: { type: 'qr' | 'search'; value: string }) =>
    client.post('/pos/students/lookup', data),
  getStudent: (id: number) =>
    client.get(`/pos/students/${id}`),

  // Menu items
  menuItems: () =>
    client.get<PosMenuItem[]>('/pos/menu-items'),
  createMenuItem: (data: { name: string; price: number; category: string; is_subscription_item: boolean | null; sort_order?: number }) =>
    client.post('/pos/menu-items', data),
  updateMenuItem: (id: number, data: { name?: string; price?: number; category?: string; is_subscription_item?: boolean | null; sort_order?: number }) =>
    client.put(`/pos/menu-items/${id}`, data),
  toggleMenuItem: (id: number) =>
    client.post(`/pos/menu-items/${id}/toggle`),
  deleteMenuItem: (id: number) =>
    client.delete(`/pos/menu-items/${id}`),

  // Linked stock (ingredient mapping)
  getLinkedStock: (menuItemId: number) =>
    client.get<LinkedStockItem[]>(`/references/menu-items/${menuItemId}/ingredients`),
  attachLinkedStock: (menuItemId: number, data: AttachLinkedStockDto) =>
    client.post(`/references/menu-items/${menuItemId}/ingredients`, data),
  detachLinkedStock: (menuItemId: number, inventoryItemId: number) =>
    client.delete(`/references/menu-items/${menuItemId}/ingredients/${inventoryItemId}`),

  // Orders
  checkout: (payload: CheckoutPayload) =>
    client.post<Order>('/pos/checkout', payload),
  transactions: (params?: {
    page?: number; per_page?: number; search?: string
    date_from?: string; date_to?: string
    payment_method?: string; status?: string
  }) => client.get('/orders', { params }),
  voidOrder: (id: number, reason: string) =>
    client.post(`/orders/${id}/void`, { reason }),

  // Inline reload (wallet top-up from POS)
  inlineReload: (data: {
    student_id: number; amount: number
    payment_method: 'cash' | 'gcash' | 'bank_transfer'
    reference_number?: string; note?: string
  }) => client.post('/pos/inline-reload', data),

  // POS inventory
  posInventory: () =>
    client.get('/pos/inventory'),
  adjustStock: (id: number, data: StockAdjustDto) =>
    client.post(`/pos/inventory/${id}/adjust`, data),
}
