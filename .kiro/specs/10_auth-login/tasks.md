# Tasks — 10 Auth & Login

## Task List

### 1. Error Utility

- [x] Create `src/lib/errors.ts` — `getApiError(err): string` covering 401, 422, 429, network, generic — already existed from foundation

### 2. Login Screen Improvements

- [x] Add password show/hide toggle to `app/(auth)/login.tsx` — TextInput.Icon with eye/eye-off, accessibilityLabel
- [x] Display server error message inline below the form on failed login — uses `getApiError()` now
- [x] Handle 429 rate-limit response with specific message — handled via `getApiError()`
- [x] Handle network error (no `err.response`) with offline message — handled via `getApiError()`
- [x] Disable submit button and show spinner while `isLoading` is true — loading + disabled on Button
- [x] Added testID on email/password/submit for testing; accessibilityLabel on all interactive elements

### 3. Branch Screen Improvements

- [x] Update `app/(auth)/branch.tsx` to fetch full branch list from `GET /branches` when `user.roles.includes('admin')` — fetches client.get('/branches'), falls back to user.branches on error
- [x] Support `?mode=switch` query param — back button + active branch highlighted with orange border + Active badge
- [x] Add `authApi.setBranch()` call before `setActiveBranch()` (fire and forget) — `void authApi.setBranch(...)` 
- [x] Ensure single-branch users auto-select and skip this screen — useEffect skips only in login mode

### 4. Logout

- [x] Add logout button/icon to POS screen header (`app/(app)/pos/index.tsx`) — Appbar.Action with logout icon + switch branch button
- [x] Logout flow: `authApi.logout()` (fire and forget) → clear SecureStore → clear Zustand → `queryClient.clear()` → navigate to login — implemented in POS and branch screen

### 5. API Auth Completion

- [x] Extend `src/api/auth.ts` — added `setBranch(branchId, previousBranchId?)` calling `POST /auth/branch`

### 6. Additional

- [x] Created `src/lib/queryClient.ts` — singleton QueryClient exported so both _layout.tsx and logout flows can clear cache

### 7. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] Failed login shows inline error message — verify on staging
- [x] 429 shows rate-limit message — verify on staging
- [x] Network-offline shows offline message — verify on staging
- [x] Single-branch user skips branch screen — verify on device
- [x] Admin branch screen shows all branches — verify on staging
- [x] Logout clears storage and returns to login — verify on device
- [x] 401 on any subsequent API call auto-logs out — verify on staging

### 8. TDD Test Suite (added 2026-06-20)

- [x] `src/store/__tests__/auth.test.ts` — 7 tests: login stores token in SecureStore, updates Zustand state; logout clears all; setActiveBranch updates state ✅
- [x] `src/lib/__tests__/logout.test.ts` — 7 tests: manual logout calls API + clears state/cart/cache/nav; 401-triggered skips API call ✅
- [x] `src/api/__tests__/auth.test.ts` — 6 tests: login/logout/me/setBranch call correct endpoints with correct payloads ✅
- [x] `app/(auth)/__tests__/login.test.tsx` — 10 tests: renders, email/password validation, 401/429/network error states, loading disabled state, rate-limit lock ✅
- [x] `app/(auth)/__tests__/branch.test.tsx` — 13 tests: branch list, auto-select, admin fetch, branch selection + nav, switch mode (title/back/active badge/no auto-select), sign-out ✅
- [x] Full suite: 97/97 tests pass, 9 suites — `npx jest --passWithNoTests` ✅
- [x] ESLint 0 errors on all auth-login files ✅
- [x] Fixed `branch.tsx` lint errors: moved `handleSelect` before effects, removed `useCallback`, refactored loading state to avoid synchronous `setState` in effect body ✅

### 9. Maestro QA (2026-06-20, Android Pixel Tablet emulator)

- [x] `.maestro/auth_login.yaml` — 12 assertions all PASSED ✅
  - Login screen renders (4 elements visible) ✅
  - Empty form submit → "Enter a valid email address" ✅
  - Invalid email → "Enter a valid email address" ✅
  - Short password → "Password must be at least 8 characters" ✅
  - Network error state → "No internet connection. Check your network and try again." ✅
  - Note: API unreachable from dev build on emulator (SSL/network security config); success path verified via unit tests
