# Requirements — 03 References

## Overview

The References module provides Admin, Manager, and Supervisor roles with configuration and master-data management screens. It mirrors the reference pages from `~/sunbites-pos/app/(kitchen)/references/`, adapted for mobile.

Access varies per sub-section (see role column below).

---

## Role Access per Sub-section

| Section | View | Create/Edit | Delete/Toggle |
|---|---|---|---|
| Inventory | admin, manager, supervisor | admin, manager | admin, manager |
| Meal Planner | admin, manager, supervisor | admin, manager | admin, manager |
| Users | admin, manager | admin | admin |
| Branches | admin | admin | admin |
| Subscription Config | admin, manager | admin, manager | admin, manager |
| Parents | admin, manager, supervisor | — (read only) | admin, manager |
| Feedback | admin, manager | — (mark read, reply) | admin, manager |
| System Settings | admin | admin | — |

---

## REQ-REF-001 — Inventory

### Inventory List Tab
- Display a list of active inventory items with: Name, Unit, Current Qty (color if LOW/OUT), Low Alert threshold, Overstock threshold, Cost/Unit, Status badge, actions.
- Status badges: OK=green, LOW=yellow, OUT=red, OVER=orange.
- **Add New Item inline form** (shown at the **top** of the Inventory tab, above the item list, with a dashed border): Name*, Unit*, Initial Qty* (0 default), Low Alert Qty*, Overstock Qty (optional), Cost/Unit (optional). No FAB — the form is always visible.
- **Edit Item** (bottom sheet, same fields minus Initial Qty, plus current qty display).
- **Per-item log history**: each item row has a History action button that opens a modal showing that item's stock movement log (Date/Time, Type, Qty Change, Stock After, Reason, Adjusted By).
- Delete item: if the item has no log history, delete immediately; if it has logs, offer Archive instead.
- Unarchive button for archived items (shown in collapsed "Archived" section at bottom).

### Log History Tab
- Display cross-item log history: Date/Time, Item Name, Log Type badge, Qty Change (± with color), Qty After, Reason, Adjusted By.
- Filter by date range (from/to), log type (All, Restock, Waste, Manual, Sale), and item selector.
- Pull-to-refresh; load-more pagination (25 per page).
- **Row color coding:** green (`bg-green-50`) for Restock (stock added); red (`bg-red-50`) for Sale, Waste, or any deduction; gray (`bg-muted/30`) for Manual adjustments.

### Validation
- Name: required, max 100 chars.
- Unit: required.
- Qty: required, must be ≥ 0.
- Low Alert: required, must be ≥ 0.

---

## REQ-REF-002 — Meal Planner

- Display a weekly meal grid for the selected **month** and **week**.
- Month selector: tabs for June through March (10 school months).
- Week selector: Week 1 through Week 4.
- Grid rows: Monday through Friday.
- Grid columns: Ulam, Vegetables, Fruit, Soup, Snacks (5 meal categories).
- Each cell is editable (text input) for admin/manager.
- **Save Week** button persists the week's changes.
- **Reset Week** button reverts to default pattern (with confirmation dialog).
- **Week Visibility toggle**: shows whether this week is visible to parents; tap to toggle (with confirmation). Displays a badge (Visible / Hidden).
- Supervisors can view but not edit.

---

## REQ-REF-003 — Users

### User List
- Display a list of staff with: Avatar (initials), Full Name, Role badge, Branch(es), Active/Inactive status dot, View action.
- Filter by role (All, admin, manager, supervisor, cashier), status (All, Active, Inactive).
- Search by name or email (debounced 300ms).
- Paginated with load-more.

### Create User (full-screen form)
- 7 sections matching web app:
  1. Personal: First Name*, Last Name*, Middle Name, Nickname, Birthday, Gender, Civil Status.
  2. Contact: Phone, Emergency Contact Name, Emergency Contact Phone, Relationship.
  3. Address: Line, City, Province, Zip Code.
  4. Employment: Position, Employment Type, Date Hired, Daily Rate.
  5. Account: Email*, Password* (8+ chars, 1 uppercase, 1 digit), Confirm Password*, Role* (dropdown).
  6. Government IDs: SSS, Pag-IBIG, PhilHealth, TIN.
  7. Branch Assignment: multi-select checklist of branches.
- Validation via Zod (same rules as web app).
- Only accessible to admin role.

### User Detail / Edit
- View mode: header card with avatar, name, role badge, status indicator.
- Tabs: Personal Info, Employment, Government IDs, Branches.
- Edit mode (admin only): same form as Create but pre-filled; password fields optional (leave blank = no change).
- Admin-only actions: Send Password Reset Email, Deactivate / Reactivate (with confirmation).
- API: Deactivate → `PATCH /users/{id}/deactivate`; Reactivate → `PATCH /users/{id}/reactivate`.

---

## REQ-REF-004 — Branches

- Display a list of branch cards with: Name, Active/Inactive badge, Slug, GCash Number, Address, Stats (Staff count, Student count, Orders Today).
- Edit Branch (bottom sheet): Name*, GCash Number, Address.
- Toggle branch Active/Inactive (with confirmation dialog).
- **Admin only**. Non-admins are redirected to the References index.

---

## REQ-REF-005 — Subscription Config

- Display a matrix table: rows = school months (June–March), columns = branches.
- Each cell shows: Configured Days + Amount, or "Not configured" (gray text).
- Tap any cell to open an edit bottom sheet: School Days*, Amount Override (optional, shows computed amount = Days × Daily Meal Rate).
- Year selector at top (2024–2030).
- Fetch daily meal rate from `GET /system-configurations` (key: `daily_meal_rate`).

---

## REQ-REF-006 — Parents

### Parent List
- Display a list: Avatar (initials), Full Name, Email, Linked Students count, Activation status badge (Active/Pending).
- Search by name or email (debounced 300ms).
- Paginated with load-more.
- Tap to open Parent Detail.

### Parent Detail
- View contact info, associated students (list of student names and grades).
- **Resend Activation Email** button (admin/manager only) — visible only when parent is not yet activated; rate-limited to max 3 per 24 hours.
- **Send Password Reset Email** button (admin/manager only) — visible only when parent is already activated.
- **Disable** / **Enable** parent account (admin/manager only).
- **Delete** (soft-delete) with confirmation (admin/manager only).

---

## REQ-REF-007 — Feedback

- Display a list of feedback items: Category badge, Student Name, Preview of message, Submission date, Read indicator (dot).
- Category badges (5): Food Quality, Service, Portion Size, Cleanliness, General — each a distinct color.
- **Unread only** toggle to filter to unread items.
- Tap to open full feedback detail in a bottom sheet.
- Detail sheet: full message, category, student info, date, rating (if present), existing admin reply, Mark as Read button, reply textarea.
- Mark as Read sets `is_read = true` (admin/manager only).
- Reply saves `admin_reply`, sets `replied_at`, sends a reply email to the parent (admin/manager only).
- Delete feedback with confirmation (admin/manager only).
- Search by student name (debounced 300ms).
- Paginated with load-more.
- **Unread feedback count badge** displayed on the References nav section card for this sub-section.

---

## Shared Non-Functional Requirements

- All monetary values use `formatCurrency()`.
- All dates use `formatDate()`.
- Bottom sheets used for create/edit forms (consistent with platform conventions).
- Confirmation dialogs before all destructive actions (delete, deactivate, reset).
- Optimistic updates for toggle actions; revert on error.
- Pull-to-refresh on all lists.
- Role-gated action buttons hidden (not disabled) for unauthorized roles.

---

## REQ-REF-008 — System Settings

- **Admin only**. Non-admins are redirected to the References index.
- Display a list of all system-wide configuration entries from `GET /system-configurations`.
- Per row: Setting label (bold), description (sub-label), current value (formatted), Edit button.
- **Monetary values** (type = `decimal` or `integer`) displayed with ₱ prefix.
- **Text values** displayed as-is.
- Tapping Edit opens an **Edit Config bottom sheet**:
  - Title: "Edit: {label}".
  - Description text (if config has a description).
  - Input field: numeric for integer/decimal, text for text values.
    - Integer: step 1, min 0.
    - Decimal: step 0.01, min 0.
  - Save Changes button calls `PUT /system-configurations/{key}`.
  - Inline "Saved ✓" indicator on success (green text, fades after 2s).
  - Validation: value must be a valid number ≥ 0 for numeric types; non-empty for text.
- Negative values must be rejected client-side (and server enforces this too).

### Known Config Keys (seeded)

| Key | Default | Type | Description |
|---|---|---|---|
| `daily_meal_rate` | 135 | decimal | Daily meal rate (₱) — used in Subscription Config amount preview |
| `credit_limit` | 300 | decimal | Maximum credit balance (₱) per student |
| `loyalty_point_threshold` | 1000 | decimal | Spending threshold (₱) to earn loyalty points |
| `payment_reminder_days` | 14 | integer | Days before 1st of school month that reminder window opens |
| `pre_registration_expiry_days` | 30 | integer | Days after submission until a pending pre-registration expires |
