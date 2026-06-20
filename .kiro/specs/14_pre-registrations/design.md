# Design — 14 Pre-Registrations

## Navigation

```
app/(app)/pre-registrations/
  index.tsx      ← Pre-registrations list (status tabs)
  [id].tsx       ← Pre-registration detail / process
```

Bottom tab: `clipboard-check-outline` icon (MaterialCommunityIcons), visible to admin/manager/supervisor. Pending count badge on tab.

---

## API Layer (`src/api/pre-registrations.ts`)

```typescript
export const preRegistrationsApi = {
  list: (params?: { status?: PreRegistrationStatus; page?: number; per_page?: number }) =>
    client.get<PaginatedResponse<PreRegistrationListItem>>('/pre-registrations', { params }),
  show: (id: number) =>
    client.get<PreRegistrationDetail>(`/pre-registrations/${id}`),
  update: (id: number, data: UpdatePreRegistrationDto) =>
    client.patch<PreRegistrationDetail>(`/pre-registrations/${id}`, data),
  approve: (id: number) =>
    client.post<{ student_id: number }>(`/pre-registrations/${id}/approve`),
  reject: (id: number, data: { rejection_reason: string }) =>
    client.post(`/pre-registrations/${id}/reject`, data),
  reactivate: (id: number) =>
    client.post(`/pre-registrations/${id}/reactivate`),
}
```

---

## Types (`src/types/pre-registration.ts`)

```typescript
type PreRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'expired'
type EnrollmentType = 'subscription' | 'non_subscription'

interface PreRegistrationContact {
  id: number
  full_name: string
  relationship: string
  phone: string
  email: string | null
  address: string
  is_primary: boolean
}

interface PreRegistrationListItem {
  id: number
  first_name: string
  last_name: string
  full_name: string
  status: PreRegistrationStatus
  enrollment_type: EnrollmentType
  submitted_at: string
  expires_at: string | null
  contact_name: string
}

interface PreRegistrationDetail extends PreRegistrationListItem {
  student_number: string | null
  grade_level: string
  section: string | null
  birthday: string
  allergies: string | null
  notes: string | null
  subscription_start_month: string | null
  subscription_start_year: number | null
  subscription_end_month: string | null
  subscription_end_year: number | null
  contacts: PreRegistrationContact[]
  rejection_reason: string | null
  rejected_by: string | null      // full_name of rejecting user (null if not rejected)
  approved_by: string | null      // full_name of approving user (null if not approved)
  processed_at: string | null
  recaptcha_score: number | null
  submitter_ip: string | null
  duplicate_warning: boolean
  existing_student_name: string | null
}

interface UpdatePreRegistrationDto {
  first_name?: string
  last_name?: string
  student_number?: string
  grade_level?: string
  section?: string
  birthday?: string
  allergies?: string
  notes?: string
  enrollment_type?: EnrollmentType
  subscription_start_month?: string
  subscription_start_year?: number
  subscription_end_month?: string
  subscription_end_year?: number
  contacts?: Omit<PreRegistrationContact, 'id'>[]
}
```

---

## React Query Hooks (`src/hooks/usePreRegistrations.ts`)

```typescript
export function usePreRegistrationList(params)   // useInfiniteQuery, queryKey: ['pre-registrations', params]
export function usePreRegistrationDetail(id)     // queryKey: ['pre-registration', id]
export function usePendingCount()                // queryKey: ['pre-registrations-pending-count']
export function useUpdatePreRegistration()       // mutation → invalidates detail on success
export function useApprovePreRegistration()      // mutation → invalidates list + detail + pending count on success
export function useRejectPreRegistration()       // mutation → invalidates list + detail + pending count on success
export function useReactivatePreRegistration()   // mutation → invalidates list + detail + pending count on success
```

---

## Pre-Registrations List Screen

```
┌─────────────────────────────────────────────┐
│  ← Pre-Registrations                        │
│  [Pending]  Approved  Rejected  Expired      │  ← status tabs (SegmentedButtons)
├─────────────────────────────────────────────┤
│  Maria Santos  [Subscription]               │
│  Guardian: Jose Santos  •  Jun 15, 2026     │
│  Expires: Jun 25, 2026  ⚠ (red if ≤3 days) │
├─────────────────────────────────────────────┤
│  Carlos Reyes  [Non-Subscription]           │
│  Guardian: Ana Reyes  •  Jun 14, 2026       │
│  Expires: Jun 28, 2026                      │
└─────────────────────────────────────────────┘
```

Enrollment type badge colors:
- Subscription: orange (`#F97316`)
- Non-Subscription: gray (`#71717A`)

---

## Pre-Registration Detail Screen

```
┌─────────────────────────────────────────────┐
│  ← Maria Santos  [Pending]           [Edit] │
├─────────────────────────────────────────────┤
│  ⚠ Duplicate: Student number already exists │  ← shown when duplicate_warning = true
│  Existing student: Ana Santos (Grade 3)     │
├─────────────────────────────────────────────┤
│  Student Information                        │
│  Name: Maria Santos                         │
│  Student #: SB-123456                       │
│  Grade: Grade 2  •  Birthday: Mar 5, 2020   │
│  Type: Subscription  •  Jun 2026 – Mar 2027 │
├─────────────────────────────────────────────┤
│  Contacts (2)                               │
│  Jose Santos (Father)  •  09123456789       │
│  Ana Santos (Mother)   •  09987654321       │
├─────────────────────────────────────────────┤
│  Submission Info                            │
│  Submitted: Jun 15, 2026  •  reCAPTCHA: 0.9 │
│  IP: 192.168.x.x                            │
├─────────────────────────────────────────────┤
│         [Reject]    [Approve & Enroll]      │
└─────────────────────────────────────────────┘
```

Edit mode: fields become `TextInput`. Save calls `PATCH /pre-registrations/{id}`.

Reject button → `RejectSheet` bottom sheet.

Reactivate button shown only for expired records (replaces action buttons).

---

## RejectSheet (`src/components/pre-registrations/RejectSheet.tsx`)

Bottom sheet with:
- Title: "Reject Pre-Registration"
- Description: "Please provide a reason. The applicant will be notified by email."
- `reason` textarea (required, min 10 chars)
- Confirm Rejection button (red, disabled until reason is filled)
- Cancel button

---

## Components (`src/components/pre-registrations/`)

| Component | Purpose |
|---|---|
| `PreRegistrationRow` | List row with name, type badge, contact name, dates, expiry warning |
| `DuplicateWarningBanner` | Red/orange warning banner shown at top of detail when duplicate_warning = true |
| `PreRegistrationForm` | Reusable form fields for student info + contacts (used in edit mode) |
| `RejectSheet` | Bottom sheet with rejection reason input |
