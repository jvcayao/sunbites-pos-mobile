# Implementation Plan — 13 Announcements

- [x] 1. Create types (`src/types/announcement.ts`)
  - Define `AnnouncementListItem`, `AnnouncementDetail`, `AnnouncementRecipient`, `CreateAnnouncementDto`, `RecipientType`
  - Write unit tests for type shape validation
  - _Requirements: REQ-ANN-001, REQ-ANN-002, REQ-ANN-003_
  - Completed: types file + 8 shape validation tests (all passing)

- [x] 2. Create API layer (`src/api/announcements.ts`)
  - Implement `announcementsApi`: `list`, `create`, `show`
  - Write unit tests mocking all 3 API calls
  - _Requirements: REQ-ANN-001, REQ-ANN-002, REQ-ANN-003_
  - Completed: 6 API tests (all passing)

- [x] 3. Create React Query hooks (`src/hooks/useAnnouncements.ts`)
  - `useAnnouncementList(params)` — `useInfiniteQuery`, `queryKey: ['announcements']`
  - `useAnnouncementDetail(id)` — `queryKey: ['announcement', id]`
  - `useCreateAnnouncement()` — mutation; invalidates `['announcements']` on success
  - Write unit tests for all hooks covering success, error, and empty states
  - _Requirements: REQ-ANN-001, REQ-ANN-002, REQ-ANN-003_
  - Completed: 7 hook tests (all passing)

- [x] 4. Build announcements list screen (`app/(app)/announcements/index.tsx`)
  - `AnnouncementRow` component — sender, recipient type badge (purple/blue), message preview, read summary, relative date
  - Infinite scroll, pull-to-refresh, empty state ("No announcements yet")
  - FAB `+` button navigates to create screen (supervisor+ only)
  - Write component tests: rows render with correct badge colors, empty state shown, FAB navigates to create
  - _Requirements: REQ-ANN-001_
  - Completed: AnnouncementRow (8 tests) + list screen (8 tests, all passing); `announcements` permission added to permissions.ts + tab to _layout.tsx

- [x] 5. Build create announcement screen (`app/(app)/announcements/create.tsx`)
  - [x] 5.1 `RecipientTypePill` toggle — Parents | Staff (mutually exclusive)
    - Write component tests: selecting Parents shows parent list, selecting Staff shows staff list, can't select both
    - _Requirements: REQ-ANN-002_
    - Completed: 6 tests (all passing)
  - [x] 5.2 `RecipientSelector` — searchable multi-select with Select All shortcut
    - Write component tests: search filters list, Select All selects all, deselect removes from selection
    - _Requirements: REQ-ANN-002_
    - Completed: 7 tests (all passing)
  - [x] 5.3 Full create form with: title (optional), message (required, 1000 char limit, live counter), recipient type pill, recipient selector
    - Inline validation: message required, at least one recipient, recipient_type required
    - Send button in appbar: disabled until message non-empty, shows inline error for no recipients
    - On success: navigate back to list
    - On empty recipients: show inline error "Please select at least one recipient"
    - Write integration tests: submit with valid data calls API, submit with no recipients shows error, character count updates live
    - _Requirements: REQ-ANN-002_
    - Completed: 6 create screen tests (all passing); uses React Query for recipient fetching

- [x] 6. Build announcement detail screen (`app/(app)/announcements/[id].tsx`)
  - Display: title, sender, sent date, recipient type badge, full message, read summary, recipient list with `read_at`
  - `RecipientReadRow` component — name + read timestamp or "Not yet read"
  - Pull-to-refresh
  - Write component tests: read_at shown for read recipients, "Not yet read" shown for unread
  - _Requirements: REQ-ANN-003_
  - Completed: RecipientReadRow (5 tests) + detail screen (8 tests, all passing)

- [x] 7. Wire NotificationBell to handle AnnouncementNotification
  - `AnnouncementNotification` type already in discriminated union (Spec 11 task 2)
  - `getNotificationRoute` already returns `/(app)/announcements/${announcement_id}`
  - Tests already passing in staff-notification.test.ts
  - _Requirements: REQ-ANN-004_
  - Completed: already implemented in Spec 11; verified 5 tests passing
