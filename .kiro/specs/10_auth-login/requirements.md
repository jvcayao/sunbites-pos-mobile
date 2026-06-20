# Requirements — 10 Auth & Login

## Overview

Covers the full authentication flow: login screen, error handling, branch selection, session management, logout, and user profile access. The foundation spec (01) implemented the basic screens; this spec closes the remaining gaps.

---

## REQ-AUTH-001 — Login Screen

- Email input with `keyboardType="email-address"` and `autoCapitalize="none"`.
- Password input with `secureTextEntry` and show/hide toggle.
- **Submit** button — triggers `POST /auth/login`.
- **Validation**: email format required, password min 8 chars (client-side Zod).
- **Loading state**: button shows spinner and is disabled while request is in flight.
- **Error states**:
  - Invalid credentials → inline server error message below the form (red, from `error.response.data.message`).
  - Rate limited (429) → "Too many attempts. Please wait a minute." message.
  - Network error → "No internet connection. Check your network and try again."
- No "Forgot Password" on mobile v1 — password resets are admin-initiated via `POST /users/{id}/reset-password`.

## REQ-AUTH-002 — Branch Selection Screen

- Shown after login if user has more than one branch.
- Admin: sees ALL branches from `GET /branches`.
- Non-admin: sees only `user.branches` from the login response.
- **Single-branch auto-select**: if user has exactly one branch, skip this screen entirely.
- Each branch card: initials avatar, branch name, slug.
- Tapping a card → calls `POST /auth/branch` → sets `activeBranch` → navigates to `/(app)`.
- **Sign Out** button at bottom.
- **In-app switch mode** (`?mode=switch`): shows a back button instead of Sign Out, highlights the currently active branch.

## REQ-AUTH-003 — Logout

- Accessible from: POS screen header menu (hamburger or user icon).
- Logout calls `POST /auth/logout` (fire and forget — don't block UI on failure).
- Clears token from `expo-secure-store` and Zustand state regardless of API response.
- Navigates to `/(auth)/login` and resets navigation stack.
- Clears React Query cache on logout.

## REQ-AUTH-004 — User Profile Display

- Current user's name and role badge are visible in the POS screen header.
- No dedicated profile edit screen in v1 — staff update their own profile by contacting an admin.

## REQ-AUTH-005 — Session Persistence

- Token stored in `expo-secure-store` under key `sunbites_token`.
- On cold app launch: read token → `GET /auth/user` → restore session.
- `401` on any request → auto-logout + redirect to login.
- Session **does not expire** unless the user logs out or the token is invalidated server-side.

## REQ-AUTH-006 — user.roles Shape (Resolved)

- The Laravel API response returns `roles` as an **array** (`["admin"]`) — confirmed from web app behavior using spatie/laravel-permission which serializes as an array.
- Mobile type `AuthUser.roles: UserRole[]` is correct.

## REQ-AUTH-007 — QR Code Value Format (Resolved)

- The API returns `qr_code` as the **raw ID string** (e.g. `"SB-K8mP3xNzQr4w"`), not a URL or SVG.
- Mobile app passes this string directly to `react-native-qr-svg` as the `value` prop to generate the QR code client-side.
- Format used for QR scanning pattern: `^SB-[A-Za-z0-9]{12}$`.
