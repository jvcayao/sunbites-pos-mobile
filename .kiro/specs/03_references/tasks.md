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
- [ ] All 8 sub-sections navigate from references index — verify on device
- [ ] Role-gated sections redirect unauthorized — verify on device
- [ ] Meal planner grid edits and saves — verify on staging
