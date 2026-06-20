# Design — 02 Reports

## Color Palette (inherited from ~/sunbites-pos)

Web app uses OKLch via Tailwind v4 CSS variables. Mobile equivalents in `src/theme/index.ts`:

| Web token | Hex | Usage in Reports |
|---|---|---|
| `--color-primary` | `#F97316` | Orange badges, active filters |
| `--color-foreground` | `#09090B` | Body text |
| `--color-muted` | `#F4F4F5` | Card backgrounds, skeleton |
| `--color-muted-foreground` | `#71717A` | Secondary labels |
| `--color-border` | `#E4E4E7` | Table dividers, card borders |
| `--color-destructive` | `#EF4444` | Error, low balance, Out of Stock |
| green-500 | `#22C55E` | Enrolled, Paid, OK status |
| yellow-500 | `#EAB308` | Paused, LOW status |
| blue-500 | `#3B82F6` | GCash, Graduated, Subscription |
| purple-500 | `#A855F7` | Subscription payment method |

---

## Navigation Architecture

Reports uses a **drawer/menu pattern** inside the Reports tab:

```
app/(app)/reports/
  index.tsx          ← Report menu (list of 8 reports as cards)
  sales.tsx
  students.tsx
  wallet.tsx
  inventory.tsx
  billing.tsx
  credits.tsx
  activity.tsx
  daily-summary.tsx
  _layout.tsx        ← Stack navigator; header shown with back button
```

`reports/index.tsx` shows a menu grid of 8 report cards. Tapping any card pushes the corresponding report screen onto the stack.

---

## Shared Components (`src/components/reports/`)

### `SummaryCard`
```typescript
interface SummaryCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon?: string           // MaterialCommunityIcons name
  color?: string          // accent color for icon background
}
```
Renders a white card with label, large value, optional sub-label and colored icon. Matches web app KPI cards.

### `ReportTable`
Generic scrollable table abstraction:
- `columns: { key, label, width?, align? }[]`
- `data: Record<string, any>[]`
- `renderCell?: (key, value, row) => ReactNode` for custom cell rendering
- Bottom loading indicator for infinite scroll

### `FilterBar`
Horizontal scroll area containing `FilterChip` components:
- Active filter chips shown with orange fill
- Inactive chips shown with zinc-100 background

### `DatePresetPicker`
Bottom sheet with preset options: Today / This Week / This Month / Last Month / Custom Range. Custom Range shows two `DateTimePicker` inputs.

### `StatusBadge`
```typescript
type BadgeVariant = 'enrolled'|'paused'|'unenrolled'|'banned'|'graduated'
                  | 'cash'|'gcash'|'wallet'|'subscription'
                  | 'ok'|'low'|'out'|'over'
                  | 'restock'|'sale'|'waste'|'manual'
                  | 'charged'|'settled'|'voided'
                  | 'paid'|'unpaid'
```
Maps variant → `{ bg, text }` color pair. Single source of truth for all badge colors across all report pages.

### `EmptyState`
Centered icon + message when no rows match filters.

### `SkeletonRow`
Animated gray placeholder row shown during initial data load.

---

## API Layer (`src/api/reports.ts`)

All report endpoints follow a consistent pattern:

```typescript
export const reportsApi = {
  sales:        (params: SalesParams)        => client.get('/reports/sales', { params }),
  students:     (params: StudentsParams)     => client.get('/reports/students', { params }),
  wallet:       (params: WalletParams)       => client.get('/reports/wallet', { params }),
  inventory:    (params: InventoryParams)    => client.get('/reports/inventory', { params }),
  billing:      (params: BillingParams)      => client.get('/reports/billing', { params }),
  credits:      (params: CreditsParams)      => client.get('/reports/credits', { params }),
  activity:     (params: ActivityParams)     => client.get('/reports/activity', { params }),
  dailySummary: (date: string)               => client.get('/reports/daily-summary', { params: { date } }),
}
```

Params types live in `src/types/reports.ts`.

---

## React Query Hooks (`src/hooks/useReports.ts`)

```typescript
export function useSalesReport(params: SalesParams)
export function useStudentsReport(params: StudentsParams)
export function useWalletReport(params: WalletParams)
export function useInventoryReport(params: InventoryParams)
export function useBillingReport(params: BillingParams)
export function useCreditsReport(params: CreditsParams)
export function useActivityLog(params: ActivityParams)
export function useDailySummary(date: string)
```

All hooks use:
- `staleTime: 60_000`
- `keepPreviousData: true` (smooth filter transitions)
- `queryKey: ['reports', reportName, params]`

---

## Report Types (`src/types/reports.ts`)

```typescript
// Shared
interface ReportMeta { total: number; page: number; per_page: number; last_page: number }

// Sales
interface SalesReportItem { id, receipt_number, created_at, cashier_name, student_name,
  item_count, payment_method, discount_amount, total }
interface SalesSummary { total_revenue, total_orders, avg_order_value, total_discounts, net_revenue }

// Students
interface StudentsReportItem { id, student_number, full_name, grade_level, section,
  enrollment_status, wallet_balance, total_spent }
interface StudentsSummary { total_enrolled, by_grade: Record<string,number>,
  by_status: Record<string,number> }

// Wallet
interface WalletReportItem { id, full_name, grade_level, wallet_balance,
  total_credited, total_debited, last_transaction_at }
interface WalletSummary { total_credits, total_debits, net_movement, below_threshold_count }

// Inventory
interface InventoryReportItem { id, name, unit, quantity, restock_threshold,
  overstock_threshold, cost_per_unit, status, updated_at }
interface InventoryLogItem { id, created_at, item_name, type, quantity_change,
  quantity_after, notes, adjusted_by, order_id }
interface InventorySummary { out_of_stock, below_threshold, overstock }

// Billing
interface BillingReportItem { id, student_number, full_name, grade_level, section,
  school_month, amount, status, paid_on, recorded_by }
interface BillingSummary { total_subscribers, total_collected, total_outstanding, collection_rate }

// Credits
interface CreditsReportItem { id, created_at, full_name, grade_level, type,
  amount, notes, staff_name }
interface CreditsSummary { total_charged, total_settled, total_voided, net_outstanding }

// Activity
interface ActivityItem { id, created_at, user_name, action, category, subject,
  properties: Record<string, any> }

// Daily Summary
interface DailySummaryData {
  date, total_orders,
  by_payment_method: Array<{ method, count, amount }>,
  by_cashier: Array<{ name, orders, amount }>,
  items_sold: Array<{ name, qty, revenue }>
}
```

---

## Screen Layout Pattern

Every report screen follows this structure:

```
┌────────────────────────────────┐
│  ← Back   [Report Title]       │  ← Stack header (headerShown: true)
├────────────────────────────────┤
│  [SummaryCard] [SummaryCard]   │  ← Horizontal scroll or 2-col grid
├────────────────────────────────┤
│  [FilterBar / DatePreset]      │  ← Sticky filter row
├────────────────────────────────┤
│  [ReportTable rows ...]        │  ← Scrollable FlatList
│  [loading / empty state]       │
└────────────────────────────────┘
```

The summary cards + filter row scroll away with the list on mobile (not sticky headers).

---

## Per-Screen Specifics

### Sales (`reports/sales.tsx`)
- `FlatList` of order rows; each row is a `<Surface>` card (not a traditional table on narrow screens).
- Payment method badge inline in each row.
- Tapping a row shows a bottom sheet with full order detail (items, cashier, timestamps).

### Inventory (`reports/inventory.tsx`)
- Top-level `<SegmentedButtons>` to switch between Snapshot and Log History.
- Snapshot: `FlatList` of inventory items with status badge.
- Log History: additional Item filter dropdown + `FlatList` of log entries.

### Activity Log (`reports/activity.tsx`)
- Each row is an `<Accordion>`-style `<Surface>`. Tap to expand and reveal properties.
- Properties rendered as key-value `<DataTable.Row>` items inside the expanded section.

### Daily Summary (`reports/daily-summary.tsx`)
- Date picker at top (defaults to today).
- Three static `<DataTable>` sections (no pagination).
- Share button: `Share.share()` from `react-native` with plain-text summary.

---

## Dependency on Foundation

- `src/theme/index.ts` — palette with exact web app hex values ✓ (already updated)
- `src/api/client.ts` — Axios instance with auth headers ✓
- `src/lib/formatters.ts` — `formatCurrency`, `formatDate` ✓
- `src/lib/constants.ts` — `SCHOOL_MONTHS`, `PAYMENT_METHODS`, etc. ✓
