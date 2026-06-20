# Implementation Plan — 11 Notifications

- [x] 1. Install dependencies and set up env vars
  - Install `laravel-echo` and `pusher-js` packages
  - Add `EXPO_PUBLIC_REVERB_*` vars to all `.env.*` files (host, port, scheme, app-key)
  - Add env vars to `app.config.ts` or `app.json` `extra` block if needed
  - _Requirements: REQ-NOT-001_
  - ✅ Implemented 2026-06-20 — laravel-echo@2.3.7 + pusher-js@8.5.0 installed; Reverb vars added to app.config.ts extra block

- [x] 2. Create notification types (`src/types/staff-notification.ts`)
  - Define `AnnouncementData` and `PreRegistrationData` interfaces
  - Define `StaffNotification` discriminated union on `type` FQCN
  - Implement `getNotificationTitle()` helper
  - Implement `getNotificationRoute()` helper
  - Write unit tests for both helpers covering all union members
  - _Requirements: REQ-NOT-005_
  - ✅ Implemented 2026-06-20 — 5 tests pass in src/types/__tests__/staff-notification.test.ts

- [x] 3. Create API layer (`src/api/notifications.ts`)
  - Implement `notificationsApi` with: `unreadCount`, `list`, `markRead`, `markAllRead`, `destroy`
  - `markAllRead` calls `POST /staff/notifications/mark-all-read` (not `read-all`)
  - Write unit tests mocking all 5 API functions
  - _Requirements: REQ-NOT-003, REQ-NOT-004_
  - ✅ Implemented 2026-06-20 — 5 tests pass in src/api/__tests__/notifications.test.ts

- [x] 4. Create `src/lib/relative-time.ts` utility
  - Implement `relativeTime(isoString)` returning "just now" / "Xm ago" / "Xh ago" / "Yesterday" / "Mon DD"
  - Write unit tests covering: <1m, <1h, <24h, yesterday, older
  - _Requirements: REQ-NOT-003_
  - ✅ Implemented 2026-06-20 — 6 tests pass in src/lib/__tests__/relative-time.test.ts

- [x] 5. Create React Query hooks (`src/hooks/useNotifications.ts`)
  - [x] 5.1 `useNotificationUnreadCount()` — `queryKey: ['staff-notifications-unread-count']`
    - Write unit tests: returns count, returns 0, handles error gracefully
    - _Requirements: REQ-NOT-002_
  - [x] 5.2 `useNotificationList()` — `useInfiniteQuery`, `queryKey: ['staff-notifications']`
    - Write unit tests: first page, next page, empty list
    - _Requirements: REQ-NOT-003_
  - [x] 5.3 Mutation hooks: `useMarkNotificationRead`, `useMarkAllNotificationsRead`, `useDeleteNotification`
    - Each must invalidate relevant query keys on success
    - Write unit tests for each mutation
    - _Requirements: REQ-NOT-004_
  - ✅ Implemented 2026-06-20 — 8 tests pass in src/hooks/__tests__/useNotifications.test.ts

- [x] 6. Create `EchoProvider` component (`src/components/notifications/EchoProvider.tsx`)
  - Initialize `laravel-echo` with Reverb config + Bearer token on mount
  - Disconnect on cleanup (logout / unmount)
  - Only connect when token is present
  - Mount inside authenticated guard in `app/_layout.tsx`
  - Write unit tests: does not connect when no token, disconnects on logout
  - _Requirements: REQ-NOT-001_
  - ✅ Implemented 2026-06-20 — 5 tests pass in src/components/notifications/__tests__/EchoProvider.test.tsx; mounted in app/_layout.tsx

- [x] 7. Create `NotificationBell` component (`src/components/notifications/NotificationBell.tsx`)
  - Subscribe to `staff.{userId}` private channel via Echo (handled in EchoProvider)
  - On any channel event: invalidate `['staff-notifications-unread-count']`
  - Display badge with unread count (hidden when 0)
  - Add to POS screen header (`app/(app)/pos/index.tsx`) — exactly ONE instance
  - Write component tests: badge shown when count > 0, badge hidden when count = 0, press navigates to `/notifications`
  - _Requirements: REQ-NOT-002_
  - ✅ Implemented 2026-06-20 — 4 tests pass in src/components/notifications/__tests__/NotificationBell.test.tsx; added to POS header

- [x] 8. Create notifications page (`app/(app)/notifications/index.tsx`)
  - [x] 8.1 `NotificationRow` component with: unread dot, type-aware title, 2-line preview, `relativeTime` timestamp, `...` context menu
    - Write component tests: unread dot shows for unread, hidden for read; title derived from type
    - _Requirements: REQ-NOT-003_
  - [x] 8.2 Notifications list screen with infinite scroll, pull-to-refresh, empty state, "Mark All Read" appbar action
    - _Requirements: REQ-NOT-003_
  - [x] 8.3 Context menu (`...`) per row: Mark as Read, Delete with ConfirmDialog
    - _Requirements: REQ-NOT-004_
  - ✅ Implemented 2026-06-20 — NotificationRow (5 tests), NotificationContextMenu, notifications page with infinite scroll; tab hidden via href: null

- [x] 9. Wire up notification type routing
  - Tapping a `NotificationRow` calls `getNotificationRoute(n)` and navigates if route is not null
  - Marks notification as read on tap (if not already read)
  - _Requirements: REQ-NOT-005_
  - ✅ Implemented 2026-06-20 — handlePress in NotificationRow calls markRead + getNotificationRoute; 156/156 tests pass, tsc 0 errors
