# Requirements — 12 Payment Reminders

## Overview

Manual payment reminders from Admin/Manager to parents of subscription students for the upcoming school month. Staff view a list of eligible parents, select recipients, and send reminders that are delivered as in-app portal notifications (and via Reverb to parents' devices).

**Depends on:** Spec 11 (Reverb infrastructure). API Spec 11 (payment reminders endpoints, `payment_reminder_days` system config key).

**Not in scope:** Automatic/scheduled reminders (that is server-side). Reminder content editing (message is generated server-side from student payment data).

---

## Role Access

| Action | Roles |
|---|---|
| View reminders list | admin, manager, supervisor |
| Send reminders | admin, manager |
| View parent detail | admin, manager, supervisor |

Supervisor: Send button hidden (view-only).

---

## REQ-REM-001 — Reminders Bell Count (Navigation Badge)

- The **Reminders** navigation item (bottom tab, `bell-ring` icon) must display a badge showing the number of eligible but unsent parents for the upcoming school month.
- Badge fetched from `GET /reminders/bell-count` → `{ count: N }`.
- Badge hidden when count = 0.
- Refreshes on tab focus and when a send action completes.
- Returns 0 when no school month is currently within the `payment_reminder_days` window.

## REQ-REM-002 — Eligible Parents List

- Route: `app/(app)/reminders/index.tsx`
- Display a paginated list of parents eligible to receive a reminder for the upcoming school month.
- List is branch-scoped (uses `X-Branch-Id` header).
- Only subscription students' parents appear.
- Each row shows:
  - Parent full name
  - Email address
  - Number of subscription students linked (with names)
  - Total amount due (sum of `StudentMonthlyPayment.amount` for each subscription student)
  - **Sent** indicator if a reminder has already been sent this month (row grayed, checkbox disabled by default)
- **Select/Deselect All Unsent** checkbox in header row.
- Individual checkboxes per parent row (sent rows: disabled by default, can be force-selected via long-press or "Force" toggle).
- **Send (N) button** at bottom: disabled when no parents selected; calls `POST /reminders/send`.
  - Body: `{ parent_ids: number[], force?: boolean }`.
  - Response: `{ sent: number, skipped: number, skipped_names: string[] }`.
  - On success: show toast ("Sent to N parents"), refresh list and bell count.
  - If skipped > 0: show warning toast ("N parents skipped — already sent this month. Use Force to override.").
- **Duplicate Warning sheet**: when Force is toggled for already-sent parents, show a sheet listing the sent date and asking for confirmation.
- Pull-to-refresh.

## REQ-REM-003 — Parent Reminder Detail

- Route: `app/(app)/reminders/[id].tsx`
- Tapping a parent row opens their detail page.
- Displays:
  - Parent contact info (name, email, phone)
  - List of subscription students in the active branch with their school year amounts
  - Full `StudentMonthlyPayment` history per student (Month | Amount | Status | Paid Date)
- **Send Reminder** button (admin/manager only) — sends to this single parent; same API call with `parent_ids: [parent.id]`.
- Pull-to-refresh.

---

## Cross-Cutting Requirements

- Reminder window opens `payment_reminder_days` days before the 1st of the upcoming school month (default: 14). Outside this window, the list is shown but the Send button is disabled with a note.
- Out-of-branch parent IDs are silently skipped server-side (403 not thrown — API returns them in `skipped_names`).
- All amounts display with ₱ prefix via `formatCurrency()`.
- School months follow June–March school year spanning two calendar years.
