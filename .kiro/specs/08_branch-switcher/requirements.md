# Requirements — 08 Branch Switcher

## Overview

The Branch Switcher handles branch selection after login and allows mid-session branch switching. It replicates `~/sunbites-pos/app/(auth)/branch/page.tsx` and the session-switch flow.

---

## REQ-BRN-001 — Post-Login Branch Selection

- After a successful login, if the user has multiple assigned branches, they must select a branch before entering the app.
- Display each branch as a card with: initials avatar (circle), branch name, branch slug.
- Tapping a branch card selects it, calls `POST /auth/branch` to log the switch, sets `activeBranch` in the auth store, and navigates to `/(app)`.
- If the user has only **one** branch, auto-select it immediately without showing the UI.
- Admin users can see and select **all** branches (fetched from `GET /branches`). Non-admins see only their assigned branches (from `user.branches`).
- A **Sign Out** button at the bottom allows the user to log out from this screen.

## REQ-BRN-002 — In-App Branch Switcher

- A **Branch Switcher** option is accessible from within the app (e.g., from the user profile or a header action).
- Displays the same branch card list as the post-login screen.
- Selecting a different branch:
  1. Calls `POST /auth/branch`.
  2. Updates `activeBranch` in the auth store.
  3. Invalidates all React Query caches (to prevent stale data from the previous branch).
  4. Navigates to `/(app)` (resets to default tab).
- The **currently active branch** is highlighted/checked in the list.
- Current branch name is shown in the POS header bar.

## REQ-BRN-003 — Active Branch Display

- The active branch name must be visible in the POS screen's header.
- The active branch name is also shown in the app's navigation header or user info area.

---

## Non-Functional Requirements

- The branch selection screen uses the same loading/error pattern as other screens.
- If `GET /branches` fails, fall back to `user.branches` from the auth store.
