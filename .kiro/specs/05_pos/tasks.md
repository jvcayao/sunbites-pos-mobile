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
- [ ] QR scan + student lookup — verify on device
- [ ] Cart + checkout + receipt — verify on staging
- [ ] Tablet split-pane — verify on tablet/landscape
