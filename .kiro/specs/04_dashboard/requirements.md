# Requirements — 04 Dashboard

## Overview

The Dashboard is the landing screen for Admin, Manager, and Supervisor roles. It provides a real-time snapshot of canteen operations and replicates `~/sunbites-pos/app/(kitchen)/dashboard/page.tsx`.

---

## Role Access

Visible to: `admin`, `manager`, `supervisor`. Hidden from `cashier` (tab hidden via `usePermission('dashboard')`).

---

## REQ-DSH-001 — KPI Summary Cards

- Display 6 stat cards in a 2-column grid:
  1. **Total Students** — total enrolled student count
  2. **Enrolled Count** — currently enrolled (status = enrolled)
  3. **Meals Today** — total orders placed today
  4. **Revenue Today** — total revenue for today in ₱
  5. **Walk-in Orders** — orders with no linked student today
  6. **Wallet Orders** — orders paid via wallet today
- Each card shows a label and a large value.

## REQ-DSH-002 — Recent Orders

- Display the 10 most recent orders in a scrollable list.
- Per row: Receipt #, Time (relative, e.g. "3m ago"), Customer name (or "Walk-in"), Items summary, Payment method badge, Total (₱).
- Payment method badges: Cash=green, GCash=blue, Wallet=orange, Subscription=purple.

## REQ-DSH-003 — Staff Roster Widget

- Display all staff members with their current shift status.
- Per staff row: Full name, Role badge, Status badge (Working / Off / OnLeave / Emergency / OnBreak).
- Tapping the status badge on a staff row opens a picker to change their status.
- Status badge colors: Working=green, Off=gray, OnLeave=blue, Emergency=red, OnBreak=yellow.
- Changing status calls `POST /dashboard/staff-status` with `{ user_id, status }`.

## REQ-DSH-004 — Top Items Widget

- Display a ranked list of the top-selling menu items for today.
- Per row: Rank number, Item name, Quantity sold today.

## REQ-DSH-005 — Low Stock Alerts Widget

- Display inventory items that are LOW or OUT of stock.
- Per row: Item name, Current quantity, Status badge (LOW=yellow, OUT=red).
- Tapping a row navigates to `references/inventory`.

## REQ-DSH-006 — Credit Alerts Widget

- Display students with an outstanding credit balance.
- Per row: Student name, Grade, Credit amount owed (₱, in red).
- Tapping a row navigates to the student's detail screen `students/{id}`.

## REQ-DSH-007 — Auto-Refresh

- All dashboard data must refresh automatically every **60 seconds**.
- A last-updated timestamp shown subtly (e.g. "Updated 12s ago").
- Pull-to-refresh manually triggers an immediate refresh.

---

## Non-Functional Requirements

- Loading skeleton shown on first load for all 6 stat cards and all widgets.
- Empty state shown in each widget when no data (e.g. "No low stock items").
- Error state with retry button if the API call fails.
