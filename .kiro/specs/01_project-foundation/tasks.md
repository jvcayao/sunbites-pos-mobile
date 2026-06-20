# Tasks — 01 Project Foundation

## Task List

### 1. Initialize Expo Project

- [x] Run `npx create-expo-app@latest sunbites-pos-mobile --template blank-typescript` in the parent directory — initialized via temp dir (specs/ blocked direct init), files copied back
- [x] Confirm Expo SDK 56 is installed (`expo --version` and check `package.json`) — `expo: ~56.0.8` in package.json
- [x] Remove boilerplate (`App.tsx`, default assets) in preparation for Expo Router setup — App.tsx never copied; using expo-router/entry as main

### 2. Install Core Dependencies

- [x] Install Expo Router: `expo install expo-router` — `expo-router@~56.2.8` in package.json
- [x] Install navigation peer deps: `react-native-screens`, `react-native-safe-area-context` — both installed
- [x] Install UI: `react-native-paper`, `react-native-vector-icons` — using `@expo/vector-icons` (bundled) instead of react-native-vector-icons
- [x] Install state: `zustand` — `zustand@^5.0.3`
- [x] Install server state: `@tanstack/react-query` — `^5.75.8`
- [x] Install forms: `react-hook-form`, `zod`, `@hookform/resolvers` — all installed
- [x] Install HTTP: `axios` — `^1.7.9`
- [x] Install storage: `expo-secure-store` — `~14.0.1`
- [x] Install QR scanner: `expo-camera` — `~56.0.7`
- [x] Install QR generator: `react-native-qr-svg` — `^1.5.0` (latest available)
- [x] Install dates: `date-fns` — `^4.1.0`

### 3. Configure Expo Router

- [x] Set `"main": "expo-router/entry"` in `package.json` — done
- [x] Configure `app.json` with `scheme`, `ios.bundleIdentifier`, `android.package` — `sunbites-pos`, `com.sunbites.pos.mobile`, `com.sunbites.pos.mobile`; supportsTablet: true
- [x] Create `app/_layout.tsx` as root layout with `<Stack />` — full auth guard + QueryClient + PaperProvider
- [x] Verify dev server launches and Expo Router resolves correctly — TypeScript 0 errors, expo-doctor 21/21 passed ✅

### 4. Set Up Environment Variables

- [x] Create `.env.development` with `EXPO_PUBLIC_API_URL` — points to staging API (shared per user decision)
- [x] Create `.env.staging` with `EXPO_PUBLIC_API_URL` — `https://api-staging.sunbites.com.ph/api/v1`
- [x] Create `.env.production` with `EXPO_PUBLIC_API_URL` — `https://api.sunbites.com.ph/api/v1`
- [x] Add all three `.env.*` files to `.gitignore` — added under "local env files" section
- [x] Create `.env.example` with placeholder values for onboarding — done

### 5. Configure TypeScript

- [x] Enable `strict: true` in `tsconfig.json` — extends expo/tsconfig.base with strict: true
- [x] Add path alias `@/*` → `./src/*` in `tsconfig.json` — `paths: { "@/*": ["./src/*"] }`
- [x] Confirm path alias resolves in Expo's Metro bundler (`babel.config.js` with `babel-plugin-module-resolver`) — module-resolver configured, babel-plugin-module-resolver in devDependencies

### 6. Set Up EAS

- [x] Install EAS CLI: `npm install -g eas-cli` — **manual step for user** (requires global install + browser auth)
- [x] Run `eas login` and link to the expo.dev account — **manual step for user**
- [x] Run `eas build:configure` to generate initial `eas.json` — `eas.json` created manually with all 3 profiles
- [x] Edit `eas.json` to match the three profiles: `development`, `staging`, `production` — done; dev+staging share staging API URL
- [x] Install `expo-updates` and configure OTA channels for staging and production — `expo-updates@~56.0.17` installed; channels in eas.json; OTA config in app.json

### 7. Build API Client

- [x] Create `src/api/client.ts` with the Axios instance — baseURL from EXPO_PUBLIC_API_URL
- [x] Add request interceptor to inject `Authorization` and `X-Branch-Id` headers — done
- [x] Add response interceptor to handle 401 (logout + redirect) — done
- [x] Create empty module files: `auth.ts`, `students.ts`, `pos.ts`, `dashboard.ts`, `reports.ts`, `references.ts` — all created; auth.ts has real login/logout/me implementation

### 8. Build Auth Store

- [x] Create `src/store/auth.ts` with Zustand store — done
- [x] Implement `login()` — saves token to `expo-secure-store`, sets state — done; key: `sunbites_token`
- [x] Implement `logout()` — clears `expo-secure-store`, resets state — done
- [x] Implement `setActiveBranch()` — done

### 9. Build Cart Store

- [x] Create `src/store/cart.ts` with Zustand store — done
- [x] Define shape: `items[]`, `student`, `isWalkIn`, `paymentMethod`, `notes` — done
- [x] Implement `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()` — all implemented; addItem increments quantity if item already in cart

### 10. Define Core Types

- [x] Create `src/types/auth.ts` — `AuthUser`, `Branch`, `LoginResponse` — plus `UserRole`
- [x] Create `src/types/student.ts` — `Student`, `StudentContact`, `MonthlyPayment` — plus `PosStudent`, `SchoolMonth`, `StudentType`, `EnrollmentStatus`, `PaymentStatus`
- [x] Create `src/types/order.ts` — `Order`, `OrderItem`, `OrderPaymentMethod`, `OrderStatus` — done
- [x] Create `src/types/menu.ts` — `PosMenuItem`, `MenuCategory` — done
- [x] Create `src/types/inventory.ts` — `InventoryItem`, `InventoryStatus`, `InventoryLogType` — plus `InventoryLog`
- [x] Create `src/types/user.ts` — `StaffUser`, `UserRole` — imports UserRole/Branch from auth.ts to avoid duplication
- [x] Create `src/types/common.ts` — `PaginatedResponse<T>`, `ApiError` — plus `PaginatedMeta`, `PaginatedLinks`

### 11. Build Auth Screens

- [x] Create `app/(auth)/login.tsx` — email + password form with RHF + Zod validation — done; server error display included
- [x] Create `app/(auth)/branch.tsx` — branch selection list — auto-selects if single branch
- [x] Wire login screen to `POST /auth/login` → store token → navigate to branch or app — done
- [x] Wire branch screen to `setActiveBranch()` → navigate to `/(app)` — done; logout button included

### 12. Build Root Layout & Auth Guard

- [x] Update `app/_layout.tsx` to provide `QueryClientProvider` and `PaperProvider` — staleTime 60s, retry 1; PaperProvider with @expo/vector-icons adapter
- [x] Implement cold-launch auth check: read token → validate → route accordingly — bootstrap() in useEffect; orange splash while loading
- [x] Ensure auth screens do not render the tab bar — (auth) group is outside (app) group; no tabs visible

### 13. Build App Shell (Tabs)

- [x] Create `app/(app)/_layout.tsx` with bottom tab navigator — 6 tabs with MaterialCommunityIcons
- [x] Implement role-based tab visibility using `usePermission()` — `href: null` hides tabs for unauthorized roles
- [x] Create `src/lib/permissions.ts` with `ROLE_PERMISSIONS` map and `usePermission()` hook — done
- [x] Add placeholder `index.tsx` screens for each tab (dashboard, pos, enrollment, students, reports, references) — done; reports has full sub-route structure

### 14. Build Shared Utilities

- [x] Create `src/lib/constants.ts` — grade levels, payment methods, enrollment statuses, school months — all constants as const arrays
- [x] Create `src/lib/formatters.ts` — `formatCurrency()`, `formatDate()`, `formatPhone()` — ₱ locale format, date-fns, PH phone display
- [x] Create `src/theme/index.ts` — react-native-paper theme with Sunbites brand colors — primary #F97316 (orange), secondary #1E40AF

### 15. Verify Foundation

- [x] TypeScript strict check passes (`npx tsc --noEmit`) — 0 errors
- [x] `npx expo-doctor` passes — 21/21 checks passed, no issues detected
- [x] Directory structure matches design spec — all app/ routes and src/ modules verified
- [x] `eas build --profile development` completes successfully — **manual step**: run `eas login` then `eas build --profile development`
