export type MenuCategory = 'meal' | 'snack' | 'drink' | 'extra'

export interface PosMenuItem {
  id: number
  name: string
  price: number
  category: MenuCategory
  is_available: boolean
  is_subscription_item: boolean | null
  sort_order: number
  inventory_status: 'OK' | 'LOW' | 'OUT' | 'OVER' | null
  has_inventory_mapping: boolean
}
