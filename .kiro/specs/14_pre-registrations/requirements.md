# Requirements — 14 Pre-Registrations

## Overview

Staff-facing processing queue for pre-registration records submitted via the parent portal's public form. On mobile, authorized staff can view pending pre-registrations, edit details before approval, approve (converts to a real enrolled student), reject (with reason), and reactivate expired records.

**Depends on:** Spec 11 (NotificationBell receives `PreRegistrationNotification` for new submissions). API Spec 13.

**Not in scope:** The public pre-registration form — that is portal-only (`portal.sunbites.com.ph/pre-register`). This spec covers only the staff-facing POS side of the workflow.

---

## Role Access

| Action | Roles |
|---|---|
| View list | admin, manager, supervisor |
| Edit (pending only) | admin, manager, supervisor |
| Approve | admin, manager |
| Reject | admin, manager |
| Reactivate (expired only) | admin, manager, supervisor |

---

## REQ-PRE-001 — Pre-Registrations Navigation Item

- Route: `app/(app)/pre-registrations/index.tsx`
- Bottom tab: **ClipboardCheck** icon (`clipboard-check-outline`), visible to admin/manager/supervisor.
- Tab badge shows the count of `pending` pre-registrations in the active branch.
- Badge refreshes on tab focus and when an action (approve/reject/reactivate) is completed.

## REQ-PRE-002 — Pre-Registrations List

- Display pre-registrations scoped to the active branch.
- **Status tabs**: Pending | Approved | Rejected | Expired (default: Pending).
- Per row:
  - Student full name
  - Contact name (primary contact)
  - Enrollment type badge (Subscription = orange, Non-Subscription = gray)
  - Submitted date
  - Expires date (shown only on Pending tab — colored red if expiring within 3 days)
- Tap row → navigate to pre-registration detail.
- Pull-to-refresh.
- Paginated with infinite scroll.

## REQ-PRE-003 — Pre-Registration Detail

- Route: `app/(app)/pre-registrations/[id].tsx`
- Displays full form data: student info, enrollment type, subscription period (if applicable), contacts.
- **Duplicate warning banner**: shown when API response includes `duplicate_warning: true` and `existing_student_name`. Warning: "⚠ A student with this student number already exists: {name}. Resolve before approving."
- **reCAPTCHA score** and submitter IP shown (for fraud awareness — display-only).
- **Edit mode** (pending records only): all form fields become editable. Save calls `PATCH /pre-registrations/{id}`. Disabled for approved/rejected/expired records.
- **Action buttons** (pending only):
  - **Approve & Enroll** (admin/manager only): calls `POST /pre-registrations/{id}/approve`. On success: toast "Enrolled successfully" + navigate back to list.
  - **Reject** (admin/manager only): opens reject sheet → reason input → `POST /pre-registrations/{id}/reject`.
- **Reactivate** button (expired records only, admin/manager/supervisor): calls `POST /pre-registrations/{id}/reactivate`. On success: toast + navigate back.
- Pull-to-refresh.

## REQ-PRE-004 — Reject Sheet

- Opens as a bottom sheet from the detail screen.
- **Rejection reason** textarea (required).
- **Confirm Rejection** button → `POST /pre-registrations/{id}/reject` with `{ rejection_reason: '...' }`.
- On success: toast "Pre-registration rejected" + navigate back to list.

## REQ-PRE-005 — PreRegistrationNotification in NotificationBell

- When a new pre-registration is submitted, all staff in the branch receive a `PreRegistrationNotification` on their `staff.{userId}` channel.
- The `NotificationBell` unread count increments.
- Tapping the notification in the notifications page navigates to `/(app)/pre-registrations/{pre_registration_id}`.

---

## Cross-Cutting Requirements

- Only **pending** records are editable. Attempting to edit approved/rejected/expired → 422 from server.
- Approval is atomic: creates student + wallet + payments + contacts in a single server-side transaction via `EnrollmentService`. If student number is a duplicate in the branch → 422 with error message "Student number already exists".
- Rejection is permanent: once rejected, a record can only be reactivated to `pending` first.
- Expired records: a server-side daily command (`ExpirePreRegistrations`) automatically sets status to `expired` when `expires_at < now()`. Reactivation resets `status = pending` + extends `expires_at`.
- All amounts formatted with ₱ prefix via `formatCurrency()`.
- All dates formatted via `formatDate()`.
- Submitter IP and reCAPTCHA score are **display-only** — never sent in any mobile-initiated request.
