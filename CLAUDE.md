# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Anti-Drift Protocol

**On every session start or after any context compaction — do this first:**

1. Re-read the relevant spec in `.kiro/specs/` for the feature being worked on
2. Re-read the tasks.md for that spec and find the first unchecked `[ ]` box
3. Never start a task whose box is already checked `[x]`
4. Work in phase order — do not skip ahead
5. After completing each task: edit tasks.md, change `[ ]` → `[x]`, add a one-line note

**Progress Tracker rule:** The task file is the source of truth. If context is wiped, the checked boxes are how work resumes without loss.

---

## Agents — When to Use

### `clean-code-architect` (use proactively on ALL new code)
Activate this agent whenever implementing a new feature, writing new components, hooks, or services, or refactoring existing code. Do not write significant code without it.

### `appsec-vulnerability-assessor` (use at end of each feature implementation)
Activate after completing any feature that touches: authentication, token handling, API calls, form inputs, local storage, deep links, or screens showing financial/student data. Run a full security audit before marking a spec as complete.

---

## Skills — Auto-Activate

### `mobile-design` — activate `/skill mobile-design` before writing any screen, component, or layout code

Before writing mobile code, complete the mandatory checkpoint:
```
Platform:   iOS + Android (Cross-platform)
Framework:  React Native + Expo SDK 56
Files Read: [list relevant skill files read from .claude/skills/mobile-design/]

3 Principles I Will Apply:
1. ___
2. ___
3. ___

Anti-Patterns I Will Avoid:
1. ___
2. ___
```

Key skill files in `.claude/skills/mobile-design/`:
- `mobile-design-thinking.md` — **read first, always**
- `touch-psychology.md` — Fitts' Law, thumb zones, 44px minimum targets
- `mobile-performance.md` — FlatList, memoization, 60fps
- `mobile-backend.md` — API patterns, offline handling
- `platform-ios.md` + `platform-android.md` — read both (cross-platform app)

---

## Commands

```bash
npm start                           # Expo dev server
npm run ios                         # iOS simulator
npm run android                     # Android emulator
npm run typecheck                   # npx tsc --noEmit — run before every commit
npm run lint                        # expo lint
npx expo-doctor                     # Expo config health check
npm test                            # Run all tests (jest --passWithNoTests)
npm run test:coverage               # Run with coverage report
npx jest path/to/file.test.ts       # Run a single test file
eas build --profile development     # EAS dev build (requires eas login first)
```

**Pre-commit checklist (from `.claude/rules/git-workflow.md`):**
```bash
npm run typecheck && npm run lint && npx jest --passWithNoTests
```

---

## Project

**Sunbites POS Mobile** — Expo SDK 56 companion to `~/sunbites-pos` (Next.js). Targets the same Laravel REST API. Four roles: `admin`, `manager`, `supervisor`, `cashier`.

**API base URL:** set via `EXPO_PUBLIC_API_URL` in `.env.*`
- dev + staging → `https://api-staging.sunbites.com.ph/api/v1`
- production → `https://api.sunbites.com.ph/api/v1`

---

## Architecture

```
app/              Expo Router file-based routes
  (auth)/         Login, branch selection — no tab bar visible
  (app)/          Protected tabs — auth-guarded in root _layout.tsx

src/
  api/            Axios modules, one per domain — never fetch in components
  store/          Zustand: authStore (token + user), cartStore (POS, in-memory)
  hooks/          React Query wrappers over src/api/
  types/          TypeScript interfaces mirroring API responses exactly
  components/     Grouped by domain: shared/, pos/, students/, dashboard/, etc.
  lib/            constants.ts · permissions.ts · formatters.ts · errors.ts
  theme/          react-native-paper MD3 theme (palette from ~/sunbites-pos)
```

**Path alias:** `@/*` → `./src/*` (tsconfig.json + babel.config.js)

---

## Key Patterns

### Auth guard
`app/_layout.tsx` cold-launch bootstrap: SecureStore token → `GET /auth/user` → route to login or branch screen. `401` on any request → auto-logout + redirect.

### API client
`src/api/client.ts` — single Axios instance. Injects `Authorization: Bearer {token}` and `X-Branch-Id: {id}` on every request. `src/lib/errors.ts` → `getApiError(err)` normalizes all API errors for `onError` callbacks.

### Permissions
`src/lib/permissions.ts` — `usePermission(key)` hook. Tabs and action buttons are **hidden** (not disabled) for unauthorized roles.

### State — three-layer rule
| Data type | Tool |
|---|---|
| API / server data | TanStack React Query (`useQuery`, `useInfiniteQuery`, `useMutation`) |
| Cart, UI toggles, filters | Zustand — always use selectors, never destructure whole store |
| Auth session | Zustand `authStore` — token in `expo-secure-store` only |

Never duplicate API data in Zustand. Never store tokens in AsyncStorage.

### Responsive Layout — mandatory on every screen

All screens auto-adjust to orientation and tablet size. **Call `useLayout()` in every screen with a list, form, or multi-section layout.**

```typescript
const { isLandscape, isTablet } = useLayout()
// isLandscape = width > height  |  isTablet = min(w,h) >= 768
```

| Screen | Portrait | Landscape / Tablet |
|---|---|---|
| POS | Full-screen menu + cart FAB | Split 60/40 side-by-side |
| Enrollment | Single-column form | 2-column sections |
| Student List | Single-column cards | 2-column card grid |
| Dashboard | Single-column widgets | 2–3 column grid |
| Reports | Card rows | Table with more columns |
| References | Single list | List + detail side by side |

`app.json` → `"orientation": "default"` (portrait + landscape both enabled). Never hardcode pixel widths.

### Pagination
All paginated lists use `useInfiniteQuery`. API returns `{ data[], meta: { current_page, last_page }, links }`. Trigger next page at `onEndReachedThreshold: 0.2`.

### Toast
`useToast()` from `src/components/shared/ErrorToast.tsx` — `toast.success()` / `toast.error()`.

---

## Coding Standards (always applied)

- **No `any`** — use `unknown` + type-narrow, or proper interfaces
- Explicit return types on all exported functions and hooks
- `interface` for object shapes and props; `type` for unions
- Named exports everywhere — **default exports only in `app/**/*.tsx`** (Expo Router requirement)
- Early returns for guard clauses — never deeply nested ternaries
- `async/await` + `try/catch` — never `.then/.catch` chains
- `StyleSheet.create()` at file bottom — never inline style objects in render
- `FlatList` for all dynamic lists — never `ScrollView + .map()`
- `Pressable` for all tappable elements — never `TouchableOpacity`
- All touch targets ≥ 44pt (iOS) / 48dp (Android)
- `accessibilityRole` + `accessibilityLabel` on all interactive and icon-only elements
- One component per file, max 150 lines — extract sub-components if larger
- Import order: React/RN → Expo packages → external → internal → types

---

## Security Standards (always applied)

- **Tokens in `expo-secure-store` only** — never AsyncStorage, MMKV, or Zustand persistence
- **No secrets in source** — `EXPO_PUBLIC_*` vars end up in the JS bundle (extractable)
- All user inputs validated with Zod before API submission — server is source of truth
- Never log PII (names, emails, phones, addresses, payment amounts)
- Logout must: delete SecureStore token + reset Zustand + `queryClient.clear()` + reset navigation
- Generic error messages on auth failure — never reveal if email exists
- Deep link params validated with Zod before use
- Client-side role/branch checks are UI-only — Laravel API enforces real authorization
- Remove all `console.log` before production builds

---

## Git Workflow (always applied)

- **Never commit to `main` directly** — branch → PR → merge
- Branch naming: `feature/TICKET-description`, `bugfix/TICKET-description`, `hotfix/TICKET-description`
- Commit format: `type(scope): short description` — types: `feat fix docs style refactor perf test chore`
- **No `Co-Authored-By`, AI footers, or attribution trailers in commits or PRs**
- Keep PRs small and focused — one feature or fix per PR
- Never commit: `.env.*`, `*.p12`, `*.mobileprovision`, `google-services.json`, `GoogleService-Info.plist`

---

## Specs Index (`.kiro/specs/`)

Read the relevant spec before implementing. Each folder has `requirements.md`, `design.md`, `tasks.md`.

| # | Spec | Status |
|---|---|---|
| 00 | api-cross-reference | ✅ All breaking mismatches fixed in src/api/ |
| 01 | project-foundation | ✅ Implemented |
| 02 | reports | ✅ Implemented — 8 report screens |
| 03 | references | ✅ Implemented — 8 sub-sections incl. system settings |
| 04 | dashboard | ✅ Implemented |
| 05 | pos | ✅ Implemented — QR scan, menu, cart, tablet split-pane, transactions |
| 06 | enrollment | ✅ Implemented — Multi-section form, contacts, QR success |
| 07 | students | ✅ Implemented — List + 6-tab detail |
| 08 | branch-switcher | ✅ Implemented — Post-login + in-app switch |
| 09 | shared-components | ✅ Implemented |
| 10 | auth-login | ✅ Implemented |

**Build order:** `09` → `10` → `04` → `05` → `06` → `07` → `02` → `03` → `08`

---

## Known API Corrections

These are verified fixes — do not revert:

| Wrong | Correct |
|---|---|
| `GET /pos/students/lookup?params` | `POST /pos/students/lookup` with JSON body |
| `GET /pos/transactions` | `GET /orders` |
| `POST /pos/transactions/{id}/void` | `POST /orders/{id}/void` |
| `POST /dashboard/staff-status` | `POST /staff-daily-statuses` |
| `PATCH /students/{id}/payments/{id}` | `PATCH /students/{id}/payments/{id}/amount` |
| `POST /users/{id}/deactivate` | `PATCH /users/{id}/deactivate` |
| `GET /references/system-settings` | `GET /system-configurations` |

---

## Color Palette (inherited from `~/sunbites-pos`)

Full mapping in `src/theme/index.ts`. Key tokens:

```
#E7000B  primary brand red   #09090B  foreground
#F4F4F5  muted background    #71717A  muted text
#E4E4E7  border/outline      #EF4444  error/destructive
#22C55E  success             #EAB308  warning
#3B82F6  info/blue           #A855F7  purple
```

---

## EAS Build

```bash
npm install -g eas-cli
eas login                              # browser OAuth required
eas build --profile development        # dev client
eas build --profile staging            # internal distribution
eas build --profile production         # App Store / Play Store
```

Profiles: `development` + `staging` share the staging API. OTA updates enabled on staging + production channels.

**OQ-4 deferred:** Replace placeholder assets in `assets/` with real icon/splash before first production build only.

---

## Testing (applies to `**/*.test.tsx`, `**/*.spec.ts`, `**/__tests__/**`)

- AAA pattern: Arrange, Act, Assert
- Mock all native modules and API calls — never call real device APIs in unit tests
- Use `testID` to access elements; `waitFor` for async UI updates
- `jest.clearAllMocks()` in `beforeEach`
- Test factories in `tests/factories/` for reusable test data
- 80% coverage minimum (branches, functions, lines, statements)
- Test file location: co-located `__tests__/` folder next to source file
