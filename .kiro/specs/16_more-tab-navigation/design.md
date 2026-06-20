# Design — 16 More Tab Navigation

## Overview

Eight targeted file changes. No new providers, no new contexts, no new routes beyond the `more` tab. The branch pill is a self-contained component added to `AppHeader`; the `MoreScreen` is a standard tab screen that reads from existing Zustand selectors. Three screens that use raw `<Appbar.Header>` (Reminders, Announcements, Pre-Registrations) are migrated to `<AppHeader>` so all nine top-level screens have an identical header.

---

## Architecture

```mermaid
graph TD
    A[app/(app)/_layout.tsx] -->|registers| B[more tab]
    B --> C[app/(app)/more/index.tsx]
    C --> D[useAuthStore — user, activeBranch]
    C --> E[performLogout from src/lib/logout.ts]

    F[src/components/shared/AppHeader.tsx] -->|renders| G[BranchPill]
    G --> H[useAuthStore — activeBranch]
    G -->|push| I[/(auth)/branch?mode=switch]

    J[app/(app)/pos/index.tsx] -->|removes right prop| F
    K[app/(app)/reminders/index.tsx] -->|migrates to| F
    L[app/(app)/announcements/index.tsx] -->|migrates to| F
    M[app/(app)/pre-registrations/index.tsx] -->|migrates to| F
```

---

## Components and Interfaces

### BranchPill (`src/components/shared/BranchPill.tsx`)

Self-contained — no props. Reads `activeBranch` from `useAuthStore` directly.

```typescript
export function BranchPill(): React.JSX.Element | null
```

- Returns `null` when `activeBranch` is null.
- Renders `Pressable` containing branch name text (truncated 18 chars) + `chevron-down` icon.
- On press: `router.push('/(auth)/branch?mode=switch')`.

**Visual tokens:**
| Token | Value |
|---|---|
| Background | `palette.zinc100` |
| Text color | `palette.zinc700` |
| Border radius | `6` |
| Height | `28` |
| Horizontal padding | `10` |
| Font | `FontFamily.sans.medium`, size `12` |
| Icon | `MaterialCommunityIcons` `chevron-down`, size `14`, `palette.zinc500` |

**Accessibility:**
- `accessibilityRole="button"`
- `accessibilityLabel`: `"Switch branch, currently {activeBranch.name}"`

---

### AppHeader update (`src/components/shared/AppHeader.tsx`)

Add one optional prop:

```typescript
interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
  showBranchPill?: boolean   // NEW — default: true
}
```

Right slot render order:
```
{showBranchPill !== false && <BranchPill />}
{right}
<NotificationBell />
```

No other layout, style, or behavior changes.

---

### MoreScreen (`app/(app)/more/index.tsx`)

Full-screen landscape layout, two-column split via `useLayout()`.

```typescript
export default function MoreScreen(): React.JSX.Element
```

**Data:**
```typescript
const user         = useAuthStore((s) => s.user)
const activeBranch = useAuthStore((s) => s.activeBranch)
```

**Layout columns:**

| Column | Width | Content |
|---|---|---|
| Left | 35% | User card (avatar, name, email, role badge, branch) |
| Right | 65% | Menu sections (ACCOUNT placeholder items + SESSION sign-out) |

**Avatar:** `64px` circle, `zinc-100` bg, initials text in primary red (`#E7000B`), `FontFamily.sans.bold` size `22`.

**Role badge:** Small pill, `zinc-100` bg, `zinc-700` text, `user.roles[0]` capitalized, size `11`.

**Menu item shape:**
```typescript
interface MenuItem {
  label: string
  icon: string           // MaterialCommunityIcons name
  onPress?: () => void   // undefined = disabled (soon)
  color?: string         // default zinc-700; red for sign-out
  soon?: boolean
}
```

**Sections:**

ACCOUNT:
- Profile Settings — disabled (`soon: true`)
- Appearance — disabled (`soon: true`)
- Notification Preferences — disabled (`soon: true`)

SESSION:
- Sign Out — `onPress: () => performLogout()`, `color: palette.error`

**Header:** `<AppHeader title="More" showBranchPill={false} />`

**Guard:** If `user` is null, render `<EmptyState message="Session expired" />`.

---

### Tab registration (`app/(app)/_layout.tsx`)

Add after the `announcements` screen, before closing:

```tsx
<Tabs.Screen
  name="more"
  options={{
    title: 'More',
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="menu" size={size} color={color as string} />
    ),
  }}
/>
```

No `href` guard — always visible.

---

### POS header cleanup (`app/(app)/pos/index.tsx`)

**Remove:**
- `handleLogout` function
- `handleSwitchBranch` function
- `performLogout` import (verify no other usage in file before removing)
- `right={...}` prop on `AppHeader`

**Keep:** `activeBranch` selector (used elsewhere in the screen — do not remove).

---

### Screen header migrations

Three top-level screens use raw `<Appbar.Header>` and must be migrated to `<AppHeader>`.

#### Reminders (`app/(app)/reminders/index.tsx`)

**Before:**
```tsx
<Appbar.Header style={styles.appbar}>
  <Appbar.Content title="Payment Reminders" />
  <Pressable ...>
    <Checkbox.Android ... />
    <Text>Select All Unsent</Text>
  </Pressable>
</Appbar.Header>
```

**After:**
```tsx
<AppHeader
  title="Payment Reminders"
  right={
    <Pressable ...>
      <Checkbox.Android ... />
      <Text>Select All Unsent</Text>
    </Pressable>
  }
/>
```

The `styles.appbar` definition and `Appbar` import are removed. The "Select All Unsent" control moves intact into `right` — no logic changes.

#### Announcements (`app/(app)/announcements/index.tsx`)

**Before:**
```tsx
<Appbar.Header style={styles.appbar}>
  <Appbar.Content title="Announcements" />
</Appbar.Header>
```

**After:**
```tsx
<AppHeader title="Announcements" />
```

Remove `Appbar` import and `styles.appbar`.

#### Pre-Registrations (`app/(app)/pre-registrations/index.tsx`)

**Before:**
```tsx
<Appbar.Header style={styles.appbar}>
  <Appbar.Content title="Pre-Registrations" />
</Appbar.Header>
```

**After:**
```tsx
<AppHeader title="Pre-Registrations" />
```

Remove `Appbar` import and `styles.appbar`.

---

## Integration Points

**Depends on:**
- `src/store/auth.ts` — `useAuthStore` selectors: `user`, `activeBranch`
- `src/lib/logout.ts` — `performLogout()`
- `app/(auth)/branch.tsx` — `mode=switch` route (unchanged)
- `src/components/shared/AppHeader.tsx` — extended, not replaced
- `src/components/shared/EmptyState.tsx` — used as null-user guard in MoreScreen
- `src/lib/permissions.ts` — no change; More tab has no permission guard
- `app/(app)/reminders/index.tsx` — migrated from `Appbar.Header` to `AppHeader`
- `app/(app)/announcements/index.tsx` — migrated from `Appbar.Header` to `AppHeader`
- `app/(app)/pre-registrations/index.tsx` — migrated from `Appbar.Header` to `AppHeader`

**Exposes:**
- `BranchPill` — used only by `AppHeader`
- `MoreScreen` — registered as tab `more`

---

## Data Models

No new data models. All data read from existing Zustand auth store (`AuthUser`, `Branch` types in `src/types/auth.ts`).

---

## Security Considerations

- Sign Out calls `performLogout(callApi?: boolean)` — full sequence: `SecureStore.deleteItemAsync(TOKEN_KEY)` + Zustand reset (`token`, `user`, `activeBranch` → null) + `queryClient.clear()` + cart reset + navigate to `/(auth)/login`.
- No tokens, passwords, or sensitive credentials are displayed on the More screen.
- Role displayed is UI-only — Laravel API enforces real authorization.
- `user.email` is displayed on the More screen only — it is not logged.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `activeBranch` null in BranchPill | Returns null (no crash) |
| `user` null in MoreScreen | Renders `<EmptyState message="Session expired" />` |
| `performLogout` throws | Error surfaces via existing logout error handling in `src/lib/logout.ts` |

---

## Testing Strategy

- **BranchPill unit tests:** renders null when no branch; renders branch name; truncates long names; calls router.push on press; correct accessibility props.
- **AppHeader unit tests:** renders BranchPill by default; hides BranchPill when `showBranchPill={false}`; renders custom `right` alongside BranchPill.
- **MoreScreen component tests:** renders user initials, full name, email, role badge, branch; Sign Out calls performLogout; placeholder items are disabled; null-user guard shows EmptyState.
- **Migrated screen smoke tests:** Reminders, Announcements, and Pre-Registrations screens each render the Sunbites logo and BranchPill after migration; Reminders "Select All Unsent" control still renders.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/shared/BranchPill.tsx` | **New** |
| `src/components/shared/AppHeader.tsx` | Add `showBranchPill` prop, render `BranchPill` |
| `app/(app)/more/index.tsx` | **New** |
| `app/(app)/_layout.tsx` | Add `more` tab |
| `app/(app)/pos/index.tsx` | Remove logout + switch-branch from header |
| `app/(app)/reminders/index.tsx` | Migrate `Appbar.Header` → `AppHeader`; preserve "Select All Unsent" as `right` prop |
| `app/(app)/announcements/index.tsx` | Migrate `Appbar.Header` → `AppHeader` |
| `app/(app)/pre-registrations/index.tsx` | Migrate `Appbar.Header` → `AppHeader` |
