# Requirements — 11 Notifications

## Overview

Real-time notification infrastructure for Sunbites POS Mobile. Staff receive in-app notifications via Laravel Reverb WebSocket. This spec covers the WebSocket client setup, the single `NotificationBell` component in the POS header, the staff notifications management API, and the MagicBell-style notifications page.

**Depends on:** Spec 01 (EchoProvider in root layout), API Spec 10 (Reverb + notifications table + channel auth).

**Out of Scope:** Domain notification classes (announcements, pre-registration alerts) — those are covered in Specs 13 and 14. This spec covers only the infrastructure.

---

## REQ-NOT-001 — EchoProvider (WebSocket Client)

- An `EchoProvider` component must be mounted in the root layout (`app/_layout.tsx`) inside the authenticated guard.
- It must initialize `laravel-echo` with the Reverb config (`EXPO_PUBLIC_REVERB_HOST`, `EXPO_PUBLIC_REVERB_PORT`, `EXPO_PUBLIC_REVERB_SCHEME`) and the staff Bearer token read from `useAuthStore`.
- `forceTLS` must be set when `EXPO_PUBLIC_REVERB_SCHEME === 'https'`.
- The WebSocket auth endpoint is `POST /broadcasting/auth`.
- The connection must disconnect when the user logs out (cleanup via `useEffect` return).
- If the token is not yet available, the provider must not attempt to connect.

## REQ-NOT-002 — NotificationBell (POS Header — Single Bell Rule)

- **Exactly ONE `NotificationBell`** must exist in the POS screen header. No other bell, badge, or notification icon may appear in any app header.
- The bell subscribes to the `staff.{userId}` private channel after EchoProvider initializes.
- On any WebSocket event from the channel, the bell must invalidate the `['staff-notifications-unread-count']` query key, causing the badge to re-fetch.
- The badge displays the unread count from `GET /staff/notifications/unread-count`. The badge is hidden when count = 0.
- Tapping the bell navigates to the notifications page (`/(app)/notifications`).

## REQ-NOT-003 — Staff Notifications Page

- Route: `app/(app)/notifications/index.tsx`
- Display all staff notifications for the authenticated user, newest first.
- Notifications use **MagicBell design**:
  - Unread dot (colored) shown left of title for unread notifications.
  - Type-aware title derived from the notification type FQCN (discriminated union — see Design).
  - 2-line preview of the notification message.
  - Relative timestamp (e.g. "2m ago", "3h ago", "Yesterday").
  - `...` context menu per row: Mark as Read, Delete.
- **Empty state**: "You're all caught up" with a bell-check icon.
- **Mark All Read** button in the header/appbar.
- Pull-to-refresh.
- Paginated with infinite scroll.

## REQ-NOT-004 — Notification Actions

- **Mark single as read**: `PATCH /staff/notifications/{id}/read` — sets `read_at`.
- **Mark all as read**: `POST /staff/notifications/mark-all-read`.
- **Delete single**: `DELETE /staff/notifications/{id}` (hard delete) — confirmation dialog.
- 404 returned by API if notification does not belong to the authenticated user.

## REQ-NOT-005 — Notification Type Routing

When a notification row is tapped, the app must navigate to the relevant detail screen based on notification type:

| Notification Type | Navigate To |
|---|---|
| `AnnouncementNotification` | `/(app)/announcements/{announcement_id}` |
| `PreRegistrationNotification` | `/(app)/pre-registrations/{pre_registration_id}` |
| Unknown / generic | Stay on notifications page; mark as read |

---

## Cross-Cutting Requirements

- All WebSocket operations are best-effort — network failures must not crash the app.
- The notification count badge must update in real time when a new event arrives.
- The notifications page must also update via pull-to-refresh when WebSocket is not available.
- No PII (staff names, student names) must appear in any log output from this module.
- Notifications are **user-scoped** — a staff member only sees their own notifications.
