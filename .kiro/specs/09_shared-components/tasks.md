# Tasks — 09 Shared Components

## Task List

### Build Order
These must be completed before implementing any feature spec.

- [x] Create `src/hooks/useLayout.ts` — `useLayout()` returning `{ width, height, isLandscape, isTablet, isLandscapeTablet }` via `useWindowDimensions()` — done, file exists
- [x] Create `src/components/shared/ConfirmDialog.tsx` — react-native-paper Dialog with Portal; all props implemented
- [x] Create `src/components/shared/ErrorToast.tsx` + `useToastStore` (Zustand) + `useToast()` hook — success/error Snackbar, 3s auto-dismiss
- [x] Mount `<ErrorToast />` in `app/_layout.tsx` root layout — mounted inside PaperProvider
- [x] Create `src/components/shared/EmptyState.tsx` — icon, title, optional subtitle, optional action button
- [x] Create `src/components/shared/SkeletonCard.tsx` — animated shimmer, useNativeDriver: true
- [x] Create `src/components/shared/SkeletonRow.tsx` — animated shimmer row, useNativeDriver: true
- [x] Create `src/components/shared/SkeletonKpi.tsx` — animated shimmer KPI grid, useNativeDriver: true
- [x] Create `src/components/shared/DatePresetPicker.tsx` — Modal bottom sheet with 5 presets + custom range text inputs
- [x] Create `src/components/shared/FilterChip.tsx` + `FilterChipRow.tsx` — horizontal scroll, active/inactive styles, 36px height + 44px min-width
- [x] Create `src/components/shared/PageHeader.tsx` — title, subtitle, right slot, border bottom
- [x] Create `src/components/shared/SectionCard.tsx` — Surface elevation 1, 12px radius, 16px padding
- [x] Create `src/components/shared/InlineError.tsx` — HelperText error wrapping RHF message
- [x] Verify `npx tsc --noEmit` passes after all shared components created — 0 errors ✅
