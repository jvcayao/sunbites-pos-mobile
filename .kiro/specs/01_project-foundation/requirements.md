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
- Inventory, Meal Planner, Users, Branches, Subscription Config, and Parents must be accessible to authorized roles.

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
- Parent portal screens
- Biometric login
- Push notifications
- System Settings screen
- Feedback collection module

---

## Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-1 | Should the POS show a split-pane (menu + cart) on tablet/iPad matching the web two-column layout? | Layout spec for POS screen |
| OQ-2 | For v1 receipts — display on-screen only, share as PDF, or print via Bluetooth thermal? | Scope of receipt feature |
| OQ-3 | Should users be able to switch branches mid-session without a full logout? | Auth flow complexity |
| OQ-4 | ~~What are the confirmed app icon and splash screen assets?~~ **Deferred — use Expo placeholder assets until production build.** | Asset delivery |
| OQ-5 | Are iOS 16+ and Android 10+ the correct minimum OS targets? | EAS build config |
