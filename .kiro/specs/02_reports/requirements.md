# Requirements — 02 Reports

## Overview

The Reports module provides Admin and Manager roles with data visibility across all canteen operations. It mirrors the eight report pages from the web app (`~/sunbites-pos/app/(kitchen)/reports/`), adapted for touch-first mobile interaction.

All reports are **read-only** (no mutations). Export to Excel is **out of scope for mobile v1**.

---

## Role Access

All reports are restricted to `admin` and `manager` roles only. The Reports tab is hidden from `supervisor` and `cashier` (enforced by `usePermission('reports')`).

---

## REQ-RPT-001 — Sales Report

- Display 5 summary cards: Total Revenue, Total Orders, Average Order Value, Total Discounts, Net Revenue.
- Display a scrollable list of orders with: Receipt #, Date/Time, Cashier, Student (or Walk-in), Items count, Payment method badge, Discount amount, Total.
- Filter by **date preset**: Today, This Week, This Month, Last Month, Custom Range.
- Filter by **payment method**: All, Cash, GCash, Wallet, Subscription.
- Filter by **customer type**: All, Registered, Walk-in.
- Paginated (load more / infinite scroll on mobile).
- Payment method badges must be color-coded: Cash=green, GCash=blue, Wallet=orange, Subscription=purple.

## REQ-RPT-002 — Students Report

- Display 3 summary cards: Total Enrolled, Grade Breakdown (top grades), Status Breakdown.
- Display a scrollable list with: Full Name, Student #, Grade, Section, Enrollment Status badge, Wallet Balance, Total Spent.
- Filter by **enrollment status**: All, Enrolled, Paused, Unenrolled, Banned, Graduated.
- Filter by **grade level**: All grades.
- Filter by **student type**: All, Subscription, Non-Subscription.
- Paginated.
- Enrollment status badges must be color-coded: Enrolled=green, Paused=yellow, Unenrolled=gray, Banned=red, Graduated=blue.

## REQ-RPT-003 — Wallet Report

- Display 4 summary cards: Total Credits, Total Debits, Net Movement, Students Below ₱100.
- Show an alert banner when there are students with balance below ₱100.
- Display a scrollable list with: Student Name, Grade, Current Balance (red if <₱100), Total Credited, Total Debited, Last Transaction date.
- Filter by **date range**: From / To date pickers.
- Paginated.

## REQ-RPT-004 — Inventory Report

- Display 3 summary cards: Out of Stock count, Below Threshold count, Overstock count.
- **Stock Snapshot tab**: Table with Item Name, Unit, Current Stock, Alert Threshold, Overstock, Cost/Unit, Status badge.
  - Filter by status: All, OK, LOW, OUT, OVER.
- **Log History tab**: Table with Date/Time, Item Name, Log Type badge, Change amount, Stock After, Reason, Adjusted By.
  - Filter by date preset, log type, and specific item.
- Status badges: OK=green, LOW=yellow, OUT=red, OVER=blue.
- Log type badges: restock=green, sale=orange, waste=red, manual=gray.

## REQ-RPT-005 — Billing Report

- Display 4 summary cards: Total Subscribers, Total Collected (₱), Total Outstanding (₱), Collection Rate (%).
- Display a scrollable list with: Student Name, Student #, Grade, Section, School Month, Amount Due, Status badge (Paid/Unpaid), Paid On date.
- Filter by **year**: 2024–2030.
- Filter by **school month**: All, June–March.
- Filter by **payment status**: All, Paid, Unpaid.
- Filter by **grade level**: All.
- Paginated.

## REQ-RPT-006 — Credits Report

- Display 4 summary cards: Total Charged, Total Settled, Total Voided, Net Outstanding.
- Display a scrollable list with: Date/Time, Student Name, Grade, Credit type badge, Amount (color-coded), Notes, Staff name.
- Filter by **date preset**: Today, This Week, This Month, Custom Range.
- Filter by **credit type**: All, Charged, Settled, Voided.
- Search by student name or student number.
- Paginated.
- Credit type badges: charged=red, settled=green, voided=gray.

## REQ-RPT-007 — Activity Log

- Display a scrollable list of activity entries: Date/Time, User, Action, Category badge, Subject.
- Tapping an entry **expands** it to show detailed properties (key-value display).
- Filter by **date preset**: Today, This Week, This Month, Custom Range.
- Filter by **category**: All, auth, pos, students, wallet, payments, menu, inventory, users.
- Search by description text.
- Paginated (25 per page).
- Category badges must be color-coded (8 distinct colors).

## REQ-RPT-008 — Daily Summary

- Display a **date picker** to select the summary date (defaults to today).
- Display: Total Orders count.
- Display **Payment Breakdown table**: Method, Order Count, Total Amount.
- Display **Per-Cashier Breakdown table**: Cashier Name, Orders, Amount.
- Display **Items Sold table**: Item Name, Qty Sold, Total Revenue.
- A **Share / Print** button that generates a shareable text summary (no actual printer required for v1).

---

## Shared Non-Functional Requirements

- All monetary values displayed in ₱ format using `formatCurrency()`.
- All dates displayed using `formatDate()` from `src/lib/formatters.ts`.
- Loading states shown with skeleton cards while data fetches.
- Empty states shown with an icon and message when no data matches filters.
- Pull-to-refresh on all report lists.
- Error states shown with a retry button on network failure.
