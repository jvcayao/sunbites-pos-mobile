# Tasks — 03 References

## Task List

### 1. Shared Infrastructure

- [x] Create `src/types/references.ts` — InventoryItemCreate, MealPlannerWeek, CreateUserDto, StaffUser, BranchDetail, BranchMonthlyAmount, SystemConfig, Parent, FeedbackItem
- [x] `src/api/references.ts` full implementation — already done (inventory, mealPlanner, users, branches, subscriptionConfig, parents, feedback, systemSettings)
- [x] Create `src/hooks/useReferences.ts` — full React Query hooks for all sub-sections
- [x] Create `src/components/references/AvatarInitials.tsx` — circular initials avatar
- [x] Create `src/components/references/RoleBadge.tsx` — role-colored badge

### 2. References Index Screen

- [x] Implement `app/(app)/references/index.tsx` — 2-col grid of visible section cards; Branches + System Settings gated by references_branches permission
- [x] Update `app/(app)/references/_layout.tsx` — Stack with orange header tint

### 3. Inventory

- [x] Implement `app/(app)/references/inventory.tsx` — SegmentedButtons list/history, FAB add, delete/archive dialog, status badges

### 4. Meal Planner

- [x] Implement `app/(app)/references/meal-planner.tsx` — month chips, week SegmentedButtons, 5×5 editable grid, save/reset/visibility toggle with ConfirmDialog

### 5. Users

- [x] `app/(app)/references/users/index.tsx` — FlatList, AvatarInitials, RoleBadge, search + role + status filters
- [x] `app/(app)/references/users/create.tsx` — 4-section form (personal, employment, account with role chips, branch multi-select)
- [x] `app/(app)/references/users/[id].tsx` — header card, 3-tab detail, deactivate/reactivate with ConfirmDialog

### 6. Branches

- [x] Implement `app/(app)/references/branches.tsx` — admin guard, FlatList branch cards with stats, edit + toggle dialogs

### 7. Subscription Config

- [x] Implement `app/(app)/references/subscription-config.tsx` — year filter, horizontal scroll month×branch matrix, edit cell sheet with computed amount

### 8. Parents

- [x] `app/(app)/references/parents/index.tsx` — AvatarInitials list, search, activation status badge
- [x] `app/(app)/references/parents/[id].tsx` — contact info, linked students DataTable, resend activation

### 9. Feedback

- [x] Implement `app/(app)/references/feedback.tsx` — category badge list, search, detail Modal sheet with resolved toggle and delete

### 10. System Settings

- [x] `app/(app)/references/system-settings.tsx` — admin guard, FlatList config rows, edit modal with save confirmation

### 11. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] `npx expo-doctor` passes — 21/21 ✅
- [x] All 8 sub-sections navigate from references index — verify on device
- [x] Role-gated sections redirect unauthorized — verify on device
- [x] Meal planner grid edits and saves — verify on staging

---

## Phase 2 — Alignment with API spec 04-menu-and-products

### 12. References Types — Add Response Types

- [x] Update `src/types/references.ts` — add `InventoryStatus` type: `'OK' | 'LOW' | 'OUT' | 'OVER'`
- [x] Update `src/types/references.ts` — add `InventoryLogType` type: `'restock' | 'waste' | 'manual' | 'sale'`
- [x] Update `src/types/references.ts` — add `InventoryItem` response interface (id, branch_id, name, quantity, unit, restock_threshold, overstock_threshold: number|null, cost_per_unit: number|null, is_archived: boolean, status: InventoryStatus)
- [x] Update `src/types/references.ts` — add `InventoryLog` response interface (id, inventory_item_id, order_id: number|null, adjusted_by: number, adjusted_by_name: string, type: InventoryLogType, quantity_change: number, stock_after: number, item_name_snapshot: string, reason: string, created_at: string)
- [x] Rename existing `InventoryItemCreate` → `CreateInventoryDto` for naming consistency (backward compat alias kept)
- [x] Run `npx tsc --noEmit` — 0 errors ✅

### 13. Inventory — OVER Color + Inline Add Form + Per-Item History

- [x] Update `app/(app)/references/inventory.tsx` — change OVER badge from blue to orange: `bg-orange-100 text-orange-700 border-orange-300`
- [x] Replace Add Item FAB with inline Add New Item form at the **top** of the List tab (above the FlatList), styled with dashed border. Fields: Name*, Unit*, Initial Qty* (default 0), Low Alert Qty*, Overstock Qty (optional), Cost/Unit (optional), Add button.
- [x] Add **per-item History button** `[History]` to each inventory row action area (alongside existing Delete/Archive buttons)
- [x] Per-item History button opens a modal showing that item's stock log: Date/Time, Type badge, Qty Change (± colored), Stock After, Reason, Adjusted By
- [x] `referencesApi.inventory.logs(id)` already in `src/api/references.ts` → `GET /references/inventory/${id}/logs` — verified with test ✅
- [x] Add `useInventoryItemLogs(id)` query hook to `src/hooks/useReferences.ts` (queryKey: `['inventory-item-logs', id]`) — TDD: test written first, hook added ✅
- [x] Update History tab row colors: green (`bg-green-50`) for Restock, red (`bg-red-50`) for Sale/Waste/deduct, gray (`bg-muted/30`) for Manual
- [x] Run `npx tsc --noEmit` — 0 errors ✅

### 14. Meal Planner — Visibility Dialog + Cell Colors

- [x] Update meal planner week visibility confirmation dialog:
  - Publishing: title "Publish {Month} — Week {N} to Parents?", confirm button primary color, label "Yes, Publish It"
  - Hiding: title "Hide {Month} — Week {N} from Parents?", confirm button destructive red, label "Yes, Hide It"
- [x] Cell background colors updated: Ulam=`#FFF7ED` (orange-50), Vegetables=`#F0FDF4` (green-50), Fruit=`#EFF6FF` (blue-50), Soup=`#F0F9FF` (sky-50), Snacks=`#FAF5FF` (purple-50)
- [x] Column headers use `bg-primary` (palette.orange500) `text-white` — no per-column eye icons
- [x] Run `npx tsc --noEmit` — 0 errors ✅

### 15. Final Verify — Phase 2

- [x] `npx tsc --noEmit` — 0 errors ✅
- [x] `npx jest --passWithNoTests` — 103/103 tests pass ✅
- [ ] Manually verify: OVER badge is orange in both Inventory tab and References > Inventory
- [ ] Manually verify: Add form appears inline at top of References > Inventory (no FAB)
- [ ] Manually verify: History button per row opens per-item log modal
- [ ] Manually verify: Meal planner visibility dialog shows correct text for publish/hide
- [ ] Manually verify: Meal planner cell backgrounds are correct colors per column
