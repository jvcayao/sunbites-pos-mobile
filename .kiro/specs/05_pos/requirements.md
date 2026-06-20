# Requirements — 05 POS (Point of Sale)

## Overview

The POS is the primary operational screen used by all roles, replicating `~/sunbites-pos/app/(pos)/pos/page.tsx` and its sub-components. It has four tabs: POS, Transactions, Menu Management, and Inventory.

---

## Role Access

Tab visible to all roles. Individual tabs within POS are role-gated:

| Tab | Roles |
|---|---|
| POS | all |
| Transactions | all |
| Menu Mgmt | admin, manager |
| Inventory | admin, manager, supervisor |

---

## REQ-POS-001 — Student Search & Selection

- The POS screen opens with the **student search input auto-focused** — the USB QR scanner can scan immediately without tapping the screen.
- QR scanning uses an **external USB HID barcode scanner** that types the code as fast keyboard input into the focused TextInput. No camera is used.
- The search input detects a scan by checking if the full input value matches `^SB-[A-Za-z0-9]{12}$`. Trailing CR/LF appended by some scanners is stripped before validation.
- The user can also search manually by typing a student name or student number (debounced 300ms).
- After a student is selected or cleared, the search input is **automatically re-focused** so the USB scanner is always ready for the next order.
- Search results appear in a dropdown list with enrollment status indicators.
- **Only enrolled students** can be selected; other statuses shown as disabled with ⛔.
- Selecting a student shows a **student card** with: name, grade/section, enrollment status badge, student type badge, wallet balance, points, credit owed.
- A **Walk-in** button below the search field sets the order to walk-in mode (no student linked).
- When a student is selected, an **✕ clear** button deselects them.
- If a QR is scanned while a student is already selected, a **Change Student** dialog appears comparing current vs. new student.
- If a QR does not match any student, a **Student Not Found** dialog appears.

## REQ-POS-002 — Menu Grid

- Display all available menu items in a scrollable grid (2 columns on phone, 3 on tablet).
- Items are filterable by category: All, Meal, Snack, Drink, Extra.
- Items are searchable by name (debounced 300ms).
- Each item card shows: name, price (₱), category badge, inventory status badge.
- Tapping an item adds it to the cart (increments quantity if already in cart).
- Items that are OUT of stock or have unmapped inventory are **disabled** (shown with reduced opacity).
- Cart quantity badge shown top-right on each item card if the item is in the cart.
- Low Stock badge (yellow) shown if inventory is LOW.
- Out of Stock badge (red) shown if inventory is OUT.
- "Not linked" badge (orange) if item has no inventory mapping.

## REQ-POS-003 — Cart Panel

- Cart panel shows the current order summary.
- Per cart item: name, unit price, quantity (−/+ controls), row total, remove (✕) button.
- **Order Notes** text input at bottom of item list.
- **Discount section** (admin/manager only): type toggle (% / ₱), amount input, reason input (required if amount > 0).
- **Totals row**: Subtotal, Discount (if applied), **Total**.
- **Payment Method** selector: 4 buttons — Cash, GCash, Wallet, Subscription.
- **Cash**: Amount Tendered input; Change display calculated live.
- **GCash**: Optional Reference Number input.
- **Wallet**: Shows student's wallet balance and "After Purchase" balance (red if negative).
- **Subscription**: Informational text only; student must be subscription type.
- **Confirm Purchase** button — opens confirmation dialog.
  - Dialog shows: customer name, items count, discount (if any), total, payment method, change (if cash).
  - **Proceed** submits to `POST /pos/checkout`.
- **Insufficient Funds modal** shown if wallet balance < total:
  - Options: Reload (opens inline top-up), Use Credit, Cancel.

## REQ-POS-004 — Receipt (OQ-2 resolved: on-screen display + Share text)

- After successful checkout, display a **Receipt screen** (full-screen modal).
- Receipt shows: receipt number, date/time, cashier name, student name (or "Walk-in"), items list with quantities and prices, payment method, discount (if any), subtotal, total, amount tendered & change (if cash), reference number (if GCash).
- **Share** button uses `Share.share()` to share a plain-text receipt — staff can send via Messenger, SMS, or email.
- **New Order** button clears the cart and dismisses the modal back to POS.
- No thermal/Bluetooth printing in v1.

## REQ-POS-005 — Transaction History Tab

- Display paginated list of past orders.
- Per row: Receipt #, Date/Time, Customer (or Walk-in), Items summary, Payment method badge, Status badge (Completed/Voided), Total.
- Filter by date preset (Today, This Week, This Month, Custom Range).
- Filter by payment method.
- Filter by status (All, Completed, Voided).
- Search by receipt number or student name.
- **Void Order** action (admin/manager only): opens confirmation with reason input.
- Pull-to-refresh, infinite scroll.

## REQ-POS-006 — Menu Management Tab (admin/manager only)

- Display all menu items (including unavailable) in a list.
- Per item: name, price, category badge, availability toggle, inventory status.
- **Add Item** button: bottom sheet form with name*, price*, category*, sort order.
- **Edit Item**: bottom sheet with same fields pre-filled.
- **Toggle Availability**: switches `is_available` via `POST /pos/menu-items/{id}/toggle`.
- **Delete Item**: confirmation dialog.
- Items sorted by category then sort_order.

## REQ-POS-007 — Inventory Tab (admin/manager/supervisor)

- Display inventory items with current stock levels.
- Per row: Item name, Unit, Current Qty, Status badge (OK/LOW/OUT/OVER).
- **Adjust Stock** button per row: opens a bottom sheet form with:
  - Adjustment type: Restock, Waste, Manual.
  - Quantity (number).
  - Notes (optional).
  - Calls `POST /pos/inventory/{id}/adjust`.
- Pull-to-refresh.

---

## Cart Validation Rules

- Cart must not be empty to checkout.
- Cash: amount tendered ≥ total.
- Subscription: student must be subscription type.
- Wallet: student must be selected (no walk-in).
- Discount: reason required if discount amount > 0.
- Discount %: 0–100. Discount ₱: 0 – subtotal.
