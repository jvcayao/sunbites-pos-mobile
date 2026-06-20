# Design: More Tab, Branch Pill & Header Cleanup

**Date:** 2026-06-20
**Branch:** feat/mobile-enhancement
**Status:** Approved

---

## Overview

Add a "More" bottom tab that houses user profile info and logout. Remove the logout button from all screen headers. Add a tappable branch pill to all screen headers so users can quickly switch branches from any screen.

---

## Scope

Four changes, applied together:

1. New `BranchPill` shared component
2. `AppHeader` updated to render `BranchPill` universally
3. New `more` tab + `MoreScreen` (profile, logout, placeholder settings)
4. POS screen header cleanup (remove logout + switch branch actions)

---

## 1. BranchPill Component

**File:** `src/components/shared/BranchPill.tsx`

Self-contained tappable chip. Reads `activeBranch` from `useAuthStore` directly — no props required.

**Behavior:**
- Displays `activeBranch.name`, truncated at 18 characters
- Shows a `chevron-down` icon to signal interactivity
- On press: `router.push('/(auth)/branch?mode=switch')`
- Returns `null` if `activeBranch` is null (should not occur inside the app layout, but safe)

**Visual spec:**
- Background: `palette.zinc100`
- Text color: `palette.zinc700`
- Border radius: `6`
- Height: `28px`, horizontal padding: `10px`
- Font: `FontFamily.sans.medium`, size `12`
- Chevron icon: `MaterialCommunityIcons` `chevron-down`, size `14`, color `zinc500`

**Accessibility:**
- `accessibilityRole="button"`
- `accessibilityLabel`: `"Switch branch, currently {activeBranch.name}"`

---

## 2. AppHeader Update

**File:** `src/components/shared/AppHeader.tsx`

**New prop:**
```typescript
showBranchPill?: boolean  // default: true
```

**Right slot render order** (left to right):
```
[BranchPill]  →  [right (custom, optional)]  →  [NotificationBell]
```

- `BranchPill` renders when `showBranchPill !== false`
- Existing `right` prop is preserved — any screen with custom right actions keeps them
- No other changes to layout, styles, or existing props

**Usage for sub-screens** (detail pages with back button): pass `showBranchPill={false}` if the pill feels out of place on deep navigation screens.

---

## 3. More Tab & Screen

### Tab registration

**File:** `app/(app)/_layout.tsx`

Add as the last `<Tabs.Screen>`:

```tsx
<Tabs.Screen
  name="more"
  options={{
    title: 'More',
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="menu" size={size} color={color} />
    ),
  }}
/>
```

No permission guard — always visible to all roles.

### Screen layout

**File:** `app/(app)/more/index.tsx`

Full screen, landscape two-column layout using `useLayout()`.

**Left column (~35% width) — User card:**
- Avatar circle: `64px`, `zinc-100` background, primary red initials text (`first_name[0] + last_name[0]`, uppercase, `FontFamily.sans.bold`, size `22`)
- Full name: `user.full_name`, `FontFamily.sans.bold`, size `18`, `zinc-950`
- Email: `user.email`, `FontFamily.sans.regular`, size `13`, `zinc-500`
- Role badge: pill using `user.roles[0]` capitalized, `zinc-100` bg, `zinc-700` text, size `11`
- Active branch row: `map-marker` icon + `activeBranch.name`, size `13`, `zinc-500`

**Right column (~65% width) — Menu list:**

Section: **ACCOUNT**
- Profile Settings — disabled, label `(soon)`, zinc-400 text
- Appearance — disabled, label `(soon)`, zinc-400 text
- Notification Preferences — disabled, label `(soon)`, zinc-400 text

Section: **SESSION**
- Sign Out — `performLogout()` from `src/lib/logout.ts`, red text (`palette.error` / `#EF4444`), `log-out` icon

**Header:** `<AppHeader title="More" showBranchPill={false} />` — no branch pill on the More screen itself (user is already here to manage account/branch context).

**Data source:** `useAuthStore` selectors for `user` and `activeBranch`.

---

## 4. POS Screen Header Cleanup

**File:** `app/(app)/pos/index.tsx`

**Remove:**
- `handleLogout` function
- `handleSwitchBranch` function
- `performLogout` import (no longer used in this file)
- The `right={<>...</>}` prop on `AppHeader`

**Keep:**
- `activeBranch` selector (still used for subtitle or other logic in the screen)
- All other POS functionality untouched

**All other screens** (dashboard, enrollment, reports, reminders, pre-reg, announcements, references): no changes required — `BranchPill` renders automatically via `AppHeader` default.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/shared/BranchPill.tsx` | **New** |
| `src/components/shared/AppHeader.tsx` | Add `showBranchPill` prop + render `BranchPill` |
| `app/(app)/more/index.tsx` | **New** — More screen |
| `app/(app)/_layout.tsx` | Add `more` tab as last entry |
| `app/(app)/pos/index.tsx` | Remove logout + switch branch from header |

---

## Out of Scope

- Avatar photo from API (initials only for now)
- Profile editing (placeholder only)
- Appearance / notification preferences (placeholder only)
- Sub-screen branch pill behavior — left to per-screen judgment at implementation time

---

## Security Notes

- Logout calls `performLogout()` which: deletes SecureStore token, resets Zustand (auth + cart), clears React Query cache, and resets navigation to login
- No tokens, PII, or credentials displayed beyond what is already visible in the session
- Role display is UI-only — API enforces real authorization
