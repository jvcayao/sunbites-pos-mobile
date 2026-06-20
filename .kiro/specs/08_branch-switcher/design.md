# Design — 08 Branch Switcher

## Auth Flow Integration

The branch screen already exists at `app/(auth)/branch.tsx` (from foundation). This spec extends it with:
1. In-app branch switching (new screen or modal).
2. Active branch display in POS header.

## API

```typescript
// src/api/auth.ts — extend existing
export const authApi = {
  login:     (email, password)   => client.post('/auth/login', { email, password }),
  logout:    ()                  => client.post('/auth/logout'),
  me:        ()                  => client.get('/auth/user'),
  setBranch: (branchId: number, previousBranchId?: number) =>
    client.post('/auth/branch', { branch_id: branchId, previous_branch_id: previousBranchId }),
}

// src/api/references.ts — branch list (admin)
branches: {
  list: () => client.get('/branches'),
}
```

## Auth Store Extension

```typescript
// src/store/auth.ts — add setActiveBranch already exists; no changes needed
// The activeBranch: Branch | null is already in the store
```

## Branch Switch Logic

```typescript
async function switchBranch(branch: Branch) {
  const { activeBranch, setActiveBranch } = useAuthStore.getState()
  await authApi.setBranch(branch.id, activeBranch?.id)
  setActiveBranch(branch)
  queryClient.clear()               // invalidate all cached data for old branch
  router.replace('/(app)')
}
```

## Screens

### `app/(auth)/branch.tsx` (already exists — extend)
- Add admin fetch from `GET /branches` (not just `user.branches`).
- Add active branch highlight when used as in-app switcher.
- Add Sign Out button.

### In-App Branch Switcher
Option: reuse `app/(auth)/branch.tsx` with a query param `?mode=switch` to indicate in-app mode.
- In `switch` mode: show current branch highlighted, back button available.
- In `login` mode (default): no back button, Sign Out at bottom.

## Components

| Component | Purpose |
|---|---|
| `BranchCard` | Branch card with avatar, name, slug, optional active checkmark |
| `BranchSwitcherHeader` | "Switch Branch" title + current branch badge |

## Active Branch in POS Header

In `app/(app)/pos/index.tsx` header:
```typescript
const { activeBranch } = useAuthStore()
// Display: activeBranch?.name
```
