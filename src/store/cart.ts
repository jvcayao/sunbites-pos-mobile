import { create } from 'zustand'
import type { PosMenuItem } from '@/types/menu'
import type { PosStudent } from '@/types/student'
import type { OrderPaymentMethod } from '@/types/order'

export interface CartItem {
  menuItem: PosMenuItem
  quantity: number
}

interface CartState {
  items: CartItem[]
  student: PosStudent | null
  isWalkIn: boolean
  paymentMethod: OrderPaymentMethod
  notes: string
  addItem: (item: PosMenuItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  setStudent: (student: PosStudent | null) => void
  setIsWalkIn: (isWalkIn: boolean) => void
  setPaymentMethod: (method: OrderPaymentMethod) => void
  setNotes: (notes: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  student: null,
  isWalkIn: false,
  paymentMethod: 'cash',
  notes: '',

  addItem: (menuItem) => {
    const existing = get().items.find((i) => i.menuItem.id === menuItem.id)
    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      }))
    } else {
      set((s) => ({ items: [...s.items, { menuItem, quantity: 1 }] }))
    }
  },

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.menuItem.id !== id) })),

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set((s) => ({
      items: s.items.map((i) =>
        i.menuItem.id === id ? { ...i, quantity } : i,
      ),
    }))
  },

  setStudent: (student) => set({ student }),
  setIsWalkIn: (isWalkIn) => set({ isWalkIn }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNotes: (notes) => set({ notes }),

  clearCart: () =>
    set({ items: [], student: null, isWalkIn: false, paymentMethod: 'cash', notes: '' }),
}))
