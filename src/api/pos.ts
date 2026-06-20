import client from './client'
import type { PosMenuItem } from '@/types/menu'
import type { Order } from '@/types/order'

export const posApi = {
  // Students
  lookupStudent: (data: { type: 'qr' | 'search'; value: string }) =>
    client.post('/pos/students/lookup', data),
  getStudent: (id: number) =>
    client.get(`/pos/students/${id}`),

  // Menu items
  menuItems: () =>
    client.get<PosMenuItem[]>('/pos/menu-items'),
  createMenuItem: (data: { name: string; price: number; category: string; sort_order?: number }) =>
    client.post('/pos/menu-items', data),
  updateMenuItem: (id: number, data: { name?: string; price?: number; category?: string; sort_order?: number }) =>
    client.put(`/pos/menu-items/${id}`, data),
  toggleMenuItem: (id: number) =>
    client.post(`/pos/menu-items/${id}/toggle`),
  deleteMenuItem: (id: number) =>
    client.delete(`/pos/menu-items/${id}`),

  // Orders — API uses /orders not /pos/transactions
  checkout: (payload: {
    student_id?: number
    payment_method: string
    items: Array<{ pos_menu_item_id: number; quantity: number }>
    notes?: string
    discount_amount?: number
    discount_reason?: string
    amount_tendered?: number
    reference_number?: string
    is_credit?: boolean
  }) => client.post<Order>('/pos/checkout', payload),

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
  adjustStock: (id: number, data: { type: 'restock' | 'waste' | 'manual'; quantity: number; notes?: string }) =>
    client.post(`/pos/inventory/${id}/adjust`, data),
}
