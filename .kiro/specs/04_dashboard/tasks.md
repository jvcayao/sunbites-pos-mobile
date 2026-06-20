# Tasks — 04 Dashboard

## Task List

### 1. Types & API

- [x] Create `src/types/dashboard.ts` — `DashboardData`, `DashboardOrder`, `StaffMember`, `StaffStatus`, `TopItem`, `LowStockItem`, `CreditAlert`
- [x] Implement `src/api/dashboard.ts` — `get()` (`GET /dashboard`) and `updateStaffStatus()` (`POST /staff-daily-statuses`)
- [x] Create `src/hooks/useDashboard.ts` — `useDashboard()` with 60s staleTime + 60s refetchInterval, `useUpdateStaffStatus()` mutation invalidating ['dashboard']

### 2. Dashboard Components

- [x] Create `src/components/dashboard/KpiCard.tsx` — label + large value + optional icon with colored background circle
- [x] Create `src/components/dashboard/SectionHeader.tsx` — bold title + optional right slot
- [x] Create `src/components/dashboard/OrderRow.tsx` — receipt, time, customer, items, payment badge (color-coded), total
- [x] Create `src/components/dashboard/StaffRow.tsx` — name, role, tappable status badge (5 color variants)
- [x] Create `src/components/dashboard/StaffStatusPicker.tsx` — Modal bottom sheet with 5 status options + dot indicators
- [x] Create `src/components/dashboard/TopItemRow.tsx` — rank circle, item name, qty sold
- [x] Create `src/components/dashboard/AlertRow.tsx` — icon, name, value; stock=yellow, credit=red; tappable

### 3. Dashboard Screen

- [x] Implement `app/(app)/dashboard/index.tsx`
- [x] Fetch data with `useDashboard()` hook
- [x] Render 6 KPI cards — 2 columns on phone, 3 columns on landscape/tablet (useLayout())
- [x] Render Recent Orders section — last 10 orders using OrderRow
- [x] Render Staff Roster section — StaffRow; tap opens StaffStatusPicker
- [x] Wire `useUpdateStaffStatus` — fires mutation, closes picker, invalidates dashboard query
- [x] Render Top Items section using TopItemRow with rank
- [x] Low Stock Alerts — AlertRow navigates to references/inventory
- [x] Credit Alerts — AlertRow navigates to students/{id}
- [x] "Updated X ago" subtitle in Appbar using date-fns formatDistanceToNow
- [x] Pull-to-refresh with orange RefreshControl
- [x] Skeleton loading (SkeletonKpi + SkeletonCard) on first load
- [x] Empty state per section when no data

### 4. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [ ] All 6 KPI cards render with correct values — verify on staging
- [ ] Staff status updates without full page reload — verify on staging
- [ ] Low stock / credit rows navigate to correct screens — verify on device
- [ ] Auto-refresh fires every 60 seconds — verify on staging
