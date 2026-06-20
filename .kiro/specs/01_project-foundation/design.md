# Design — 01 Project Foundation

## Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Expo SDK 56 (managed workflow) | Latest stable as of June 2026 (npm latest = 56.0.8); EAS Build target; OTA updates via expo.dev |
| Language | TypeScript (strict) | Matches web app |
| Navigation | Expo Router v4 (file-based) | Mirrors Next.js mental model from web app |
| UI primitives | react-native-paper v5 | Material Design 3, good tablet support |
| State | Zustand | Same library as web app |
| Server state | TanStack React Query v5 | Same library as web app |
| Forms | React Hook Form + Zod | Same libraries as web app |
| HTTP client | Axios with interceptors | Handles `Authorization: Bearer` + `X-Branch-Id`, 401 auto-logout |
| Secure storage | expo-secure-store | Replaces web `sessionStorage` for auth token |
| QR scanning | USB HID barcode scanner (keyboard emulation) | No camera, no permission — scanner types into focused TextInput |
| QR generation | react-native-qr-svg | SVG-based, no bitmaps |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | Matches react-native-paper icon set |
| Date handling | date-fns | Matches web app |

---

## Directory Structure

```
sunbites-pos-mobile/
├── app/                         # Expo Router file-based routes
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── branch.tsx
│   ├── (app)/                   # Protected, role-gated tabs
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   ├── pos/
│   │   │   └── index.tsx
│   │   ├── enrollment/
│   │   │   └── index.tsx
│   │   ├── students/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── reports/
│   │   │   ├── _layout.tsx
│   │   │   ├── sales.tsx
│   │   │   ├── students.tsx
│   │   │   ├── wallet.tsx
│   │   │   ├── inventory.tsx
│   │   │   ├── billing.tsx
│   │   │   ├── credits.tsx
│   │   │   ├── activity.tsx
│   │   │   └── daily-summary.tsx
│   │   └── references/
│   │       ├── _layout.tsx
│   │       ├── inventory.tsx
│   │       ├── meal-planner.tsx
│   │       ├── users/
│   │       │   ├── index.tsx
│   │       │   ├── create.tsx
│   │       │   └── [id].tsx
│   │       ├── branches.tsx
│   │       ├── subscription-config.tsx
│   │       ├── parents/
│   │       │   ├── index.tsx
│   │       │   └── [id].tsx
│   │       └── feedback.tsx
│   └── _layout.tsx              # Root layout — auth guard + QueryClient
├── src/
│   ├── api/
│   │   ├── client.ts            # Axios instance, interceptors
│   │   ├── auth.ts
│   │   ├── students.ts
│   │   ├── pos.ts
│   │   ├── reports.ts
│   │   ├── references.ts
│   │   └── dashboard.ts
│   ├── store/
│   │   ├── auth.ts              # Zustand: token, user, activeBranch
│   │   └── cart.ts              # Zustand: POS cart (in-memory only)
│   ├── hooks/                   # Thin React Query wrappers over src/api/*
│   ├── types/                   # TypeScript interfaces mirroring API responses
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── order.ts
│   │   ├── menu.ts
│   │   ├── inventory.ts
│   │   ├── user.ts
│   │   └── common.ts
│   ├── components/
│   │   ├── ui/                  # Generic: Button, Card, Badge, Input, etc.
│   │   ├── pos/                 # POS-specific: CartItem, MenuCard, StudentCard
│   │   ├── students/
│   │   └── shared/              # PageHeader, EmptyState, LoadingScreen, etc.
│   ├── lib/
│   │   ├── constants.ts         # Role lists, payment methods, grade levels
│   │   ├── permissions.ts       # Role-based access helpers
│   │   └── formatters.ts        # Currency (PHP ₱), date, phone formatters
│   └── theme/
│       └── index.ts             # react-native-paper theme config
├── assets/                      # Icons, splash, adaptive-icon
├── specs/                       # All Kiro spec folders
├── app.json
├── eas.json
├── tsconfig.json
└── .env.*
```

---

## Authentication Architecture

### Cold-Launch Flow

```
App launch
  └── Read token from expo-secure-store
        ├── No token  → navigate to /(auth)/login
        └── Has token → GET /auth/user
              ├── 401  → clear storage → navigate to /(auth)/login
              └── 200  → check activeBranch in Zustand
                    ├── No branch → navigate to /(auth)/branch
                    └── Has branch → navigate to /(app)
```

### Auth Store (Zustand)

```typescript
interface AuthState {
  token: string | null
  user: AuthUser | null
  activeBranch: Branch | null
  login: (token: string, user: AuthUser) => Promise<void>  // persists token to SecureStore
  logout: () => Promise<void>                              // clears SecureStore + resets state
  setActiveBranch: (branch: Branch) => void
}
```

Token is stored in `expo-secure-store` under key `sunbites_token`. The `user` object and `activeBranch` are kept in Zustand memory only and re-fetched from `GET /auth/user` on each cold launch.

### 401 Interceptor

```typescript
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout()
      router.replace('/(auth)/login')
    }
    return Promise.reject(error)
  }
)
```

---

## Navigation Architecture

### Root Layout (`app/_layout.tsx`)

Wraps the entire app with `QueryClientProvider` and `PaperProvider`. Reads auth state to render either the `(auth)` group or `(app)` group. No tabs visible on auth screens.

### App Layout — Bottom Tabs (`app/(app)/_layout.tsx`)

| Tab | Icon | Visible to |
|---|---|---|
| Dashboard | view-dashboard | admin, manager, supervisor |
| POS | point-of-sale | admin, manager, supervisor, cashier |
| Enrollment | account-plus | admin, manager |
| Students | account-group | admin, manager, supervisor |
| Reports | chart-bar | admin, manager |
| References | cog | admin, manager, supervisor |

### Screen Patterns

| Pattern | Used for |
|---|---|
| Full-screen modal | Checkout confirmation, receipt, QR scanner, enrollment form |
| Stack within tab | Students list → Student detail; Users list → User detail |
| Bottom sheet | Filters, quick actions (adjust stock, top-up wallet) |

---

## Role-Based Access

`src/lib/permissions.ts`:

```typescript
export const ROLE_PERMISSIONS = {
  dashboard:           ['admin', 'manager', 'supervisor'],
  pos:                 ['admin', 'manager', 'supervisor', 'cashier'],
  enrollment:          ['admin', 'manager'],
  students:            ['admin', 'manager', 'supervisor'],
  reports:             ['admin', 'manager'],
  references:          ['admin', 'manager', 'supervisor'],
  references_branches: ['admin'],
  references_users:    ['admin', 'manager'],
} as const

export function usePermission(key: keyof typeof ROLE_PERMISSIONS): boolean
```

---

## State Management

### React Query (server state)

- All API reads use React Query hooks in `src/hooks/`.
- Mutations invalidate relevant query keys on success.
- `staleTime`: 60 000 ms (matches web app).
- `retry`: 1.
- Single `QueryClient` instance created in the root layout.

### Zustand (client state)

| Store | Contents | Persistence |
|---|---|---|
| `authStore` | token, user, activeBranch | token → SecureStore; rest in memory |
| `cartStore` | POS cart items, active student, payment method | In-memory only — cleared on checkout |

---

## API Client (`src/api/client.ts`)

```typescript
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { Accept: 'application/json' },
})

// Inject auth headers on every request
client.interceptors.request.use((config) => {
  const { token, activeBranch } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (activeBranch) config.headers['X-Branch-Id'] = String(activeBranch.id)
  return config
})
```

All API modules (`auth.ts`, `students.ts`, `pos.ts`, etc.) import this single `client` instance.

---

## Environment Variables

```bash
# .env.development  (shares staging backend — no local API)
EXPO_PUBLIC_API_URL=https://api-staging.sunbites.com.ph/api/v1

# .env.staging
EXPO_PUBLIC_API_URL=https://api-staging.sunbites.com.ph/api/v1

# .env.production
EXPO_PUBLIC_API_URL=https://api.sunbites.com.ph/api/v1
```

---

## EAS Configuration (`eas.json`)

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "staging": {
      "distribution": "internal",
      "channel": "staging"
    },
    "production": {
      "distribution": "store",
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

OTA updates (`expo-updates`) are enabled on `staging` and `production` channels.

---

## TypeScript Configuration

- `strict: true`
- Path alias: `@/*` → `./src/*`
- All API response shapes must live in `src/types/` and exactly mirror the Laravel API — no invented optional fields.

---

## Responsive Layout System

All screens auto-adapt to orientation changes and tablet screen sizes using `useWindowDimensions()`.

### `src/hooks/useLayout.ts` — shared layout hook

```typescript
import { useWindowDimensions } from 'react-native'

export function useLayout() {
  const { width, height } = useWindowDimensions()
  return {
    width,
    height,
    isLandscape: width > height,
    isTablet: Math.min(width, height) >= 768,
    isLandscapeTablet: width > height && Math.min(width, height) >= 768,
  }
}
```

### Layout patterns per screen type

| Screen | Portrait | Landscape (phone) | Landscape (tablet) |
|---|---|---|---|
| POS | student+menu full screen, cart = bottom sheet FAB | split 60/40 | split 60/40 |
| Enrollment | single-column form | 2-column form sections | 2-column form sections |
| Student List | single-column cards | 2-column card grid | 2-column card grid |
| Student Detail | stacked tabs | tabs stay, content wider | tabs stay, content wider |
| Dashboard | single-column widgets | 2-column widget grid | 3-column widget grid |
| Reports | card list | wider table, more columns | table with all columns visible |
| References | single-column list | list + detail side by side | list + detail side by side |

### Rule
Every screen that renders a list, form, or multi-section layout **must** call `useLayout()` and conditionally render the appropriate layout. Never hardcode pixel widths — always derive from `useWindowDimensions`.
