# Implementation Plan — 12 Payment Reminders

- [x] 1. Create types (`src/types/reminder.ts`)
  - Define `EligibleParent`, `EligibleParentStudent`, `SendRemindersResponse`, `ReminderParentDetail`, `PaymentHistoryEntry`, `ReminderParentStudent`
  - Write unit tests for type shape validation
  - Added `getTotalAmountDue()` and `getAllStudents()` helpers with full test coverage
  - _Requirements: REQ-REM-001, REQ-REM-002, REQ-REM-003_

- [x] 2. Create API layer (`src/api/reminders.ts`)
  - Implement `remindersApi`: `bellCount`, `eligibleParents`, `send`, `parentDetail`
  - Write unit tests mocking all 4 API calls
  - _Requirements: REQ-REM-001, REQ-REM-002, REQ-REM-003_

- [x] 3. Create React Query hooks (`src/hooks/useReminders.ts`)
  - `useReminderBellCount()` — `queryKey: ['reminders-bell-count']`
  - `useEligibleParents(params)` — `useInfiniteQuery`
  - `useSendReminders()` — mutation; invalidates bell-count + eligible-parents on success
  - `useReminderParentDetail(id)` — `queryKey: ['reminders-parent', id]`
  - Write unit tests for all hooks covering success and error states
  - _Requirements: REQ-REM-001, REQ-REM-002, REQ-REM-003_

- [x] 4. Build reminders list screen (`app/(app)/reminders/index.tsx`)
  - [x] 4.1 `EligibleParentRow` component — checkbox, parent name/email, student count, total, sent badge
    - Write component tests: unsent row is selectable, sent row is grayed and disabled, long-press enables force select
    - Row press navigates to detail; checkbox press toggles selection
    - _Requirements: REQ-REM-002_
  - [x] 4.2 `SendRemindersBar` sticky bottom bar — selected count + Send button
    - Disabled when count = 0 or outside reminder window
    - Write component tests: button disabled when empty selection, button shows correct count
    - _Requirements: REQ-REM-002_
  - [x] 4.3 `DuplicateWarningSheet` — lists already-sent parents' sent dates before force-send
    - Write component tests: sheet shown when force=true, confirm calls send with force flag
    - _Requirements: REQ-REM-002_
  - [x] 4.4 List screen with infinite scroll, pull-to-refresh, "Select All Unsent" toggle
    - Write integration tests: list renders, select all selects only unsent, send button calls API, success toast shown
    - _Requirements: REQ-REM-002_

- [x] 5. Build parent detail screen (`app/(app)/reminders/[id].tsx`)
  - `PaymentHistoryTable` per student with Month | Amount | Status | Paid Date columns
  - Send Reminder button (admin/manager only, hidden for supervisor)
  - Pull-to-refresh via `RefreshControl`
  - Write component tests: payment table renders correctly, send button hidden for supervisor
  - _Requirements: REQ-REM-003_

- [x] 6. Wire navigation badge on Reminders bottom tab
  - Fetch `useReminderBellCount()` and display as tab badge via `tabBarBadge` in `_layout.tsx`
  - Badge hidden when count = 0
  - Refresh on tab focus (`useFocusEffect`) in list screen
  - Added `reminders` and `reminders_send` permission keys to `src/lib/permissions.ts`
  - Write tests: badge shown when count > 0, badge hidden when count = 0
  - _Requirements: REQ-REM-001_
