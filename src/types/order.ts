import type { PosStudent } from './student'

export type OrderPaymentMethod = 'cash' | 'gcash' | 'wallet' | 'subscription'

export type OrderStatus = 'completed' | 'voided'

export interface OrderItem {
  pos_menu_item_id: number
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  branch_id: number
  student_id: number | null
  cashier_id: number
  receipt_number: string
  payment_method: OrderPaymentMethod
  subtotal: string
  discount_amount: string
  total: string
  amount_tendered: string | null
  change_amount: string | null
  reference_number: string | null
  notes: string | null
  is_credit: boolean
  credit_amount: number
  points_earned: number
  status: OrderStatus
  voided_at: string | null
  void_reason: string | null
  created_at: string
  items: OrderItem[]
  student: PosStudent | null
  cashier: { id: number; name: string }
  // Checkout response extras
  wallet_balance_remaining?: number
  credit_balance_after?: number
  credit_used?: number
}
