# Implementation Plan — 14 Pre-Registrations

- [ ] 1. Create types (`src/types/pre-registration.ts`)
  - Define `PreRegistrationStatus`, `EnrollmentType`, `PreRegistrationContact`, `PreRegistrationListItem`, `PreRegistrationDetail`, `UpdatePreRegistrationDto`
  - Write unit tests for type shape validation
  - _Requirements: REQ-PRE-001, REQ-PRE-002, REQ-PRE-003_

- [ ] 2. Create API layer (`src/api/pre-registrations.ts`)
  - Implement `preRegistrationsApi`: `list`, `show`, `update`, `approve`, `reject`, `reactivate`
  - Write unit tests mocking all 6 API calls
  - _Requirements: REQ-PRE-002, REQ-PRE-003, REQ-PRE-004_

- [ ] 3. Create React Query hooks (`src/hooks/usePreRegistrations.ts`)
  - `usePreRegistrationList(params)` — `useInfiniteQuery`, `queryKey: ['pre-registrations', params]`
  - `usePreRegistrationDetail(id)` — `queryKey: ['pre-registration', id]`
  - `usePendingCount()` — `queryKey: ['pre-registrations-pending-count']` — fetches list with `{ status: 'pending', per_page: 1 }` and returns `meta.total`
  - `useUpdatePreRegistration()` — mutation; invalidates detail on success
  - `useApprovePreRegistration()` — mutation; invalidates list + detail + pending count
  - `useRejectPreRegistration()` — mutation; invalidates list + detail + pending count
  - `useReactivatePreRegistration()` — mutation; invalidates list + detail + pending count
  - Write unit tests for all hooks covering success, error, and cache invalidation
  - _Requirements: REQ-PRE-001, REQ-PRE-002, REQ-PRE-003, REQ-PRE-004_

- [ ] 4. Build pre-registrations list screen (`app/(app)/pre-registrations/index.tsx`)
  - `PreRegistrationRow` component — name, type badge (orange/gray), contact name, submitted date, expiry (red if ≤3 days)
  - `SegmentedButtons` status tabs: Pending | Approved | Rejected | Expired
  - Infinite scroll, pull-to-refresh, empty state per status
  - Write component tests: pending tab is default, rows render with correct badge, expiry shown in red when ≤3 days
  - _Requirements: REQ-PRE-002_

- [ ] 5. Build pre-registration detail screen (`app/(app)/pre-registrations/[id].tsx`)
  - [ ] 5.1 `DuplicateWarningBanner` — shown when `duplicate_warning === true`; shows `existing_student_name`
    - Write component tests: banner shown when duplicate, hidden when not
    - _Requirements: REQ-PRE-003_
  - [ ] 5.2 Read-only detail view — student info, enrollment type, subscription period, contacts, submission info (reCAPTCHA score, IP)
    - Write component tests: all sections render, submission info section shown
    - _Requirements: REQ-PRE-003_
  - [ ] 5.3 Edit mode — fields become editable via `PreRegistrationForm`; Edit toggle in appbar (pending only)
    - Save calls `PATCH /pre-registrations/{id}`
    - Edit mode disabled for approved/rejected/expired (Edit button hidden)
    - Write component tests: Edit button hidden for non-pending, save calls API, success toast shown
    - _Requirements: REQ-PRE-003_
  - [ ] 5.4 Action buttons — Approve (admin/manager), Reject (admin/manager), Reactivate (admin/manager/supervisor for expired)
    - Approve → success toast "Enrolled successfully" → navigate back to list
    - Reject → opens `RejectSheet`
    - Reactivate → success toast "Record reactivated" → navigate back to list
    - On approve 422 (duplicate student number): show inline error "Student number already exists in this branch"
    - Write component tests: approve navigates back on success, approve shows error on 422, role-gated buttons hidden correctly
    - _Requirements: REQ-PRE-003, REQ-PRE-004_

- [ ] 6. Build `RejectSheet` component
  - Bottom sheet with rejection reason textarea (required, min 10 chars)
  - Confirm Rejection button disabled until reason filled
  - On success: toast + navigate back
  - Write component tests: button disabled when reason empty, confirm calls API with reason
  - _Requirements: REQ-PRE-004_

- [ ] 7. Wire navigation badge on Pre-Registrations bottom tab
  - Fetch `usePendingCount()` and display as tab badge
  - Badge hidden when count = 0
  - Refresh on tab focus (`useFocusEffect`)
  - Write tests: badge shows pending count, badge hidden when 0
  - _Requirements: REQ-PRE-001_

- [ ] 8. Wire NotificationBell to handle PreRegistrationNotification
  - Ensure `PreRegistrationNotification` type is in discriminated union (Spec 11 task 2)
  - Tapping notification row navigates to `/pre-registrations/{pre_registration_id}`
  - Write tests: correct route resolved for pre-registration notification type
  - _Requirements: REQ-PRE-005_
