# Requirements — 07 Students

## Overview

The Students module covers the student list page and the student detail page, replicating `~/sunbites-pos/app/(kitchen)/students/page.tsx` and `~/sunbites-pos/app/(kitchen)/students/[id]/page.tsx`.

---

## Role Access

| Action | Roles |
|---|---|
| View list & detail | admin, manager, supervisor |
| Toggle payment status | admin, manager |
| Change enrollment status | admin, manager |
| Change student type | admin, manager, supervisor |
| Manage contacts | admin, manager, supervisor |
| Delete student | admin |
| Add subscription period | admin, manager |
| Resend contact activation | admin, manager |

---

## REQ-STU-001 — Student List

- Display students in a scrollable list with filter controls at top.
- Per student row/card:
  - Avatar (initials circle), Full name, Enrollment status badge, Student type badge, Credit Owed badge (if credit > 0).
  - Grade level, Section, Primary contact name.
  - Enrollment date, Wallet balance, Points.
  - Monthly payment badges (Jun–Mar) for subscription students — tap to toggle paid/unpaid (admin/manager only).
  - **Actions**: Edit (navigate to detail), Wallet (top-up), Remove (delete).

### Filters
- **Type tabs**: All / Subscription / Non-Subscription (with count).
- **Search**: by student name (debounced 300ms).
- **Grade**: All Grades, Nursery, Kinder 1–2, Grade 1–12.
- **Status**: All, Enrolled, Paused, Unenrolled, Banned, Graduated.
- **Month** (subscription tab only): All Months, June–March.
- **Payment Status** (subscription tab only): All Payments, Paid, Unpaid.

### Batch Actions
- Checkbox per student card.
- Floating action bar when ≥1 selected: "Print QR Codes (N)" and "Clear" (✕).
- Print QR Codes: opens a preview sheet with card-per-row selector (2 or 4); uses `Share.share()` on mobile.

### Header Actions
- **"+ Enroll Student"** button navigates to `/(app)/enrollment`.

---

## REQ-STU-002 — Student Detail

### Header Area
- Back button, More Actions menu (⋮).
- Student avatar (large), Full name, Grade/Section, Status badge, Type badge.
- "Change" link to change student type (admin/manager/supervisor).
- Wallet balance (large), Points, QR ID display.
- Quick actions: Top Up Wallet, Print QR.

### More Actions Menu (⋮)
- Change Enrollment Status (admin/manager)
- Top Up Wallet
- Print QR Code
- Remove Student (admin only — destructive, red)

### Tab: Profile
- Display: First Name, Last Name, Grade Level, Section, Birthday, Student Number, Student Type, Allergies, Notes.
- **Edit** button opens inline edit mode with Save/Cancel.
- QR Code card: display QR, Print button, Download (share on mobile), Regenerate button (with confirmation).

### Tab: Contacts
- List of contacts: Full Name, Relationship badge, Primary badge, Portal Status badge, Phone, Email, Address.
- Per contact: Edit, Delete (with confirmation), Resend Activation Email (admin/manager; if portal_status = pending).
- **Add Contact** button (if < 3 contacts and has permission).

### Tab: Wallet
- Current balance (large, colored).
- **Top Up** button.
- Transaction history list: Date, Type, Amount (₱ colored), Note.

### Tab: Order History
- Paginated order list: Receipt #, Items summary, Payment method badge, Status badge, Total, Date.
- Load more pagination.

### Tab: Payment (subscription students only)
- Grouped by year (collapsible).
- Per month: School month label, Status badge (Paid/Unpaid), Mark Paid/Unpaid toggle (admin/manager), Edit Amount (admin/manager, if unpaid).
- **Add Subscription Period** button (admin/manager).

### Tab: Logs
- Read-only audit trail: Date/Time, Actor, Event description.

---

## REQ-STU-003 — Wallet Top-Up (shared modal)

Used in both the student list (quick top-up) and student detail (Wallet tab + quick action):

- Amount (₱, required, > 0).
- Payment Method: Cash, GCash, Bank Transfer (button selector).
- Reference Number (conditional — required for GCash and Bank Transfer).
- Note (optional).
- Live preview: "New Balance: ₱X.XX" (green box).
- Submit calls `POST /students/{id}/wallet/top-up`.

---

## REQ-STU-004 — Status Picker

- Radio-style list of all enrollment statuses.
- If selecting Banned or Unenrolled: reason input (required).
- Submit calls `PATCH /students/{id}/status`.

---

## REQ-STU-005 — Add Subscription Period

- Start Month (dropdown), Start Year (number), End Month (dropdown), End Year (number).
- Validation: End ≥ Start.
- Submit calls `POST /students/{id}/payments/range`.
