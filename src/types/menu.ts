export type MenuCategory = 'meal' | 'snack' | 'drink' | 'extra'

export interface PosMenuItem {
  id: number
  name: string
  price: number
  category: MenuCategory
  is_available: boolean
  sort_order: number
  inventory_status: string | null
  has_inventory_mapping: boolean
}
