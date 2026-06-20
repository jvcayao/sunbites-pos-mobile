# Requirements — 13 Announcements

## Overview

Staff-authored broadcast messages sent to parents or co-workers (staff). Announcements are composed by admin/manager/supervisor and delivered in real time via Reverb to recipients' notification bells. On mobile, staff can view the announcements list, compose new announcements, and view announcement detail with recipient read status.

**Depends on:** Spec 11 (NotificationBell receives `AnnouncementNotification` events). API Spec 12.

---

## Role Access

| Action | Roles |
|---|---|
| View announcements list | admin, manager, supervisor |
| Create announcement | admin, manager, supervisor |
| View announcement detail | admin, manager, supervisor |

Navigation item: **Megaphone icon**, visible to admin/manager/supervisor.

---

## REQ-ANN-001 — Announcements List

- Route: `app/(app)/announcements/index.tsx`
- Display branch-scoped announcements, newest first.
- Per row:
  - Sender name
  - Recipient type badge (Parents = purple, Staff = blue)
  - Message preview (first 100 characters)
  - Recipient count (e.g. "12 recipients")
  - Read summary (e.g. "8/12 read")
  - Relative sent date
- Tap row → navigate to announcement detail.
- Pull-to-refresh.
- Paginated with infinite scroll.
- **Add** button (FAB) → navigate to create screen (supervisor+ only).

## REQ-ANN-002 — Create Announcement

- Route: `app/(app)/announcements/create.tsx`
- Form fields:
  - **Title** (optional text input, max 255 chars)
  - **Message** (required textarea, max 1000 chars, character count shown: `N/1000`)
  - **Recipient Type**: pill toggle — Parents | Staff (exactly one must be selected)
  - **Recipients**: searchable multi-select list
    - Parents: all parents linked to the active branch
    - Staff: all staff in the active branch excluding the sender
    - "Select All" shortcut
- Validation:
  - Message: required, non-empty.
  - Recipients: at least one must be selected → 422 if empty (server also enforces).
  - Recipient type: required.
- **Send button** → `POST /announcements` → success toast → navigate back to list.
- On success, the announcement is broadcast to recipients' `staff.{userId}` or `parents.{id}` channels in real time.

## REQ-ANN-003 — Announcement Detail

- Route: `app/(app)/announcements/[id].tsx`
- Displays:
  - Title (if present) or "Announcement"
  - Sender name + sent date/time
  - Recipient type badge (Parents = purple, Staff = blue)
  - Full message text
  - Read summary header (e.g. "8 of 12 recipients have read this")
  - Recipient list with name + `read_at` timestamp (or "Not yet read")
- Pull-to-refresh.

## REQ-ANN-004 — Announcement in NotificationBell

- When a staff user receives an `AnnouncementNotification` on their `staff.{userId}` channel:
  - The `NotificationBell` unread count increments (via query invalidation — see Spec 11).
  - The notification appears in the notifications page with type-aware title and 2-line preview.
  - Tapping the notification navigates to `/(app)/announcements/{announcement_id}`.

---

## Cross-Cutting Requirements

- Announcements are **immutable after sending** — no edit endpoint.
- Recipients are scoped to active branch only. Out-of-branch recipients are silently skipped server-side.
- Parents and Staff can **never** be mixed in a single announcement.
- Recipient list is dispatched via a queue on the server — large batches may arrive with a slight delay.
- The app must **not** send a notification if the recipient list is empty (422 from server).
