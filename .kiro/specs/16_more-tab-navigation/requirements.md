# Requirements — 16 More Tab Navigation

## Overview

Add a "More" bottom tab with a hamburger icon that opens a full-screen user profile + logout page. Remove the logout button from all screen headers. Replace the branch switcher icon in the POS header with a universal tappable branch pill that appears on every top-level screen header.

**Depends on:** Spec 01 (AppHeader, shared components), Spec 10 (auth store, performLogout), Spec 08 (branch switcher route `/(auth)/branch?mode=switch`)

**Out of Scope:** Avatar photo from API, profile editing, appearance/notification preference settings (placeholder only), sub-screen branch pill behavior.

---

## REQ-MORE-001 — BranchPill Component

**User Story:** As a staff member, I want to see the active branch name in the header at all times, so that I always know which branch I'm operating in and can switch branches quickly from any screen.

### Acceptance Criteria

1. WHEN `AppHeader` renders on any top-level screen THEN it SHALL display a `BranchPill` chip in the right action area showing the current `activeBranch.name`.
2. WHEN the user taps the `BranchPill` THEN the app SHALL navigate to `/(auth)/branch?mode=switch`.
3. WHEN `activeBranch` is null THEN the `BranchPill` SHALL return null (no render).
4. WHEN the branch name exceeds 18 characters THEN the `BranchPill` SHALL truncate it.
5. WHEN `AppHeader` is rendered with `showBranchPill={false}` THEN the `BranchPill` SHALL NOT render.

---

## REQ-MORE-002 — AppHeader Update

**User Story:** As a developer, I want the `AppHeader` component to render the `BranchPill` automatically, so that no per-screen changes are needed to add the branch pill to existing screens.

### Acceptance Criteria

1. WHEN `AppHeader` renders without `showBranchPill` prop THEN it SHALL default to showing the `BranchPill`.
2. WHEN `AppHeader` renders the right slot THEN the order SHALL be: `[BranchPill] → [right (custom)] → [NotificationBell]`.
3. IF a screen passes a custom `right` prop THEN `AppHeader` SHALL render both the `BranchPill` and the custom `right` content together.

---

## REQ-MORE-003 — More Tab Registration

**User Story:** As a staff member, I want a "More" tab always available in the bottom navigation, so that I can access account and session options without hunting through screen menus.

### Acceptance Criteria

1. WHEN the app renders the tab bar THEN a "More" tab SHALL appear as the last item with a hamburger (`menu`) icon.
2. WHEN any authenticated role opens the app THEN the "More" tab SHALL be visible (no permission guard).
3. WHEN the user taps "More" THEN the app SHALL navigate to `/(app)/more/index.tsx` as a full-screen page.

---

## REQ-MORE-004 — More Screen — User Profile Card

**User Story:** As a staff member, I want to see my profile information on the More screen, so that I can confirm my active identity and branch at a glance.

### Acceptance Criteria

1. WHEN the More screen renders THEN it SHALL display an avatar circle showing the user's initials (`first_name[0] + last_name[0]`, uppercase).
2. WHEN the More screen renders THEN it SHALL display `user.full_name`, `user.email`, and a role badge showing `user.roles[0]` capitalized.
3. WHEN the More screen renders THEN it SHALL display `activeBranch.name` with a map-marker icon.
4. WHEN the More screen renders THEN the `AppHeader` SHALL use `showBranchPill={false}` — no branch pill in the More screen header.

---

## REQ-MORE-005 — More Screen — Menu Items

**User Story:** As a staff member, I want account settings and a sign-out option on the More screen, so that I can manage my session from a single place.

### Acceptance Criteria

1. WHEN the More screen renders THEN it SHALL display placeholder menu items: "Profile Settings", "Appearance", "Notification Preferences" — all visually disabled with a `(soon)` label.
2. WHEN the More screen renders THEN it SHALL display a "Sign Out" menu item in the SESSION section with red text.
3. WHEN the user taps "Sign Out" THEN the app SHALL call `performLogout()` which clears SecureStore token, resets Zustand, clears React Query cache, and resets navigation to login.

---

## REQ-MORE-006 — POS Header Cleanup

**User Story:** As a staff member, I want a consistent header across all screens, so that I don't see redundant logout and branch-switch buttons on the POS screen.

### Acceptance Criteria

1. WHEN the POS screen renders THEN the header SHALL NOT contain a logout action button.
2. WHEN the POS screen renders THEN the header SHALL NOT contain a swap-branch action button.
3. WHEN the POS screen renders THEN the branch pill from `AppHeader` SHALL be the only branch-switching affordance.

---

## Cross-Cutting Requirements

- **Security:** Sign Out must call `performLogout()` — the full logout sequence (SecureStore delete + Zustand reset + React Query clear + navigation reset). Partial logout is not acceptable.
- **Accessibility:** `BranchPill` must have `accessibilityRole="button"` and `accessibilityLabel` including the current branch name. The Sign Out row must have `accessibilityRole="button"`.
- **Performance:** `BranchPill` reads from Zustand selector — no API calls.
- **Error handling:** If `user` or `activeBranch` is null on the More screen (should not occur inside the app layout), render an appropriate error/empty state.
- **No PII in logs:** Do not log email, name, or branch info in any console output.

## Out of Scope

- Avatar photo from the API
- Profile editing (name, email, password)
- Appearance settings
- Notification preference settings
- Sub-screen branch pill behavior (e.g. student detail, announcement detail)
