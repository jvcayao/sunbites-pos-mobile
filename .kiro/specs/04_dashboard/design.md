# Design — 04 Dashboard

## API

**Endpoint:** `GET /dashboard`
**Refetch interval:** 60 000 ms

```typescript
// src/api/dashboard.ts
export const dashboardApi = {
  get:             () => client.get<DashboardData>('/dashboard'),
  updateStaffStatus: (userId: number, status: StaffStatus) =>
    client.post('/dashboard/staff-status', { user_id: userId, status }),
}
```

## Types (`src/types/dashboard.ts`)

```typescript
export type StaffStatus = 'Working' | 'Off' | 'OnLeave' | 'Emergency' | 'OnBreak'

export interface DashboardOrder {
  id: number; receipt_number: string; created_at: string
  student_name: string | null; item_count: number
  payment_method: OrderPaymentMethod; total: number
}

export interface StaffMember {
  id: number; full_name: string; roles: UserRole[]; status: StaffStatus
}

export interface TopItem {
  name: string; qty_sold: number
}

export interface LowStockItem {
  id: number; name: string; quantity: number; status: 'LOW' | 'OUT'
}

export interface CreditAlert {
  id: number; full_name: string; grade_level: string; credit_balance: number
}

export interface DashboardData {
  total_students: number; enrolled_count: number; meals_today: number
  revenue_today: number; walkin_orders: number; wallet_orders: number
  recent_orders: DashboardOrder[]
  staff_roster: StaffMember[]
  top_items: TopItem[]
  low_stock: LowStockItem[]
  credit_alerts: CreditAlert[]
}
```

## React Query Hook (`src/hooks/useDashboard.ts`)

```typescript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useUpdateStaffStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, status }) => dashboardApi.updateStaffStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  })
}
```

## Screen Layout

```
app/(app)/dashboard/index.tsx

┌──────────────────────────────────┐
│  Dashboard       [Updated Xs ago]│  ← AppBar or sticky header
├─────────────┬────────────────────┤
│ [KPI Card]  │ [KPI Card]         │  ← 2-col grid, 3 rows
│ [KPI Card]  │ [KPI Card]         │
│ [KPI Card]  │ [KPI Card]         │
├──────────────────────────────────┤
│  Recent Orders (last 10)         │  ← SectionHeader + FlatList card rows
├──────────────────────────────────┤
│  Staff Roster                    │  ← SectionHeader + rows with status tap
├──────────────────────────────────┤
│  Top Items                       │  ← SectionHeader + ranked rows
├──────────────────────────────────┤
│  Low Stock ⚠                     │  ← SectionHeader + alert rows (tappable)
├──────────────────────────────────┤
│  Outstanding Credits             │  ← SectionHeader + alert rows (tappable)
└──────────────────────────────────┘
```

All sections are inside a single `ScrollView` (not nested FlatLists).
Recent orders rendered as a static list of 10 rows (no pagination on dashboard).

## Components (`src/components/dashboard/`)

| Component | Purpose |
|---|---|
| `KpiCard` | Stat card — label + large number + optional icon |
| `SectionHeader` | Bold section title with optional right link |
| `OrderRow` | Single recent order row with payment badge |
| `StaffRow` | Staff member row with tappable status badge |
| `StaffStatusPicker` | Bottom sheet list of 5 status options |
| `TopItemRow` | Rank + name + qty |
| `AlertRow` | Low stock / credit alert row — tappable, colored |

## Navigation from Dashboard

- Low Stock row → `router.push('/(app)/references/inventory')`
- Credit Alert row → `router.push(`/(app)/students/${id}`)`
