# Tasks — 02 Reports

## Task List

### 1. Shared Infrastructure

- [x] Create `src/types/reports.ts` — all 8 report param + response types
- [x] Implement `src/api/reports.ts` — all 8 reportsApi functions (GET /reports/*)
- [x] Create `src/hooks/useReports.ts` — React Query hooks (infinite for paginated, query for daily summary + inventory)
- [x] Create `src/components/reports/SummaryCard.tsx` — colored top-border KPI card
- [x] Create `src/components/reports/StatusBadge.tsx` — single badge for all variants (enrollment, payment, inventory, log, credit)
- [x] Update `app/(app)/reports/_layout.tsx` — Stack with orange header tint

### 2. Reports Index Screen

- [x] Implement `app/(app)/reports/index.tsx` — 2-col grid of 8 report cards with icon + description; navigates to each report

### 3–10. All 8 Report Screens

- [x] `reports/sales.tsx` — 5 summary cards, FlatList orders, date/payment/customer filters
- [x] `reports/students.tsx` — enrolled count summary, FlatList students, status/type filters
- [x] `reports/wallet.tsx` — credit/debit summary, low-balance banner, FlatList, date filter
- [x] `reports/inventory.tsx` — 3 summary cards, SegmentedButtons Snapshot/History tabs, status filter
- [x] `reports/billing.tsx` — 3 summary cards incl. collection %, year/month/status filters
- [x] `reports/credits.tsx` — 3 summary cards, search input, date/type filters
- [x] `reports/activity.tsx` — expandable rows, search, date/category filters, key-value properties view
- [x] `reports/daily-summary.tsx` — date picker, total orders, 3 DataTables, Share button

### 11. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] All 8 screens navigate from reports index — verify on device
- [x] Filters update data — verify on staging
- [x] Pull-to-refresh — verify on device
