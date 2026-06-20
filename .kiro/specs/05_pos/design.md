# Design — 05 POS

## Navigation Architecture

```
app/(app)/pos/
  index.tsx           ← POS host screen with top SegmentedButtons tabs
```

POS uses a single screen with `SegmentedButtons` to switch between 4 tabs rendered as conditional `View` blocks — **not** separate route files. This avoids state loss when switching tabs (cart state must persist).

## Cart Store (already implemented in foundation)

`src/store/cart.ts` — already has `items`, `student`, `isWalkIn`, `paymentMethod`, `notes` + all actions.

## API (`src/api/pos.ts`)

```typescript
export const posApi = {
  // Students
  lookupStudent: (params: { type: 'qr' | 'search'; value: string }) =>
    client.get('/pos/students/lookup', { params }),
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

  // Orders
  checkout: (payload: CheckoutPayload) =>
    client.post<Order>('/pos/checkout', payload),
  transactions: (params: TransactionParams) =>
    client.get('/pos/transactions', { params }),
  voidOrder: (id: number, reason: string) =>
    client.post(`/pos/transactions/${id}/void`, { reason }),

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
  name: string; price: number; category: MenuCategory; sort_order?: number
}
export type UpdateMenuItemDto = Partial<CreateMenuItemDto>

export interface StockAdjustDto {
  type: 'restock' | 'waste' | 'manual'
  quantity: number; notes?: string
}

export interface InlineReloadDto {
  student_id: number; amount: number
  payment_method: 'cash' | 'gcash' | 'bank_transfer'
  reference_number?: string; note?: string
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
| `StockAdjustSheet` | Type + qty + notes for inventory adjustment |

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
