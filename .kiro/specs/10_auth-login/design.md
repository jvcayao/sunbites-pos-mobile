# Design — 10 Auth & Login

## Screen Files (already exist from foundation)

```
app/(auth)/
  login.tsx      ← extend with error states + show/hide password
  branch.tsx     ← extend with admin full list + in-app switch mode + back button
```

## Auth Flow (complete)

```
Cold launch
  └── SecureStore.getItemAsync('sunbites_token')
        ├── No token  → /(auth)/login
        └── Has token → GET /auth/user
              ├── 200 → restore user in Zustand
              │     └── check user.branches.length
              │           ├── 1 branch → auto-select → /(app)
              │           └── >1 branch → /(auth)/branch
              └── 401/error → clear store → /(auth)/login

Login form submit
  └── POST /auth/login { email, password }
        ├── 200 → authStore.login(token, user) → check branches → navigate
        ├── 401/422 → show server error inline
        ├── 429 → show rate-limit message
        └── Network error → show offline message

Branch selection
  └── Tap branch card
        └── authApi.setBranch(branch.id, previousBranch?.id)  [fire & forget — don't block]
              → setActiveBranch(branch)
              → router.replace('/(app)')

Logout
  └── authApi.logout()  [fire & forget]
        → SecureStore.deleteItemAsync('sunbites_token')
        → useAuthStore.setState({ token: null, user: null, activeBranch: null })
        → queryClient.clear()
        → router.replace('/(auth)/login')
```

## API

```typescript
// src/api/auth.ts (complete)
export const authApi = {
  login:     (email, password) => client.post('/auth/login', { email, password }),
  logout:    ()                => client.post('/auth/logout'),
  me:        ()                => client.get('/auth/user'),
  setBranch: (branchId: number, previousBranchId?: number) =>
    client.post('/auth/branch', { branch_id: branchId, previous_branch_id: previousBranchId }),
}
```

## Logout Access Point in POS

In `app/(app)/pos/index.tsx` header — an icon button (user icon or three-dot menu) that calls logout. Also accessible from a Settings / Profile area (if later added).

## Error Message Handling

```typescript
// Helper to extract server error message
function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429) return 'Too many attempts. Please wait a minute.'
    if (!err.response) return 'No internet connection. Check your network and try again.'
    return err.response.data?.message ?? 'Something went wrong. Please try again.'
  }
  return 'An unexpected error occurred.'
}
```

This helper lives in `src/lib/errors.ts` and is used in all mutation `onError` callbacks.
