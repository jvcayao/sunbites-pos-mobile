---
title: State Management
inclusion: conditional
priority: high
file_patterns:
  - "**/hooks/**/*"
  - "**/stores/**/*"
  - "**/contexts/**/*"
  - "**/providers/**/*"
  - "**/services/**/*"
---

# State Management

## Three-Layer Pattern

| State Type | Tool | Example |
|-----------|------|---------|
| Server/API state | TanStack Query 5 | Student list, enrollment detail, sales reports |
| Client-only UI state | Zustand 5 | Cart items, active branch, bottom sheet open, filters |
| Auth/global context | React Context | Current user, auth tokens, active branch identity |

**Rule:** Never duplicate server state in Zustand or Context. If data comes from an API, it belongs in TanStack Query.

---

## TanStack Query (Server State)

### Setup

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,           // 10 minutes garbage collection
      retry: 1,                          // retry once on failure
      refetchOnWindowFocus: false,       // not relevant on mobile
      refetchOnReconnect: true,          // refetch when network returns
    },
  },
});
```

### Query Keys

Hierarchical arrays for automatic invalidation:

```typescript
// Query key factory
export const queryKeys = {
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (params?: StudentListParams) => [...queryKeys.students.lists(), params] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
  enrollments: {
    all: ['enrollments'] as const,
    byBranch: (branchId: string) => [...queryKeys.enrollments.all, 'branch', branchId] as const,
  },
  sales: {
    all: ['sales'] as const,
    reports: (params?: SalesReportParams) => [...queryKeys.sales.all, 'report', params] as const,
  },
} as const;
```

### Query Hooks

```typescript
// hooks/use-students.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api-client';
import { queryKeys } from '../lib/query-keys';
import type { StudentListParams } from '../types/student.types';

export function useStudents(params?: StudentListParams) {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => api.get<StudentListResponse>('/students', { params }),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => api.get<Student>(`/students/${id}`),
    enabled: !!id, // don't fetch if no id
  });
}
```

### Mutation Hooks

```typescript
// hooks/use-create-enrollment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api-client';
import { queryKeys } from '../lib/query-keys';
import * as Haptics from 'expo-haptics';

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnrollmentInput) =>
      api.post<Enrollment>('/enrollments', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}
```

### Pull-to-Refresh Pattern

```typescript
export function StudentListScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useStudents();

  return (
    <FlatList
      data={data}
      refreshing={isRefetching}
      onRefresh={refetch}
      // ...
    />
  );
}
```

### Infinite Scroll / Pagination

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useStudentsInfinite() {
  return useInfiniteQuery({
    queryKey: queryKeys.students.lists(),
    queryFn: ({ pageParam = 0 }) =>
      api.get<StudentListResponse>('/students', {
        params: { limit: 20, offset: pageParam },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    initialPageParam: 0,
  });
}
```

---

## Zustand (Client-Only UI State)

For state that **never touches the API** — cart items, UI toggles, filters, active branch.

### Store Pattern

```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import type { CartItem } from '../types/pos.types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
```

### Usage — Always Use Selectors

```typescript
// CORRECT — pick only what you need (prevents unnecessary re-renders)
const items = useCartStore((s) => s.items);
const addItem = useCartStore((s) => s.addItem);

// WRONG — subscribes to entire store
const store = useCartStore();
```

### Persisted State (non-sensitive only)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePreferencesStore = create(
  persist<PreferencesState>(
    (set) => ({
      onboardingComplete: false,
      setOnboardingComplete: () => set({ onboardingComplete: true }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Note:** Only persist non-sensitive preferences. Tokens go in `expo-secure-store`.

---

## React Context (Auth & Global Providers)

For state that wraps the entire app and changes infrequently.

```typescript
// contexts/AuthContext.tsx
interface AuthContextValue {
  user: UserContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**When to use Context vs Zustand:**
| Use Context | Use Zustand |
|-------------|-------------|
| Auth state (wraps entire app) | Cart items, UI toggles, filters |
| Active branch identity | Bottom sheet state |
| Changes rarely | Changes frequently |
| Needs provider tree position | Standalone, no provider needed |

---

## Decision Tree

```
Is the data from an API?
  → YES → TanStack Query

Is it auth/user session state?
  → YES → React Context (AuthProvider)

Is it POS cart or UI-only state shared across screens?
  → YES → Zustand store

Is it local to one screen/component?
  → YES → useState / useReducer
```

---

## Rules

1. **Server state in TanStack Query** — never cache API data in Zustand or Context
2. **Use query key factories** — enables granular invalidation
3. **Invalidate on mutation success** — not optimistic update (unless UX requires it)
4. **Zustand selectors always** — never destructure the entire store
5. **Context for auth only** — don't use Context for frequently changing state
6. **Persist carefully** — only non-sensitive preferences in AsyncStorage
7. **Tokens in SecureStore** — never in Zustand, Context state, or AsyncStorage
