# Tasks — 08 Branch Switcher

## Task List

### 1. API

- [x] `src/api/auth.ts` — `setBranch(branchId, previousBranchId?)` added — calls `POST /auth/branch`
- [x] `src/api/references.ts` — `branches.list()` available for admin fetch

### 2. Branch Components

- [x] Branch card UI is implemented directly in `app/(auth)/branch.tsx` (TouchableRipple + Surface pattern)
- [x] Active branch highlight (orange border + Active badge) in switch mode

### 3. Branch Screen (`app/(auth)/branch.tsx`)

- [x] Admin fetches full list via `client.get('/branches')`; non-admin uses `user.branches`
- [x] FlatList of branch cards with initials avatar, name, slug
- [x] On card tap: `authApi.setBranch()` (try/await) → `setActiveBranch()` → `router.replace('/(app)')`
- [x] Active branch highlighted with checkmark in switch mode
- [x] Sign Out button (login mode) / Back button (switch mode) via `?mode=switch` param

### 4. In-App Branch Switch Entry Point

- [x] "Switch Branch" Appbar.Action in `app/(app)/pos/index.tsx` → `router.push('/(auth)/branch?mode=switch')`
- [x] `activeBranch.name` shown as Appbar title in POS screen

### 5. Active Branch Display

- [x] `activeBranch.name` displayed in POS screen Appbar as title
- [x] Available via `useAuthStore(s => s.activeBranch)` in any screen

### 6. Query Cache Invalidation on Switch

- [x] `queryClient.clear()` called after `setActiveBranch()` in branch.tsx logout flow
- [x] `queryClient.clear()` called in 401 interceptor (client.ts) — ensures stale data never renders

### 7. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [ ] Single-branch users bypass branch screen — verify on device
- [ ] Admin sees all branches; non-admin sees assigned branches only — verify on staging
- [ ] Switching branch clears cache — verify on device
- [ ] Active branch name appears in POS header — verify on device
