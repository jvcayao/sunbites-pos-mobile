# Design — 12 Payment Reminders

## Navigation

```
app/(app)/reminders/
  index.tsx      ← Eligible parents list + send action
  [id].tsx       ← Parent detail + payment history
```

Bottom tab: `bell-ring` icon, visible to admin/manager/supervisor. Badge count from `GET /reminders/bell-count`.

---

## API Layer (`src/api/reminders.ts`)

```typescript
export const remindersApi = {
  bellCount: () =>
    client.get<{ count: number }>('/reminders/bell-count'),
  eligibleParents: (params?: { page?: number; per_page?: number }) =>
    client.get<PaginatedResponse<EligibleParent>>('/reminders/eligible-parents', { params }),
  send: (data: { parent_ids: number[]; force?: boolean }) =>
    client.post<SendRemindersResponse>('/reminders/send', data),
  parentDetail: (id: number) =>
    client.get<ReminderParentDetail>(`/reminders/parents/${id}`),
}
```

---

## Types (`src/types/reminder.ts`)

```typescript
interface EligibleParentPeriod {
  school_month: string
  year: number
  was_sent: boolean
  last_sent_at: string | null
  send_count: number
  total_amount: number
  students: { id: number; full_name: string }[]
}

interface EligibleParent {
  id: number
  full_name: string
  email: string
  total_send_count: number
  has_overdue: boolean
  unpaid_periods: EligibleParentPeriod[]
}

interface SendRemindersResponse {
  sent: number
  skipped: number
  skipped_names: string[]
}

interface PaymentHistoryEntry {
  id: number
  school_month: string
  school_year: number
  amount: number
  status: 'paid' | 'unpaid'
  paid_at: string | null
}

interface ReminderParentStudent {
  id: number
  full_name: string
  grade_level: string
  payment_history: PaymentHistoryEntry[]
}

interface ReminderParentDetail {
  id: number
  full_name: string
  email: string
  phone: string | null
  students: ReminderParentStudent[]
}
```

---

## React Query Hooks (`src/hooks/useReminders.ts`)

```typescript
export function useReminderBellCount()        // queryKey: ['reminders-bell-count']
export function useEligibleParents(params)    // useInfiniteQuery, queryKey: ['reminders', params]
export function useSendReminders()            // mutation → invalidates bell-count + eligible-parents
export function useReminderParentDetail(id)   // queryKey: ['reminders-parent', id]
```

---

## Reminders List Screen (`app/(app)/reminders/index.tsx`)

```
┌─────────────────────────────────────────────┐
│  ← Payment Reminders      [Select All Unsent]│
├─────────────────────────────────────────────┤
│  ☐  Maria Santos  •  2 students  •  ₱1,620  │  ← unsent (selectable)
│     maria@email.com                          │
├─────────────────────────────────────────────┤
│  ✓  Juan dela Cruz  •  1 student  •  ₱810   │  ← sent (grayed, checked = sent)
│     Sent: Jun 10, 2026                       │
├─────────────────────────────────────────────┤
│               [Send (1) Reminders]           │  ← sticky bottom bar
└─────────────────────────────────────────────┘
```

**Multi-select state:** `useState<Set<number>>` for selected parent IDs.

**Force resend:** Long-press on a sent row reveals a "Force select" option that adds them to selection with `force: true` in the payload.

**Send button** disabled when selection is empty or outside reminder window.

---

## Parent Detail Screen (`app/(app)/reminders/[id].tsx`)

```
┌─────────────────────────────────────────────┐
│  ← Maria Santos                             │
│  maria@email.com  •  09123456789            │
├─────────────────────────────────────────────┤
│  Student: Ana Santos (Grade 3)              │
│  ┌───────────────────────────────────────┐  │
│  │ Month   │ Amount │ Status  │ Paid Date │  │
│  │ June    │ ₱810   │ Paid    │ Jun 5     │  │
│  │ July    │ ₱810   │ Unpaid  │ —         │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│             [Send Reminder]                  │  ← admin/manager only
└─────────────────────────────────────────────┘
```

---

## Components (`src/components/reminders/`)

| Component | Purpose |
|---|---|
| `EligibleParentRow` | Selectable row with checkbox, parent info, student count, total amount, sent badge |
| `SendRemindersBar` | Sticky bottom bar showing selected count + Send button |
| `DuplicateWarningSheet` | Confirmation sheet listing already-sent parents before force-send |
| `PaymentHistoryTable` | Per-student table of school month payments (Month / Amount / Status / Paid Date) |
