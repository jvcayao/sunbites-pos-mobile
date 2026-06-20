import type { OrderPaymentMethod } from './order'
import type { MenuCategory } from './menu'

export interface CheckoutPayload {
  student_id?: number
  payment_method: OrderPaymentMethod
  items: Array<{ pos_menu_item_id: number; quantity: number }>
  notes?: string
  discount_amount?: number
  discount_reason?: string
  amount_tendered?: number
  reference_number?: string
  is_credit?: boolean
  use_credit?: boolean
}

export interface TransactionParams {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
  payment_method?: OrderPaymentMethod | 'all'
  status?: 'completed' | 'voided' | 'all'
}

export interface CreateMenuItemDto {
  name: string
  price: number
  category: MenuCategory
  sort_order?: number
}

export type UpdateMenuItemDto = Partial<CreateMenuItemDto>

export interface StockAdjustDto {
  type: 'restock' | 'waste' | 'manual'
  quantity: number
  notes?: string
}

export interface InlineReloadDto {
  student_id: number
  amount: number
  payment_method: 'cash' | 'gcash' | 'bank_transfer'
  reference_number?: string
  note?: string
}

export interface PosInventoryItem {
  id: number
  name: string
  unit: string
  quantity: number
  status: 'OK' | 'LOW' | 'OUT' | 'OVER'
}
