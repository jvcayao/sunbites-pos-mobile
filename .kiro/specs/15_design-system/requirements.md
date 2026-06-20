# Requirements — 15 Design System

## Overview

Establishes a cohesive, branded design system for Sunbites POS Mobile. Targets Android tablet in landscape mode (primary) with phone fallback. Covers: foundation tokens (typography, color, spacing), logo/brand asset usage, UI components, navigation architecture, motion/animation, and financial data display conventions.

All color tokens are already correct in `src/theme/index.ts` — **do not alter existing palette values**.

---

## REQ-DS-001 — Font System

### Typefaces

| Face | Package | Usage |
|---|---|---|
| Space Grotesk | `@expo-google-fonts/space-grotesk` | Page titles, section headers, screen headings |
| DM Sans | `@expo-google-fonts/dm-sans` | Body text, labels, nav items, form inputs, descriptions |
| DM Mono | `@expo-google-fonts/dm-mono` | ALL financial values (₱), student IDs, receipt numbers, timestamps, transaction IDs |

### Rationale
- **Space Grotesk** — geometric, high-energy display face that matches the brand's bold red identity
- **DM Sans** — neutral, highly legible across all sizes; friendly but not casual
- **DM Mono** — monospace treatment on financial data signals "verify this number"; tabular digits prevent mis-reads of ₱1,000 vs ₱10,000 on a busy POS screen

### Font Weight Tokens

| Token | Weight | Typical Use |
|---|---|---|
| `fontWeightRegular` | 400 | Body text, descriptions |
| `fontWeightMedium` | 500 | Labels, nav items |
| `fontWeightSemibold` | 600 | Subheadings, card titles |
| `fontWeightBold` | 700 | Page titles, CTA buttons |
| `fontWeightBlack` | 900 | Display numerics (total on receipt) |

### Font Loading
- Fonts loaded once at app root (`app/_layout.tsx`) via `useFonts()` from `expo-font`
- App must not render children until fonts are loaded (show `SplashScreen` during load)
- Font constants centralised in `src/theme/fonts.ts` — no hardcoded font family strings elsewhere

---

## REQ-DS-002 — Logo & Brand Assets

### Available Assets

| File | Dimensions | Use Case |
|---|---|---|
| `assets/sunbites.png` | Horizontal wordmark | Login screen hero, nav rail header, receipt header |
| `assets/icon.png` | S lettermark (app icon) | App icon only — do not use in-app at small sizes |
| `assets/splash-icon.png` | Square wordmark | Splash screen background image only |
| `assets/android-icon-foreground.png` | Adaptive icon fg | Build assets only |
| `assets/android-icon-background.png` | Adaptive icon bg | Build assets only |
| `assets/android-icon-monochrome.png` | Monochrome icon | Build assets only |

### Logo Placement Rules

| Location | Asset | Size |
|---|---|---|
| Login screen — main hero | `sunbites.png` | 220×60dp |
| Login screen — card header | `sunbites.png` | 160×44dp |
| Navigation rail — top | `sunbites.png` | 140×38dp |
| Receipt modal — header | `sunbites.png` | 120×32dp |
| Splash screen | `splash-icon.png` | Already implemented in `SplashScreen.tsx` |

### AppLogo Component
- `AppLogo` upgraded to render the actual `sunbites.png` PNG asset (not a CSS circle + letter)
- Variants: `'rail'` (140dp wide, used in nav rail), `'login'` (220dp wide), `'receipt'` (120dp wide), `'compact'` (100dp wide)
- Falls back to the existing circle-S text component if asset load fails
- Uses `expo-image` with `cachePolicy="memory-disk"` for performant repeat renders

---

## REQ-DS-003 — Color Token System

All existing palette values in `src/theme/index.ts` are confirmed correct. This requirement extends the theme with semantic tokens as TypeScript constants — not React Native Paper theme properties — for components that don't use Paper.

### Semantic Token Mapping

| Token | Value | Usage |
|---|---|---|
| `colorPrimary` | `#E7000B` | Brand red — primary actions, active nav, selected states |
| `colorOnPrimary` | `#FFFFFF` | Text/icons on primary red backgrounds |
| `colorSurface` | `#FFFFFF` | Card backgrounds, sheet backgrounds |
| `colorBackground` | `#F4F4F5` | Screen background (zinc-100) |
| `colorBorder` | `#E4E4E7` | Hairline borders, dividers (zinc-200) |
| `colorTextPrimary` | `#09090B` | Main body text (zinc-950) |
| `colorTextSecondary` | `#71717A` | Subtitles, placeholders, metadata (zinc-500) |
| `colorSuccess` | `#22C55E` | Positive amounts, success toast |
| `colorWarning` | `#EAB308` | Low stock, pending status |
| `colorError` | `#EF4444` | Errors, destructive actions, void badges |
| `colorInfo` | `#3B82F6` | Info, subscription badge, informational state |
| `colorOverlay` | `rgba(0,0,0,0.45)` | Modal/sheet backdrop |

### Financial Amount Colors

| Context | Color |
|---|---|
| Positive balance / credit | `colorSuccess` (#22C55E) |
| Negative balance / debt | `colorError` (#EF4444) |
| Neutral amount | `colorTextPrimary` (#09090B) |
| Large receipt total | `colorPrimary` (#E7000B) |

---

## REQ-DS-004 — Spacing & Layout Grid

### 4pt Grid

All spacing uses multiples of 4dp:

| Token | dp | Usage |
|---|---|---|
| `space1` | 4 | Icon padding, micro-gap |
| `space2` | 8 | Inner component padding |
| `space3` | 12 | Tight section gap |
| `space4` | 16 | Standard content padding, card padding |
| `space5` | 20 | Large section gap |
| `space6` | 24 | Screen-level vertical spacing |
| `space8` | 32 | Major section separators |
| `space10` | 40 | Screen header padding |
| `space12` | 48 | Touch target minimum height |

### Border Radius

| Token | dp | Usage |
|---|---|---|
| `radiusSm` | 6 | Chips, badges, small buttons |
| `radiusMd` | 10 | Cards, inputs, standard buttons |
| `radiusLg` | 16 | Bottom sheets, modal sheets |
| `radiusXl` | 24 | FAB, large action buttons |
| `radiusFull` | 9999 | Pill buttons, avatar circles |

### Touch Targets
- All interactive elements: minimum 48dp height (Android) / 44pt (iOS)
- Icon-only buttons: minimum 48×48dp hit area regardless of visual size

---

## REQ-DS-005 — Typography Scale

### Scale

| Role | Face | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| `displayLg` | Space Grotesk | 700 | 28sp | 36 | Splash, major headers |
| `displaySm` | Space Grotesk | 700 | 22sp | 28 | Screen titles |
| `headingLg` | Space Grotesk | 600 | 18sp | 24 | Section headers, card titles |
| `headingSm` | Space Grotesk | 600 | 15sp | 20 | Sub-section headers |
| `bodyLg` | DM Sans | 400 | 16sp | 24 | Primary body text |
| `bodyMd` | DM Sans | 400 | 14sp | 20 | Standard labels, descriptions |
| `bodySm` | DM Sans | 400 | 12sp | 16 | Metadata, timestamps, captions |
| `labelMd` | DM Sans | 500 | 13sp | 18 | Nav labels, button labels |
| `labelSm` | DM Sans | 500 | 11sp | 14 | Badge text, chip text |
| `monoLg` | DM Mono | 700 | 20sp | 26 | Receipt total, large amounts |
| `monoMd` | DM Mono | 400 | 14sp | 20 | Wallet balance, order subtotal |
| `monoSm` | DM Mono | 400 | 12sp | 16 | Student ID, receipt number, timestamp |

### MonoText Component
- `MonoText` — thin wrapper around `Text` that always applies `DM Mono` and correct size
- Props: `size` ('lg' | 'md' | 'sm'), `weight` ('regular' | 'bold'), `color?`
- Used for: all ₱ amounts, student IDs, receipt numbers, transaction IDs, timestamps on receipts

---

## REQ-DS-006 — Button Variants

### Variants

| Variant | Appearance | Usage |
|---|---|---|
| `primary` | Red fill, white text | Main CTAs: "Confirm Purchase", "Save", "Add" |
| `secondary` | White fill, red border + text | Secondary actions: "Cancel", "Back" |
| `ghost` | Transparent, zinc text | Tertiary actions, inline links |
| `destructive` | Error-red fill, white text | "Void Order", "Delete", "Deactivate" |
| `success` | Green fill, white text | "Mark Paid", "Approve" |

### Sizes

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 36dp | 12dp H | labelSm |
| `md` | 44dp | 16dp H | labelMd |
| `lg` | 52dp | 24dp H | labelMd (16sp) |

### States
- Disabled: 40% opacity, no press feedback
- Loading: shows `ActivityIndicator` in place of label, disabled interaction
- Pressed: scale 0.97, 80ms duration (Animated or Reanimated withSpring)

---

## REQ-DS-007 — Card Components

### SectionCard (existing — update style)
- White background, 10dp radius, 1dp zinc-200 border (hairline)
- 16dp padding all sides
- Optional title string (Space Grotesk 600, 15sp)
- Drop shadow: `elevation: 1` (Android), `boxShadow` equivalent (iOS)

### KPI Card (Dashboard)
- White background, 10dp radius
- Icon top-left (24dp, primary tint background circle)
- Metric value: monoLg, brand red for revenue/income, zinc-950 for counts
- Trend badge: ↑ green / ↓ red (labelSm)

### Student Card (POS search result)
- 10dp radius, 1dp border
- Avatar circle (48dp): DM Sans initials, zinc-200 bg
- Name: headingSm, Grade/Section: bodySm zinc-500
- Wallet badge: monoSm, colored by balance sign
- Status badge: top-right corner

### Menu Item Card (POS grid)
- 10dp radius, 1dp zinc-200 border
- No food image — name + price only (per confirmed design decision)
- Name: bodyMd 500, zinc-950
- Price: monMd 700, primary red
- Category badge: bottom-left
- Cart quantity badge: top-right overlay circle (primary red bg, white text)
- Disabled state: 40% opacity, no press response
- Press feedback: scale 0.97 in 80ms

---

## REQ-DS-008 — Input Components

### TextInput Wrapper
- Height: 48dp minimum
- Border: 1dp zinc-200, 10dp radius
- Focus border: 2dp primary red
- Placeholder: DM Sans 400, zinc-500
- Value: DM Sans 400, zinc-950
- Error state: red border + red errorText below field
- Label: DM Sans 500, zinc-950, above the field

### SearchInput
- Left icon: `magnify` (18dp, zinc-400)
- Right icon: `close-circle` (clear button, 18dp) — only when value is non-empty
- Height: 44dp

### NumericInput (for financial fields)
- Uses DM Mono for displayed value
- ₱ prefix rendered as fixed-width mono label

### DatePickerInput (for all date fields)
- **All date fields across the app must use a date picker — never a plain TextInput.**
- Tapping the field opens a native date picker (use `@react-native-community/datetimepicker` or `expo-date-picker` equivalent).
- Display format: `MMM DD, YYYY` (e.g. "Jun 15, 2010") — human-readable, not raw `YYYY-MM-DD`.
- Internally the value is stored as `YYYY-MM-DD` string for API submission.
- The field visually resembles a TextInput (same height, border, label) with a calendar icon on the right.
- Error state same as TextInput (red border + inline error below).

### SelectInput (for enum/option fields)
- **Enum fields with more than 2 options must use a select dropdown — never FilterChip pills.**
- Rule of thumb: 2 options → toggle or radio buttons; 3+ options → SelectInput.
- On mobile, SelectInput opens a bottom sheet with a scrollable option list (not a native picker wheel).
- Each option row: label (bodyMd), checkmark icon on the active row (primary red).
- The collapsed field visually resembles a TextInput with a chevron-down icon on the right.
- Error state same as TextInput.

### FilterChip — Allowed Uses Only
FilterChips (`FilterChipRow` + `FilterChip`) are for **filtering/sorting lists only** — not for form field input.

| ✅ Correct use | ❌ Incorrect use |
|---|---|
| Category filter on POS menu | Grade level selection in enrollment form |
| Transaction status filter | Relationship selection in contact form |
| Date preset picker (Today / This Week / etc.) | Role selection in a create-user form |
| Month selector on meal planner | Any enum with a single answer required |

---

## REQ-DS-009 — Status Badges & Chips

### StatusBadge Component
Unified badge for all status indicators across the app.

| Variant | Colors | Usage |
|---|---|---|
| `success` | Green bg, white text | Active, Completed, OK stock |
| `warning` | Amber bg, white text | Low stock, Pending |
| `error` | Red bg, white text | Out of stock, Voided, Inactive |
| `info` | Blue bg, white text | Subscription, Informational |
| `orange` | Orange bg, white text | Not linked, Over stock |
| `muted` | zinc-100 bg, zinc-600 text | Neutral, Draft |
| `primary` | Red bg, white text | Active role, Primary state |

### FilterChip (existing — minor update)
- Active: primary red bg, white text (already correct)
- Inactive: zinc-100 bg, zinc-950 text (already correct)
- Height: 36dp, 14dp horizontal padding, 18dp radius (pill)

---

## REQ-DS-010 — Navigation (Retained as Bottom Tabs)

The existing bottom tab bar navigation is **retained as-is** on all form factors. No navigation rail will be introduced. This decision keeps implementation complexity low and preserves the current UX pattern the team is familiar with.

- No changes to `app/(app)/_layout.tsx` tab structure
- No `NavigationRail` component required
- Logo does not appear in the navigation area

---

## REQ-DS-011 — Motion & Animation System

### Timing Constants

| Token | Duration | Curve | Usage |
|---|---|---|---|
| `durationPress` | 80ms | spring stiffness:400 | Button/card press scale |
| `durationMicro` | 200ms | easeOut | Badge count increment, chip toggle |
| `durationStandard` | 250ms | easeInOut | List item appear, state transition |
| `durationSheetEnter` | 320ms | spring damping:0.8 | Bottom sheet slide up |
| `durationSheetExit` | 200ms | easeIn | Bottom sheet dismiss |
| `durationToast` | 250ms | spring stiffness:300 | Toast slide in |
| `durationFade` | 150ms | easeOut | Screen fade, overlay appear |

### Press Feedback Pattern

All `Pressable` touch targets use scale feedback:
```typescript
// Standard: 80ms spring press
transform: [{ scale: pressed ? 0.97 : 1.0 }]
// Action buttons (primary CTA): more pronounced
transform: [{ scale: pressed ? 0.95 : 1.0 }]
// Destructive buttons: same as action
```

### Sheet Enter / Exit (Bottom Sheets)
- Enter: slide from bottom 100% → 0%, `durationSheetEnter` spring
- Exit: slide 0% → 100%, `durationSheetExit` easeIn
- Backdrop: fade 0 → 0.45 opacity on enter, reverse on exit

### Badge Count Animation
- When unread count increments: scale 1.0 → 1.4 → 1.0 spring (pop effect)
- Duration: 200ms

### Thermal Receipt Reveal
- Receipt items appear sequentially: each row fades in with 40ms stagger delay
- Total row: slightly longer delay + scale spring from 0.85 → 1.0

---

## REQ-DS-012 — Loading States

### Skeleton Components (existing — ensure consistency)
- `SkeletonCard` — used for card grid loading (POS menu, student list)
- `SkeletonKpi` — used for dashboard KPIs
- `SkeletonRow` — used for list rows (transactions, inventory)

### Pulse Animation
All skeleton components must use a uniform shimmer pulse:
- Opacity alternates: 0.4 → 0.8 → 0.4 in 1200ms loop
- Uses `Animated.loop(Animated.sequence([...]))` — same implementation across all skeleton components

---

## REQ-DS-013 — Empty States

### EmptyState Component (existing — ensure consistency)
- Icon: 48dp, zinc-300, centered
- Title: headingSm, zinc-600, centered
- Subtitle: bodySm, zinc-400, centered, max 2 lines
- Optional CTA: `primary` size `md` button below subtitle
- Vertical centering in the available space

### Standard Empty Messages

| Screen | Icon | Title | Subtitle |
|---|---|---|---|
| POS — no menu items | `food-off` | No menu items | Add items in Menu Management |
| Transactions — no results | `receipt-text-outline` | No transactions | Transactions for this period will appear here |
| Students — no results | `account-off-outline` | No students found | Try adjusting your search |
| Inventory — empty | `package-variant-closed-remove` | No inventory items | Add items in References |

---

## REQ-DS-014 — Receipt / Thermal Display Pattern

### Receipt Modal Layout
- Full-screen modal (not a bottom sheet)
- White background, 16dp padding
- Header: `AppLogo` 'receipt' variant (sunbites.png, 120dp wide), centered
- Divider: dashed line (`borderStyle: 'dashed'`, zinc-200)
- Items: each row — item name (bodyMd), quantity (monoSm zinc-500), line total (monoMd)
- Totals section: right-aligned column using DM Mono
  - Subtotal: monoMd zinc-600
  - Discount (if any): monoMd error red
  - **Total**: monoLg bold, primary red
- Footer: receipt number (monoSm zinc-400) + cashier name (bodySm zinc-400)
- Actions: "Share" (secondary) + "New Order" (primary) buttons

### Thermal Typography Rule
All values on the receipt (amounts, IDs, timestamps) use DM Mono. Names/labels use DM Sans. This creates clear visual separation between data and description.

---

## REQ-DS-015 — FlatList Row / Card Style (Universal)

**Every FlatList `renderItem` across the entire app must render its content inside a floating card container.** This replaces the current flat hairline-bordered rows.

### Visual Spec

```
┌ screen edge                                    screen edge ┐
│  ← 12dp →┌─────────────────────────────────┐← 12dp →     │
│           │  [row content]                  │  ↑ 8dp gap  │
│           └─────────────────────────────────┘             │
│           ┌─────────────────────────────────┐             │
│           │  [row content]                  │             │
│           └─────────────────────────────────┘             │
└────────────────────────────────────────────────────────────┘
```

### Style Token: `listCard`

```typescript
// Add to src/lib/constants.ts as listCardStyle
export const listCardStyle = {
  marginHorizontal: 12,     // breathing room from screen edges
  marginBottom:     8,      // gap between cards
  borderRadius:     10,     // small rounded corners
  backgroundColor:  '#FFFFFF',
  // Floating shadow
  elevation:        2,                          // Android
  shadowColor:      '#000000',                  // iOS
  shadowOffset:     { width: 0, height: 1 },   // iOS
  shadowOpacity:    0.07,                       // iOS — subtle, not heavy
  shadowRadius:     3,                          // iOS
} as const
```

### FlatList Container

```typescript
// contentContainerStyle on every FlatList
contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
// Do NOT add paddingHorizontal here — listCardStyle.marginHorizontal handles it
```

### Rules

- **Every** `renderItem` wraps its root View with `listCardStyle`
- Remove all `borderBottomWidth` hairlines from row styles — the card gap replaces them
- `backgroundColor: white` must be explicit on the card (not inherited) for shadow to work on Android
- For rows with a `Pressable` root: apply `listCardStyle` to the `Pressable` directly, add `overflow: 'hidden'` and `borderRadius: 10` so press ripple is clipped to the card
- For 2-column grids (`numColumns={2}`): use `marginHorizontal: 6` instead of 12 so the grid spacing is even
- **Exception — FilterChipRow and horizontal scroll lists:** horizontal lists inside a screen (not a list of data rows) do not use `listCardStyle`
- **Exception — SelectInput option list:** the bottom sheet option list rows use a flat style (no elevation per row)

### Affected Files

All files in the audit task DS-11.1 must have their `renderItem` wrappers updated.

---

## REQ-DS-016 — App Header (Universal Logo Header)

**Every screen in the app must show the Sunbites logo in its page header.** A new `AppHeader` component replaces all existing `Appbar.Header` usages and is added to every screen that currently has no header.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [sunbites logo]  Page Title             [action] [action] [🔔] │  ← top-level screen
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [←]  [sunbites logo]  Page Title        [action] [action] [🔔] │  ← detail / back screen
└─────────────────────────────────────────────────────────────────┘
```

- Logo: `AppLogo variant="compact"` (100dp wide) — always left-aligned
- Back button (when `showBack` prop is true): appears immediately left of the logo
- Title: DM Sans 600, 15sp, zinc-950 — appears right of logo
- Subtitle (optional): DM Sans 400, 12sp, zinc-500 — below title
- **`NotificationBell` — always present, built into `AppHeader`, rightmost position**
  - Shows unread badge when count > 0
  - Navigates to `/(app)/notifications` on press
  - No prop required — `AppHeader` renders it internally on every screen
- Screen-specific actions (`right` prop): rendered left of `NotificationBell`
- Background: white (`palette.white`)
- Bottom border: 1dp zinc-200 hairline

### Component API

```typescript
interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean          // default false — shows back arrow before logo
  onBack?: () => void         // defaults to router.back() if omitted
  right?: React.ReactNode     // screen-specific Appbar.Action buttons (rendered left of NotificationBell)
}
```

### Screen Mapping

| Screen | Title | showBack | Notes |
|---|---|---|---|
| `dashboard/index` | "Dashboard" | false | — |
| `pos/index` | "Point of Sale" | false | Menu actions in `right`; bell is built-in (remove existing standalone bell) |
| `enrollment/index` | "Enrollment" | false | — |
| `students/index` | "Students" | false | — |
| `students/[id]` | student full name | true | — |
| `reports/index` | "Reports" | false | — |
| `reports/sales` | "Sales Report" | false | — |
| `reports/wallet` | "Wallet Report" | false | — |
| `reports/billing` | "Billing Report" | false | — |
| `reports/credits` | "Credits Report" | false | — |
| `reports/activity` | "Activity Log" | false | — |
| `reports/inventory` | "Inventory Report" | false | — |
| `reports/students` | "Students Report" | false | — |
| `reports/daily-summary` | "Daily Summary" | false | Date + Share actions in right |
| `references/index` | "References" | false | — |
| `references/inventory` | "Inventory" | false | — |
| `references/meal-planner` | "Meal Planner" | false | Edit/Save actions in right |
| `references/users/index` | "Staff Users" | false | — |
| `references/users/create` | "Create Staff Account" | true | — |
| `references/users/[id]` | staff full name | true | actions menu in right |
| `references/branches` | "Branches" | false | — |
| `references/subscription-config` | "Subscription Config" | false | — |
| `references/feedback` | "Feedback" | false | — |
| `references/parents/index` | "Parents" | false | — |
| `references/parents/[id]` | parent full name | true | — |
| `references/system-settings` | "System Settings" | false | — |

### Migration Rule

- `PageHeader` component (`src/components/shared/PageHeader.tsx`) is **retired** — remove from codebase after all usages are migrated to `AppHeader`
- All `Appbar.Header` + `Appbar.Content` usages are replaced with `<AppHeader .../>` — keep any `Appbar.Action` children as the `right` prop

---

## Shared Non-Functional Requirements

- No inline style objects — all styles via `StyleSheet.create()` at file bottom
- No hardcoded font family strings — always import from `src/theme/fonts.ts`
- No hardcoded color hex values — always import from `src/theme/index.ts` palette
- No hardcoded spacing numbers — prefer spacing constants from `src/lib/constants.ts`
- Components that render money must use `MonoText` or explicit DM Mono font family
