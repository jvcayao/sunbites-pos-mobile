# Tasks — 05 POS

## Task List

### 1. Types & API

- [x] Create `src/types/pos.ts` — `CheckoutPayload`, `TransactionParams`, `CreateMenuItemDto`, `StockAdjustDto`, `InlineReloadDto`, `PosInventoryItem`
- [x] Implement `src/api/pos.ts` — full: POST lookupStudent, menuItems CRUD, checkout, GET /orders, POST /orders/{id}/void, inlineReload, posInventory, adjustStock
- [x] Create `src/hooks/usePos.ts` — all React Query hooks and mutations

### 2. Student Search & QR

- [x] Create `src/components/pos/StudentSearchInput.tsx` — search + QR detection + dropdown + selected card + walk-in toggle
- [x] Create `src/components/pos/QrScannerModal.tsx` — expo-camera barcode scanner, SB- pattern validation
- [x] Create `src/components/pos/ChangeStudentDialog.tsx`
- [x] Create `src/components/pos/StudentNotFoundDialog.tsx`

### 3. Menu Grid

- [x] Create `src/components/pos/MenuGrid.tsx` — category chips, search, FlatList 2-col (3 on tablet)
- [x] Create `src/components/pos/MenuItemCard.tsx` — badges, cart qty, disabled states

### 4. Cart Panel

- [x] Create `src/components/pos/CartPanel.tsx` — items, notes, discount, totals, payment, checkout
- [x] Create `src/components/pos/CartItemRow.tsx`
- [x] Create `src/components/pos/DiscountInput.tsx`
- [x] Create `src/components/pos/PaymentMethodSelector.tsx`
- [x] Create `src/components/pos/CashInput.tsx`
- [x] Create `src/components/pos/CheckoutConfirmSheet.tsx`
- [x] Create `src/components/pos/InsufficientFundsSheet.tsx`

### 5. Receipt

- [x] Create `src/components/pos/ReceiptModal.tsx` — full receipt + Share.share() + New Order

### 6. POS Host Screen

- [x] Implement `app/(app)/pos/index.tsx`
- [x] Phone: full-screen + FAB → Modal cart panel
- [x] Tablet/landscape: split-pane 60/40 via useLayout()
- [x] All wiring: student → cart, menu → cart, checkout → receipt

### 7. Transactions Tab

- [x] usePosTransactions with infinite scroll + date/payment/status filters
- [x] Create `src/components/pos/TransactionRow.tsx`
- [x] Create `src/components/pos/VoidOrderSheet.tsx`

### 8–9. Menu Mgmt & Inventory Tabs

- [x] MenuMgmtTab.tsx — create/edit/toggle/delete menu items with form bottom sheet, Switch toggle, ConfirmDialog
- [x] PosInventoryTab.tsx — stock list with status badges + StockAdjustSheet per item

### 10. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] QR scan + student lookup — verify on device
- [x] Cart + checkout + receipt — verify on staging
- [x] Tablet split-pane — verify on tablet/landscape

---

## Phase 2 — Menu Mgmt Alignment (API spec 04-menu-and-products)

The following tasks address gaps between the API spec and the existing mobile implementation.
Source of truth: `/Users/jhersonn/sunbites-api/.kiro/specs/04-menu-and-products/requirements.md`

### 11. Types — Complete POS Type Definitions

- [x] Update `src/types/pos.ts` — add `PosInventoryItem` interface: `{ id: number; name: string; quantity: number; unit: string; restock_threshold: number; status: InventoryStatus }`
- [x] Verify `InventoryStatus` type is defined as `'OK' | 'LOW' | 'OUT' | 'OVER'` (not `string`)
- [x] Verify `CheckoutPayload` uses `use_credit?: boolean` only — remove any duplicate `is_credit` field if present
- [x] Run `npx tsc --noEmit` — 0 errors

### 12. Types & API — Subscription Item + Linked Stock

- [x] Update `src/types/pos.ts` — add fields to `PosMenuItem`: `is_subscription_item: boolean | null`, `has_inventory_mapping: boolean`, `inventory_status: 'OK' | 'LOW' | 'OUT' | 'OVER'`
- [x] Update `src/types/pos.ts` — add `is_subscription_item: boolean | null` to `CreateMenuItemDto`
- [x] Update `src/types/pos.ts` — add `LinkedStockItem` interface: `{ id: number; name: string; unit: string; quantity_used: number }`
- [x] Update `src/types/pos.ts` — add `AttachLinkedStockDto` interface: `{ inventory_item_id: number; quantity_used: number }`
- [x] Update `src/api/pos.ts` — add `getLinkedStock(menuItemId)` → `GET /references/menu-items/{id}/ingredients`
- [x] Update `src/api/pos.ts` — add `attachLinkedStock(menuItemId, data)` → `POST /references/menu-items/{id}/ingredients`
- [x] Update `src/api/pos.ts` — add `detachLinkedStock(menuItemId, inventoryItemId)` → `DELETE /references/menu-items/{id}/ingredients/{inventoryItemId}`
- [x] Update `src/hooks/usePos.ts` — add `useLinkedStock(menuItemId)` query (queryKey: `['pos-linked-stock', menuItemId]`)
- [x] Update `src/hooks/usePos.ts` — add `useAttachLinkedStock()` mutation (invalidates `['pos-linked-stock', menuItemId]` + `['pos-menu-items']`)
- [x] Update `src/hooks/usePos.ts` — add `useDetachLinkedStock()` mutation (invalidates `['pos-linked-stock', menuItemId]` + `['pos-menu-items']`)
- [x] Run `npx tsc --noEmit` — 0 errors

### 12. MenuItemCard — Subscription Badge + Null State

- [x] Update `src/components/pos/MenuItemCard.tsx` — add blue "Subscription" badge when `is_subscription_item === true`
- [x] Update `src/components/pos/MenuItemCard.tsx` — when `is_subscription_item === null`: apply 50% opacity + disable tap (item is not configured)
- [x] Badge priority order (highest wins):
  1. `is_subscription_item === null` — grey/unselectable, no badge
  2. `inventory_status === 'OUT'` — grey/unselectable, red "Out of Stock" badge
  3. `has_inventory_mapping === false` — grey/unselectable, orange "Not linked" badge
  4. `inventory_status === 'LOW'` — selectable, yellow "Low Stock" badge
  5. `is_subscription_item === true` — selectable, blue "Subscription" badge
- [x] Run `npx tsc --noEmit` — 0 errors

### 13. LinkedStockSheet Component

- [x] Create `src/components/pos/LinkedStockSheet.tsx`
  - Props: `menuItemId: number; menuItemName: string; visible: boolean; onClose: () => void`
  - Renders as a bottom sheet (Modal + ScrollView)
  - Header: "Linked Stock: {menuItemName}"
  - Calls `useLinkedStock(menuItemId)` for the list
  - Table rows: Item name, unit, qty per sale, Remove button (with inline confirmation before detaching)
  - "Add Link" form at bottom: inventory item Picker (from `usePosInventory()` active items) + quantity TextInput (numeric, default 1) + "Add Link" button
  - Calls `useAttachLinkedStock()` and `useDetachLinkedStock()`
  - Warning notice below form: *"All menu items must have at least one stock item linked before they can be sold at checkout."*
  - Loading + error states handled
- [x] Run `npx tsc --noEmit` — 0 errors

### 14. MenuMgmtTab — Layout + Subscription Field + Link Stock Button

- [x] Update `src/components/pos/MenuMgmtTab.tsx` (or equivalent Menu Mgmt tab component):
  - Move "Add New Item" form to the **top** of the tab (above item cards), styled with dashed border
  - Add "Subscription Eligible" `Picker`/`Select` to the Add form: options are "Not configured" (null), "Yes — covered by subscription" (true), "No — regular only" (false); maps to `is_subscription_item` in `CreateMenuItemDto`
  - Add "Not linked" orange badge on each item card when `has_inventory_mapping === false`
  - Add "Link Stock" button on each item card that opens `LinkedStockSheet` for that item
  - Pass `menuItemId` and `menuItemName` to `LinkedStockSheet`
  - Remove "Edit Item" action if present (API spec does not support edit; users delete and re-add)
- [x] Run `npx tsc --noEmit` — 0 errors

### 15. StockAdjustSheet — Reason Field Fix

- [x] Update `src/components/pos/StockAdjustSheet.tsx` (or equivalent): rename `notes` field to `reason`; make it **required** (not optional); add validation that reason is non-empty before allowing submission
- [x] Update `src/api/pos.ts` `adjustStock()` call — payload uses `reason: string` not `notes`
- [x] Update `src/types/pos.ts` `StockAdjustDto` — `reason: string` (required), remove `notes?: string`
- [x] Run `npx tsc --noEmit` — 0 errors

### 16. Final Verify — Phase 2

- [x] `npx tsc --noEmit` — 0 errors ✅ 2026-06-20
- [x] `npx jest --passWithNoTests` — all tests pass (110/110) ✅ 2026-06-20
- [ ] Manually verify: Menu Mgmt tab Add form appears at top
- [ ] Manually verify: "Subscription Eligible" select works; newly added item shows correct badge on POS grid
- [ ] Manually verify: "Link Stock" opens `LinkedStockSheet`; can add and remove linked stock items
- [ ] Manually verify: "Not linked" orange badge appears on unlinked items in Menu Mgmt tab
- [ ] Manually verify: POS grid shows blue "Subscription" badge for eligible items; null-configured items are greyed and unselectable
- [ ] Manually verify: Stock Adjust form shows "Reason *" as required; submission fails if reason is blank
