# Design — 07 Students

## Navigation

```
app/(app)/students/
  index.tsx       ← Student list with filters + batch actions
  [id].tsx        ← Student detail with 6 tabs
```

## API (`src/api/students.ts`)

```typescript
export const studentsApi = {
  // List & Detail
  list:    (params: StudentListParams) => client.get('/students', { params }),
  show:    (id: number)                => client.get(`/students/${id}`),
  update:  (id: number, data: UpdateStudentDto) => client.put(`/students/${id}`, data),
  destroy: (id: number)                => client.delete(`/students/${id}`),

  // Status & Type
  updateStatus: (id: number, data: { enrollment_status: EnrollmentStatus; reason?: string }) =>
    client.patch(`/students/${id}/status`),
  updateType: (id: number, student_type: StudentType) =>
    client.patch(`/students/${id}/type`, { student_type }),

  // QR
  regenerateQr: (id: number) => client.post(`/students/${id}/regenerate-qr`),

  // Wallet
  topUp: (id: number, data: TopUpDto) =>
    client.post(`/students/${id}/wallet/top-up`, data),
  walletTransactions: (id: number) =>
    client.get(`/students/${id}/wallet/transactions`),

  // Orders
  orders: (id: number, page: number) =>
    client.get(`/students/${id}/orders`, { params: { page } }),

  // Payments
  payments:            (id: number)              => client.get(`/students/${id}/payments`),
  togglePayment:       (id: number, payId: number) => client.patch(`/students/${id}/payments/${payId}`),
  updatePaymentAmount: (id: number, payId: number, amount: number) =>
    client.patch(`/students/${id}/payments/${payId}`, { amount }),
  addSubscriptionRange: (id: number, data: SubscriptionRangeDto) =>
    client.post(`/students/${id}/payments/range`, data),

  // Contacts
  listContacts:        (id: number)                  => client.get(`/students/${id}/contacts`),
  createContact:       (id: number, data: ContactDto) => client.post(`/students/${id}/contacts`, data),
  updateContact:       (id: number, cId: number, data: ContactDto) =>
    client.put(`/students/${id}/contacts/${cId}`, data),
  removeContact:       (id: number, cId: number)     => client.delete(`/students/${id}/contacts/${cId}`),
  resendActivation:    (id: number, cId: number)     =>
    client.post(`/students/${id}/contacts/${cId}/resend-activation`),

  // Enrollment form data
  enrollmentFormData: () => client.get('/enrollment'),
  enroll:             (data: EnrollPayload) => client.post('/enrollment', data),
}
```

## Types (`src/types/students.ts` — extends `src/types/student.ts`)

```typescript
export interface StudentListParams {
  page?: number; per_page?: number; search?: string
  grade_level?: string; enrollment_status?: EnrollmentStatus | 'all'
  student_type?: StudentType | 'all'
  month?: SchoolMonth | 'all'; payment_status?: 'paid' | 'unpaid' | 'all'
}

export interface UpdateStudentDto {
  first_name?: string; last_name?: string; grade_level?: string
  section?: string; birthday?: string; allergies?: string; notes?: string
}

export interface TopUpDto {
  amount: number; payment_method: 'cash' | 'gcash' | 'bank_transfer'
  reference_number?: string; note?: string
}

export interface SubscriptionRangeDto {
  subscription_start_month: SchoolMonth; subscription_start_year: number
  subscription_end_month: SchoolMonth;   subscription_end_year: number
}

export interface ContactDto {
  full_name: string; relationship: string; phone: string
  email?: string; address: string; is_primary?: boolean
}

export interface WalletTransaction {
  id: number; created_at: string; type: string; amount: number; note?: string
}
```

## React Query Hooks (`src/hooks/useStudents.ts`)

```typescript
export function useStudentList(params: StudentListParams)
export function useStudentDetail(id: number)
export function useStudentContacts(id: number)
export function useStudentPayments(id: number)
export function useStudentOrders(id: number, page: number)
export function useStudentWalletTransactions(id: number)
export function useUpdateStudent(id)
export function useDeleteStudent()
export function useUpdateStatus(id)
export function useUpdateType(id)
export function useTopUp(id)
export function useTogglePayment(id)
export function useAddSubscriptionRange(id)
export function useCreateContact(id)
export function useUpdateContact(id)
export function useRemoveContact(id)
export function useRegenerateQr(id)
```

## Student List Screen

```
app/(app)/students/index.tsx

┌─────────────────────────────────────┐
│  Students          [+ Enroll]       │  ← Appbar
├─────────────────────────────────────┤
│  [All] [Subscription(N)] [Non-Sub(N)]│  ← Type tabs (SegmentedButtons)
├─────────────────────────────────────┤
│  🔍 Search...                       │  ← Search input
│  Grade▼  Status▼  Month▼  Payment▼  │  ← Filter dropdowns
├─────────────────────────────────────┤
│  [ ] [Avatar] Name    Status  ₱Bal  │  ← Student card
│      Grade · Contact · Date          │
│      Jun ✓ Jul ✗ Aug ✓ ...          │  ← Subscription badges
│      [Edit] [Wallet] [Remove]        │
├─────────────────────────────────────┤
│  ... more cards ...                 │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐  ← Floating bar (when selected)
│  ✕  2 selected  [Print QR Codes]   │
└─────────────────────────────────────┘
```

## Student Detail Screen

```
app/(app)/students/[id].tsx

[← Back]                         [⋮]
[Avatar] Name  Status badge  Type badge
         Grade / Section
         [Change type]
₱X,XXX.XX  |  X pts  |  QR ID: SB-...
[Top Up]         [Print QR]
────────────────────────────────────────
[Profile] [Contacts] [Wallet] [Orders] [Payment] [Logs]
────────────────────────────────────────
(tab content)
```

## Shared Student Components (`src/components/students/`)

| Component | Purpose |
|---|---|
| `StudentCard` | Full list card with badges, payments, actions |
| `MonthPaymentBadge` | Jun/Jul/.../Mar badge — tap to toggle (with permission check) |
| `WalletTopUpSheet` | Bottom sheet top-up form |
| `StatusPickerSheet` | Bottom sheet status change |
| `ChangeTypeDialog` | Confirm student type switch |
| `AddSubscriptionPeriodSheet` | Start/End month+year form |
| `ContactCard` | Single contact display in Contacts tab |
| `ContactFormSheet` | Create/Edit contact bottom sheet |
| `EditPaymentAmountSheet` | Edit monthly payment amount |
| `PrintQrSheet` | QR preview + cards-per-row + Share |
