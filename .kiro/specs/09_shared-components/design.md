# Design — 09 Shared Components

## File Locations

```
src/components/shared/
  ConfirmDialog.tsx
  ErrorToast.tsx        ← + useToast() hook exported from here
  EmptyState.tsx
  SkeletonCard.tsx
  SkeletonRow.tsx
  SkeletonKpi.tsx
  DatePresetPicker.tsx
  FilterChip.tsx
  FilterChipRow.tsx
  PageHeader.tsx
  SectionCard.tsx
  InlineError.tsx
```

## Toast Hook (`src/components/shared/ErrorToast.tsx`)

```typescript
// Global store-backed toast (Zustand)
interface ToastState {
  visible: boolean
  message: string
  variant: 'success' | 'error'
  show: (message: string, variant?: 'success' | 'error') => void
  hide: () => void
}
export const useToastStore = create<ToastState>(...)

// Hook for imperative use
export function useToast() {
  const { show } = useToastStore()
  return {
    success: (msg: string) => show(msg, 'success'),
    error:   (msg: string) => show(msg, 'error'),
  }
}
```

`ErrorToast` renders as a `<Snackbar>` from `react-native-paper` at the root layout level. The `RootLayout` mounts it once.

## ConfirmDialog API

```typescript
// src/components/shared/ConfirmDialog.tsx
interface ConfirmDialogProps {
  visible: boolean
  title: string
  message?: string
  confirmLabel?: string       // default "Confirm"
  confirmColor?: string       // default palette.red500
  cancelLabel?: string        // default "Cancel"
  loading?: boolean
  onConfirm: () => void
  onDismiss: () => void
}
```

Rendered using `react-native-paper` `<Dialog>`.

## Skeleton Animation

```typescript
const shimmer = useRef(new Animated.Value(0)).current
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(shimmer, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0, duration: 400, useNativeDriver: true }),
    ])
  ).start()
}, [])
const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] })
```

Background: `palette.zinc200` (matches web app `--color-border`).

## DatePresetPicker — Date Format

All dates sent to API are ISO `YYYY-MM-DD` strings. `formatDate()` from `src/lib/formatters.ts` handles display formatting. `date-fns` `format(date, 'yyyy-MM-dd')` for API params.

## FilterChip — Usage Pattern

```typescript
<FilterChipRow>
  {['All', 'Enrolled', 'Paused', 'Banned'].map(status => (
    <FilterChip
      key={status}
      label={status}
      active={filter === status}
      onPress={() => setFilter(status)}
    />
  ))}
</FilterChipRow>
```

## Infinite Scroll Pattern

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['students', params],
  queryFn: ({ pageParam = 1 }) => studentsApi.list({ ...params, page: pageParam }),
  getNextPageParam: (last) => last.data.meta.current_page < last.data.meta.last_page
    ? last.data.meta.current_page + 1 : undefined,
})

const items = data?.pages.flatMap(p => p.data.data) ?? []
```

## API Filter Param Format

Based on the web app's existing calls (which work against the current API), **flat params are used** — not Laravel's `filter[]` bracket syntax:
```
GET /students?enrollment_status=enrolled&grade_level=Grade+3&page=1
```
Not: `filter[status]=enrolled`. Web app uses flat params and the API accepts them.
