# Requirements — 09 Shared Components

## Overview

Shared UI primitives used across all modules. Must be built before implementing any feature spec. Every component here is referenced in two or more other specs.

---

## REQ-SHR-001 — ConfirmDialog

- A modal dialog for all destructive or irreversible actions.
- Props: `visible`, `title`, `message`, `confirmLabel` (default "Confirm"), `confirmColor` (default `palette.red500`), `cancelLabel` (default "Cancel"), `onConfirm`, `onDismiss`, `loading` (disables buttons while mutation is in flight).
- Used by: void order, delete student, delete inventory item, deactivate user, reset meal planner, delete feedback, remove contact.

## REQ-SHR-002 — ErrorToast / SnackBar

- A bottom-of-screen notification for API errors, validation failures, and success confirmations.
- Two variants: `error` (red) and `success` (green).
- Auto-dismisses after 3 seconds. Can be dismissed by tap.
- Global singleton — controlled via a `useToast()` hook that any component can call.
- Example triggers: failed checkout, failed status update, successful top-up.

## REQ-SHR-003 — EmptyState

- Centered `View` with: icon (MaterialCommunityIcons), title text, optional sub-text, optional action button.
- Used when a list returns 0 results (after filters or on first load).
- Standard icons per context:
  - Students: `account-group-outline`
  - Orders: `receipt-outline`
  - Inventory: `package-variant-closed`
  - Reports: `chart-bar`
  - Generic: `inbox-outline`
- Each spec calling EmptyState must specify the title text.

## REQ-SHR-004 — SkeletonLoader

- Animated shimmer placeholder shown while data is loading.
- Variants:
  - `SkeletonCard` — full-width card placeholder (height ~80dp).
  - `SkeletonRow` — table row placeholder (height ~48dp).
  - `SkeletonKpi` — square card placeholder for dashboard KPI cards.
- Uses `Animated.loop` with opacity fade (0.4 → 0.9 → 0.4), ~800ms cycle.
- Render N skeleton rows (configurable, default 5) until real data arrives.

## REQ-SHR-005 — DatePresetPicker

- Bottom sheet offering date range presets: Today, This Week, This Month, Last Month, Custom Range.
- Custom Range: two date inputs (From / To) using native `DateTimePicker` (expo-date-picker).
- Returns `{ from: string; to: string }` ISO date strings on confirm.
- Used in: Sales Report, Credits Report, Activity Log, Inventory History, Transaction History.

## REQ-SHR-006 — FilterChip

- Horizontal scrollable row of selectable chips.
- Active chip: `backgroundColor: palette.orange500`, text white.
- Inactive chip: `backgroundColor: palette.zinc100`, text `palette.zinc900`.
- Used in: Reports filters, POS category selector, Student list status filters.

## REQ-SHR-007 — PageHeader

- Consistent screen header component.
- Props: `title`, `subtitle` (optional), `right` (optional ReactNode — for action buttons).
- Used as the top section of screens that use their own header (not Expo Router's Appbar).

## REQ-SHR-008 — SectionCard

- White `Surface` with 12px border radius, 4dp elevation, 16px padding.
- Used as the container for form sections in Enrollment, User Create/Edit, and References forms.

## REQ-SHR-009 — InlineError

- Small red text component shown directly below a form field on validation failure.
- Wraps React Hook Form `fieldState.error.message`.
- Used in all forms with RHF + Zod.

## REQ-SHR-012 — Responsive Layout Hook

- `src/hooks/useLayout.ts` exports `useLayout()` returning `{ width, height, isLandscape, isTablet, isLandscapeTablet }`.
- Every screen that renders a list, form, or multi-section layout **must** call `useLayout()` and conditionally apply the correct layout.
- Breakpoints: `isLandscape = width > height`, `isTablet = Math.min(width, height) >= 768`.
- Never hardcode pixel widths — always derive from `useWindowDimensions()`.

| Screen type | Portrait | Landscape / Tablet |
|---|---|---|
| POS | Student+menu full screen, cart = bottom sheet | Split 60/40 side-by-side |
| Enrollment | Single-column form | 2-column form sections |
| Student List | Single-column cards | 2-column card grid |
| Dashboard | Single-column widgets | 2–3 column widget grid |
| Reports | Card list rows | Wider table, more columns |
| References | Single-column list | List + detail side by side |

## REQ-SHR-010 — Pull-to-Refresh Pattern

- Standard behavior across all list screens:
  - `RefreshControl` prop on `ScrollView` / `FlatList`.
  - Spinner color: `palette.orange500`.
  - On refresh: call `refetch()` from the screen's primary React Query hook.
  - After refresh completes: show `ErrorToast` if failed, no notification if successful.

## REQ-SHR-011 — Infinite Scroll / Load More Pattern

- Standard pagination behavior for all paginated lists:
  - Use `useInfiniteQuery` from React Query.
  - Trigger next page when user scrolls within 200px of list bottom (`onEndReachedThreshold: 0.2`).
  - Show a `<ActivityIndicator>` at the bottom while the next page is loading.
  - Show "No more results" text when `hasNextPage === false` and list has items.
  - Screens using this: Students, Reports (all), Transaction History, Users, Parents, Feedback.
