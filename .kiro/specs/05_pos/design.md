# Design — 05 POS

## Navigation Architecture

```
app/(app)/pos/
  index.tsx           ← POS host screen with top SegmentedButtons tabs
```

POS uses a single screen with `SegmentedButtons` to switch between 4 tabs rendered as conditional `View` blocks — **not** separate route files. This avoids state loss when switching tabs (cart state must persist).

## POS Appbar Header Layout

```
┌─────────────────────────────────────────────────┐
│  [Branch Name]                    [🔔] [⋮ Menu] │
│  ← exactly ONE NotificationBell (staff.{userId}) │
└─────────────────────────────────────────────────┘
```

- `NotificationBell` subscribes to `staff.{userId}` private channel
- Badge hidden when unread count = 0
- Tapping bell → `router.push('/(app)/notifications')`
- **No** ReminderBell in the header — reminders accessed via the Reminders bottom tab

## Cart Store (already implemented in foundation)

`src/store/cart.ts` — already has `items`, `student`, `isWalkIn`, `paymentMethod`, `notes` + all actions.

## API (`src/api/pos.ts`)

```typescript
export const posApi = {
  // Students
  lookupStudent: (params: { type: 'qr' | 'search'; value: string }) =>
    client.post('/pos/students/lookup', params),
  getStudent: (id: number) =>
    client.get(`/pos/students/${id}`),

  // Menu
  menuItems: () =>
    client.get<PosMenuItem[]>('/pos/menu-items'),
  createMenuItem: (data: CreateMenuItemDto) =>
    client.post('/pos/menu-items', data),
  updateMenuItem: (id: number, data: UpdateMenuItemDto) =>
    client.put(`/pos/menu-items/${id}`, data),
  toggleMenuItem: (id: number) =>
    client.post(`/pos/menu-items/${id}/toggle`),
  deleteMenuItem: (id: number) =>
    client.delete(`/pos/menu-items/${id}`),

  // Linked Stock (ingredient mapping — under /references/menu-items/)
  getLinkedStock: (menuItemId: number) =>
    client.get<LinkedStockItem[]>(`/references/menu-items/${menuItemId}/ingredients`),
  attachLinkedStock: (menuItemId: number, data: AttachLinkedStockDto) =>
    client.post(`/references/menu-items/${menuItemId}/ingredients`, data),
  detachLinkedStock: (menuItemId: number, inventoryItemId: number) =>
    client.delete(`/references/menu-items/${menuItemId}/ingredients/${inventoryItemId}`),

  // Orders
  checkout: (payload: CheckoutPayload) =>
    client.post<Order>('/pos/checkout', payload),
  transactions: (params: TransactionParams) =>
    client.get('/orders', { params }),
  voidOrder: (id: number, reason: string) =>
    client.post(`/orders/${id}/void`, { reason }),

  // Inline reload (top-up from POS)
  inlineReload: (data: InlineReloadDto) =>
    client.post('/pos/inline-reload', data),

  // Inventory
  posInventory: () =>
    client.get('/pos/inventory'),
  adjustStock: (id: number, data: StockAdjustDto) =>
    client.post(`/pos/inventory/${id}/adjust`, data),
}
```

## Types (`src/types/pos.ts`)

```typescript
export type MenuCategory = 'meal' | 'snack' | 'drink' | 'extra'
export type InventoryStatus = 'OK' | 'LOW' | 'OUT' | 'OVER'

export interface PosMenuItem {
  id: number
  name: string
  price: number
  category: MenuCategory
  is_available: boolean
  is_subscription_item: boolean | null  // null = not configured; greyed out on POS
  sort_order: number
  has_inventory_mapping: boolean        // false = "Not linked" orange badge
  inventory_status: InventoryStatus     // worst status of linked inventory items
}

export interface LinkedStockItem {
  id: number                 // inventory_item id
  name: string               // inventory item name
  unit: string               // e.g. "piece", "pack"
  quantity_used: number      // units deducted per 1 sale of this menu item
}

export interface AttachLinkedStockDto {
  inventory_item_id: number
  quantity_used: number      // must be a positive whole number
}

export interface CheckoutPayload {
  student_id?: number
  payment_method: OrderPaymentMethod
  items: Array<{ pos_menu_item_id: number; quantity: number }>
  notes?: string
  discount_amount?: number
  discount_reason?: string
  amount_tendered?: number
  reference_number?: string
  use_credit?: boolean
}

export interface TransactionParams {
  page?: number; per_page?: number; search?: string
  date_from?: string; date_to?: string
  payment_method?: OrderPaymentMethod | 'all'
  status?: 'completed' | 'voided' | 'all'
}

export interface CreateMenuItemDto {
  name: string
  price: number
  category: MenuCategory
  is_subscription_item: boolean | null  // null = Not configured, true = Yes, false = No
  sort_order?: number
}
export type UpdateMenuItemDto = Partial<CreateMenuItemDto>

export interface StockAdjustDto {
  type: 'restock' | 'waste' | 'manual'  // Sale is system-only — never accepted here
  quantity: number
  reason: string                          // required; API rejects blank reason
}

export interface InlineReloadDto {
  student_id: number; amount: number
  payment_method: 'cash' | 'gcash' | 'bank_transfer'
  reference_number?: string; note?: string
}

export interface PosInventoryItem {
  id: number
  name: string
  quantity: number
  unit: string
  restock_threshold: number
  status: InventoryStatus            // computed: OK | LOW | OUT | OVER
}
```

## React Query Hooks (`src/hooks/usePos.ts`)

```typescript
export function usePosMenuItems()            // queryKey: ['pos-menu-items']
export function usePosTransactions(params)   // queryKey: ['pos-transactions', params]
export function usePosInventory()            // queryKey: ['pos-inventory']
export function useCheckout()                // mutation → invalidates transactions
export function useVoidOrder()               // mutation → invalidates transactions
export function useLookupStudent()           // mutation (not a query — triggered on demand)
export function useToggleMenuItem()          // mutation → invalidates menu items
export function useCreateMenuItem()          // mutation → invalidates menu items
export function useUpdateMenuItem()          // mutation → invalidates menu items
export function useDeleteMenuItem()          // mutation → invalidates menu items
export function useAdjustStock()             // mutation → invalidates pos-inventory

// Linked Stock (ingredient mapping)
export function useLinkedStock(menuItemId: number)  // queryKey: ['pos-linked-stock', menuItemId]
export function useAttachLinkedStock()              // mutation → invalidates ['pos-linked-stock', menuItemId] + ['pos-menu-items']
export function useDetachLinkedStock()              // mutation → invalidates ['pos-linked-stock', menuItemId] + ['pos-menu-items']
```

## Screen Layout (`app/(app)/pos/index.tsx`)

```
┌──────────────────────────────────────────┐
│  [POS] [Transactions] [Menu Mgmt] [Inv]  │  ← SegmentedButtons (role-filtered)
├──────────────────────────────────────────┤
│                                          │
│  POS Tab:                                │
│  ┌─────────────┐  ┌────────────────────┐ │
│  │ Student     │  │ Cart Panel         │ │
│  │ Search      │  │ Items list         │ │
│  │ ─────────── │  │ Notes              │ │
│  │ Menu        │  │ Discount (admin)   │ │
│  │ Category    │  │ Totals             │ │
│  │ Filter      │  │ Payment method     │ │
│  │ ─────────── │  │ Confirm Btn        │ │
│  │ Menu Grid   │  └────────────────────┘ │
│  └─────────────┘                         │
│  (Phone: stacked — student+menu above,   │
│   cart as bottom sheet / next screen)    │
│                                          │
└──────────────────────────────────────────┘
```

**Phone layout**: The cart is accessible via a floating "View Cart (N)" button that opens a full-screen bottom-sheet cart panel. Menu + student search fill the full screen.

**Tablet layout (confirmed — OQ-1)**: Split-pane using `useWindowDimensions`. When `width >= 768`: menu/student search on left (60%), cart panel on right (40%) rendered side-by-side — matching the web app two-column layout. When `width < 768`: phone layout.

## Components (`src/components/pos/`)

| Component | Purpose |
|---|---|
| `StudentSearchInput` | Search field + QR scanner + selected student card |
| `QrScannerModal` | Full-screen camera for QR scanning (expo-camera) |
| `MenuGrid` | Category filter + search + item grid |
| `MenuItemCard` | Single item card with badges + cart qty |
| `CartPanel` | Cart items + totals + payment + checkout |
| `CartItemRow` | Single cart item row with −/+ controls |
| `DiscountInput` | Type toggle + amount + reason (admin/manager only) |
| `PaymentMethodSelector` | 4-button payment method selector |
| `CashInput` | Tendered + change display |
| `CheckoutConfirmSheet` | Bottom sheet confirming order details |
| `InsufficientFundsSheet` | Bottom sheet for wallet shortfall |
| `ReceiptModal` | Full-screen receipt after checkout |
| `TransactionRow` | Single transaction row in history tab |
| `VoidOrderSheet` | Reason input for void action |
| `StockAdjustSheet` | Type (Restock/Waste/Manual) + qty + reason (required) + live New Total preview |
| `LinkedStockSheet` | Bottom sheet: linked inventory items table + Add Link form + Remove per row |

## Menu Management Tab — Item Card & Linked Stock Layout

### Item Card (Menu Mgmt tab)

```
┌──────────────────────────────┐
│  Subscription Meal Tray      │  ← text-sm font-bold
│     ₱135.00                  │  ← text-xl font-extrabold primary color
│     [meal]                   │  ← category badge
│  ⚠ Not linked                │  ← orange badge when has_inventory_mapping = false
│                              │
│  [ON ●]  [Link Stock]  [✕]  │  ← availability Switch + Link Stock btn + delete
└──────────────────────────────┘
```

- Category badge colors: meal=`primary/10`, snack=`amber`, drink=`blue`, extra=`muted`
- "Not linked" badge: orange — `has_inventory_mapping = false`
- Unavailable cards shown at 50% opacity
- "Link Stock" button: opens `LinkedStockSheet` bottom sheet
- Delete `[✕]`: confirmation dialog before delete

### Add New Item Form (top of tab, above card grid)

```
┌─── Add New Item ─── (dashed border) ──────────┐
│  Item Name *         Price (₱) *               │
│  [________________]  [________]                │
│  Category *          Subscription Eligible *    │
│  [meal ▾         ]   [Not configured ▾]        │
│                              [+ Add Item]       │
└────────────────────────────────────────────────┘
```

Subscription Eligible select options:
- "Not configured" → `is_subscription_item: null`
- "Yes — covered by subscription" → `is_subscription_item: true`
- "No — regular only" → `is_subscription_item: false`

### LinkedStockSheet (bottom sheet, per menu item)

```
┌──── Linked Stock: Subscription Meal Tray ──────┐
│  Inventory Item       Qty per Sale   Action     │
│  ─────────────────────────────────────────────  │
│  Juice Tetra Pack     1 piece        [Remove]   │
│  Graham Crackers      1 pack         [Remove]   │
│                                                 │
│  + Add Link                                     │
│  [Select inventory item ▾]  Qty: [1]  [Add Link]│
│                                                 │
│  ⚠ All menu items must have at least one stock  │
│    item linked before they can be sold.         │
└─────────────────────────────────────────────────┘
```

- `useLinkedStock(menuItemId)` provides the list
- `useAttachLinkedStock()` / `useDetachLinkedStock()` for mutations
- Inventory item selector populated from `posInventory()` active items
- `quantity_used` must be a positive whole number (≥ 1)

### POS Menu Grid — Subscription & Stock Badges

```
┌──────────────────────┐   ┌──────────────────────┐
│  Subscription        │   │  Snack A              │
│  Meal Tray           │   │  (Bread/Pastry)       │
│  ₱135.00  [meal]     │   │  ₱15.00   [snack]     │
│  [● Subscription]    │   │  [⚠ Low Stock]        │
└──────────────────────┘   └──────────────────────┘
┌──────────────────────┐   ┌──────────────────────┐
│  Bread Roll          │   │  Special Snack        │
│  ₱15.00   [snack]    │   │  ₱30.00   [snack]     │
│  [✕ Out of Stock]    │   │  (greyed, unselectable)│
│  (greyed out)        │   │  (is_subscription_item │
│                      │   │   = null)              │
└──────────────────────┘   └──────────────────────┘
```

Badge priorities on POS grid:
1. `is_subscription_item = null` — greyed out, unselectable (no badge, just opacity)
2. `inventory_status = OUT` — greyed out, unselectable, red "Out of Stock" badge
3. `has_inventory_mapping = false` — greyed out, unselectable, orange "Not linked" badge
4. `inventory_status = LOW` — selectable, yellow "Low Stock" badge
5. `is_subscription_item = true` — selectable, blue "Subscription" badge

## QR Detection Logic (USB HID Scanner)

The USB barcode scanner acts as a keyboard — it types `SB-XXXXXXXXXXXX` into the focused TextInput, optionally followed by CR/LF.

```typescript
const QR_PATTERN = /^SB-[A-Za-z0-9]{12}$/

function sanitizeScan(raw: string): string {
  return raw.replace(/[\r\n\s]+$/, '').trim()
}

// In onChangeText handler:
const clean = sanitizeScan(text)
if (QR_PATTERN.test(clean)) {
  // USB scanner completed a scan — trigger lookup
  handleQrValue(clean)
  return
}
// Otherwise: human typing — debounced name search
```

Key behaviours:
- `autoFocus` on the TextInput — scanner can fire without user touching the screen
- After student selected/cleared: `inputRef.current?.focus()` with 150ms delay
- Trailing CR/LF stripped via `sanitizeScan()` before pattern test
- No camera, no permission required
