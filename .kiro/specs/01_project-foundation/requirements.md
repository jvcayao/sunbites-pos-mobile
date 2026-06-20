# Requirements — 01 Project Foundation

## Overview

Sunbites POS Mobile is a React Native / Expo mobile companion to the existing Sunbites POS web app (`~/sunbites-pos`). It targets the same Laravel REST API and serves the same four roles — Admin, Manager, Supervisor, and Cashier — with a touch-first interface optimized for phones and tablets used on the school canteen floor.

---

## Functional Requirements

### REQ-001 — Authentication
- The app must support email + password login via `POST /auth/login`.
- After login, if the user has multiple branches, they must select an active branch before entering the app.
- The session token must persist across app restarts using secure device storage.
- A 401 response from any API call must automatically log the user out and redirect to the login screen.
- Users must be able to log out manually from within the app.

### REQ-002 — Role-Based Access
- Four roles are supported: `admin`, `manager`, `supervisor`, `cashier`.
- Module visibility is determined by role (see Design for permission map).
- Tabs and action buttons not permitted for the current role must be hidden entirely — not grayed out.

### REQ-003 — POS (Point of Sale)
- Cashiers must be able to look up a student by searching name/number or scanning a QR code.
- The menu must be displayed as a categorized grid (meal, snack, drink, extra).
- Items can be added to a cart, with quantity adjustments and removal.
- Supported payment methods: `cash`, `gcash`, `wallet`, `subscription`.
- Checkout must submit the order and display a receipt screen.
- Completed orders must be voidable by authorized roles.

### REQ-004 — Dashboard
- Must display real-time KPIs: total students, enrolled count, meals today, revenue today, walk-in orders, wallet orders.
- Must show recent orders, staff roster with status, top items sold, low stock alerts, and outstanding credit alerts.
- Data must auto-refresh every 60 seconds.

### REQ-005 — Enrollment
- Authorized roles must be able to enroll a new student with: name, birthday, grade/section, allergies, contacts, student type, and optional subscription dates.
- On success, the app must display the generated student QR code.
- Philippine phone format must be validated (`09XXXXXXXXX` or `+639XXXXXXXXX`).

### REQ-006 — Student Management
- Must display a paginated, filterable list of students (by grade, status, type).
- Each student profile must show: info, contacts, wallet balance, transaction history, monthly payments, activity log.
- Authorized actions: update info, change enrollment status, toggle student type, top-up wallet, settle credit, regenerate QR.

### REQ-007 — Reports
- The following reports must be accessible to `admin` and `manager` roles:
  Sales, Students, Wallet, Inventory, Billing, Credits, Activity Log, Daily Summary.

### REQ-008 — References
- Inventory, Meal Planner, Users, Branches, Subscription Config, Parents, Feedback, and System Settings must be accessible to authorized roles.
- See spec `03_references` for per-section role breakdown.

### REQ-013 — Real-Time Notifications
- The app must connect to the API's Reverb WebSocket server using the authenticated staff token.
- An `EchoProvider` must initialize on login and disconnect on logout.
- A single `NotificationBell` component must appear in the POS screen header — this is the **only** notification bell in the entire app header. It subscribes to the `staff.{userId}` private channel.
- The bell must display an unread count badge (hidden when count = 0).
- Tapping the bell navigates to the staff notifications page (`/notifications`).
- The notifications page follows MagicBell design: unread dot, type-aware title, 2-line preview, relative timestamp, context menu (`...`).
- Staff must be able to mark individual notifications as read, mark all as read, and delete individual notifications.

### REQ-014 — Payment Reminders
- Authorized roles (admin/manager) must be able to send payment reminders to parents of subscription students for the upcoming school month.
- Supervisor role can view the reminders list but the Send button is hidden.
- A reminder count badge (number of unsent eligible parents) must be visible on the Payment Reminders navigation entry.
- Sent parents must be shown in the list as grayed/non-selectable by default; a "Force resend" option must be available.
- Tapping a parent entry must show their contact info and subscription payment history.

### REQ-015 — Announcements
- Authorized roles (admin/manager/supervisor) must be able to compose and send announcements to parents or co-workers (never both simultaneously).
- A nav item with a Megaphone icon must appear in the navigation for supervisor+ roles.
- The announcements list shows: sender, recipient type, message preview, recipient count, date.
- The announcement detail shows: full message, sender, recipient type, sent date, and per-recipient read status.

### REQ-016 — Pre-Registrations
- Authorized roles (admin/manager/supervisor) must be able to view and process incoming pre-registration records.
- A nav item with a ClipboardCheck icon must appear in the navigation for supervisor+ roles, showing a pending count badge.
- The list must support filtering by status (pending/approved/rejected/expired).
- Pending records can be edited before approval.
- Approved records create a student via the standard enrollment flow.
- Rejected records require a rejection reason.
- Expired records can be reactivated by admin/manager/supervisor.

---

## Non-Functional Requirements

### REQ-009 — Platform Targets
- iOS 16+ and Android 10+.
- Phone and tablet form factors supported.
- **All screens** must support both portrait and landscape orientations and auto-adjust their layout when the device is rotated (`orientation: "default"` in app.json).
- Breakpoints (via `useWindowDimensions()`):
  - `isLandscape`: `width > height` — switch to side-by-side or wider layouts
  - `isTablet`: `Math.min(width, height) >= 768` — enable tablet-optimised layouts
- Primary deployment: tablets mounted at canteen counters (landscape-first design); also used on phones by cashiers on the go.

### REQ-010 — Build & Deployment
- The app must be built on **Expo SDK 56** (latest stable as of June 2026, npm `latest` = 56.0.8) and distributed via EAS Build / expo.dev.
- Three build profiles required: `development`, `staging`, `production`.
- OTA updates must be enabled for `staging` and `production`.

### REQ-011 — API Compatibility
- The app must be compatible with the existing Laravel API — no backend changes are permitted as part of this project.
- All request headers (`Authorization: Bearer`, `X-Branch-Id`, `Accept: application/json`) must be sent on every authenticated request.

### REQ-012 — Currency & Locale
- All monetary values must be displayed in Philippine Peso (₱).
- School year months are June through March only.

---

## Out of Scope (v1)

- Export to Excel
- Thermal / Bluetooth receipt printing
- Offline mode / local queue
- Parent portal screens (handled by `~/sunbites-portal`)
- Biometric login

---

## Resolved Open Questions

| # | Question | Resolution |
|---|---|---|
| OQ-1 | Split-pane on tablet? | ✅ Yes — 60/40 split, tablet width ≥ 768px |
| OQ-2 | Receipt format? | ✅ On-screen only + `Share.share()` text; no printer in v1 |
| OQ-3 | In-app branch switch? | ✅ Yes — via `?mode=switch` param on branch screen |
| OQ-4 | App icon/splash assets? | Deferred — use Expo placeholder assets until first production build |
| OQ-5 | Min OS targets? | ✅ iOS 16+ and Android 10 (API 29) |
