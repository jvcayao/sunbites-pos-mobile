# Tasks — 15 Design System

Work in phase order. After each task: change `[ ]` → `[x]` and add a one-line note.

---

## Phase 1 — Font Foundation

- [x] **DS-1.1** Install font packages — `@expo-google-fonts/space-grotesk`, `dm-sans`, `dm-mono` installed ✅ 2026-06-20
  ```bash
  npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono
  ```

- [x] **DS-1.2** Create `src/theme/fonts.ts` — `fontAssets` + `FontFamily` constants; note: DM Mono has no Bold, mapped `mono.bold` → `DMMono_500Medium` ✅ 2026-06-20

- [x] **DS-1.3** Update `app/_layout.tsx` — `useFonts(fontAssets)` added; splash gated on `!ready || !fontsLoaded` ✅ 2026-06-20

- [x] **DS-1.4** Update `src/theme/index.ts` — MD3 font roles overridden with Space Grotesk (headings) + DM Sans (body/labels); colors unchanged ✅ 2026-06-20

- [x] **DS-1.5** Add spacing and radius constants to `src/lib/constants.ts` — `listCardStyle`, `listCardStyleGrid`, `spacing`, `radius` appended ✅ 2026-06-20

---

## Phase 2 — Animation Foundation

- [x] **DS-2.1** Create `src/lib/animation.ts` — `duration` constants + `usePressScale()` (useRef-corrected) + `createSkeletonAnim()` ✅ 2026-06-20

- [x] **DS-2.2** Unify skeleton shimmer — `SkeletonCard`, `SkeletonKpi`, `SkeletonRow` all use `createSkeletonAnim()` ✅ 2026-06-20

---

## Phase 3 — Logo

- [x] **DS-3.1** Update `src/components/shared/AppLogo.tsx` — now renders `assets/sunbites.png` via expo-image; variant prop: `login|rail|receipt|compact`; `AppLogoFallback` added ✅ 2026-06-20

- [x] **DS-3.2** Update `app/(auth)/login.tsx` — `<AppLogo variant="login" />` added ✅ 2026-06-20

- [x] **DS-3.3** Update `app/(auth)/branch.tsx` — `<AppLogo variant="compact" />` added ✅ 2026-06-20

- [x] **DS-3.4** Update `src/components/pos/ReceiptModal.tsx` — `<AppLogo variant="receipt" />` centered at top of receipt ✅ 2026-06-20

---

## Phase 4 — Core New Components

- [x] **DS-4.1** Create `src/components/shared/MonoText.tsx` — DM Mono wrapper; `size` (lg/md/sm) + `weight` (regular/bold) ✅ 2026-06-20

- [x] **DS-4.2** Create `src/components/shared/StatusBadge.tsx` — 7 variants; `size` sm/md ✅ 2026-06-20

- [x] **DS-4.3** Badge audit — 2 candidates found (AnnouncementRow purple badge, MenuMgmtTab); both skipped (no matching variant / aliasing conflict); no clear replacements ✅ 2026-06-20

- [x] **DS-4.4** `src/components/shared/DatePickerInput.tsx` — already existed with full implementation (custom month/day/year picker modal, `MMM dd, yyyy` display, `YYYY-MM-DD` storage); preserved as-is ✅ 2026-06-20

- [x] **DS-4.5** `src/components/shared/SelectInput.tsx` — already existed with full implementation (Portal modal, FlatList options, checkmark on active); preserved as-is ✅ 2026-06-20

---

## Phase 5 — Financial Data Typography

- [x] **DS-5.1** Apply `MonoText` in `src/components/pos/CartPanel.tsx` — subtotal, discount, total, wallet balance converted ✅ 2026-06-20

- [x] **DS-5.2** Apply `MonoText` in `src/components/pos/ReceiptModal.tsx` — receipt number, timestamp, all summary currency values converted; DataTable.Cell children unchanged ✅ 2026-06-20

- [x] **DS-5.3** Apply `MonoText` in `src/components/pos/CartItemRow.tsx` — unit price and line total converted ✅ 2026-06-20

- [x] **DS-5.4** Apply `MonoText` in student cards — wallet balance split into walletRow View; MonoText on currency value ✅ 2026-06-20

- [x] **DS-5.5** Apply `MonoText` in `src/components/dashboard/KpiCard.tsx` — value prop uses MonoText size="lg" weight="bold" ✅ 2026-06-20

---

## Phase 6 — Press Feedback Consistency

- [x] **DS-6.1** Update `src/components/pos/MenuItemCard.tsx` — `usePressScale(0.97)` added; Pressable wrapped in Animated.View ✅ 2026-06-20

- [x] **DS-6.2** Update `src/components/shared/FilterChip.tsx` — `usePressScale(0.95)` replaces `opacity: 0.75`; Pressable wrapped in Animated.View ✅ 2026-06-20

- [x] **DS-6.3** Audit pos/ Pressables — `StudentSearchInput`, `PaymentMethodSelector`, `PosInventoryTab` checked; none are card-level primary interactive cards; no changes needed ✅ 2026-06-20

- [x] **DS-6.4** Audit students/ Pressables — no card-level primary interactive Pressables found beyond already-handled components ✅ 2026-06-20

---

## Phase 7 — Page Header Typography

- [x] **DS-8.1** Update `src/components/shared/PageHeader.tsx` — title uses `FontFamily.grotesk.semibold`; subtitle uses `FontFamily.sans.regular`; removed fontWeight: '700' ✅ 2026-06-20

- [x] **DS-8.2** Verify PageHeader consumers — zero consumers found; PageHeader has no imports anywhere in app; will be deleted in DS-12.28 ✅ 2026-06-20

---

## Phase 9 — Empty States

- [x] **DS-9.1** Audit `src/components/shared/EmptyState.tsx` — title updated to `FontFamily.grotesk.semibold`; subtitle to `FontFamily.sans.regular` ✅ 2026-06-20

- [x] **DS-9.2** Empty message audit — all 4 surfaces covered (POS: "No items found", transactions: "No orders today/yet", students: "No students found", notifications: covered); wording slightly differs from spec but intent met ✅ 2026-06-20

---

## Phase 10 — QA & Typecheck

- [x] **DS-10.1** `npm run typecheck` — 0 errors ✅ 2026-06-20

- [x] **DS-10.2** `npm run lint` — 169 problems all pre-existing; 0 new errors in Phase 5–9 files; warnings dropped 100→98 ✅ 2026-06-20

- [x] **DS-10.3** `npm test` — 322 tests, 48 suites, 0 failures ✅ 2026-06-20

- [ ] **DS-10.4** Manual tablet smoke test — verify: logo renders in login/receipt/branch screens, financial values use mono font, press feedback animates on menu item cards and chips

---

## Phase 11 — FlatList Floating Card Style (REQ-DS-015)

- [x] **DS-11.1** `listCardStyle` already added to `src/lib/constants.ts` in Phase 1 ✅ 2026-06-20

- [x] **DS-11.2** `app/(app)/students/index.tsx` — `listCardStyleGrid` (2-col) / `listCardStyle` (1-col) applied; hairlines removed ✅ 2026-06-20

- [x] **DS-11.3** `app/(app)/reports/sales.tsx` — `listCardStyle` applied; hairline removed ✅ 2026-06-20

- [x] **DS-11.4** `app/(app)/reports/wallet.tsx` — done ✅ 2026-06-20

- [x] **DS-11.5** `app/(app)/reports/inventory.tsx` — done (primary renderItem only; per-row status-colored history rows left untouched intentionally) ✅ 2026-06-20

- [x] **DS-11.6** `app/(app)/reports/billing.tsx` — done ✅ 2026-06-20

- [x] **DS-11.7** `app/(app)/reports/credits.tsx` — done ✅ 2026-06-20

- [x] **DS-11.8** `app/(app)/reports/activity.tsx` — done (root was a Pressable) ✅ 2026-06-20

- [x] **DS-11.9** `app/(app)/reports/students.tsx` — done ✅ 2026-06-20

- [x] **DS-11.10** `app/(app)/references/inventory.tsx` — done ✅ 2026-06-20

- [x] **DS-11.11** `app/(app)/references/system-settings.tsx` — done ✅ 2026-06-20

- [x] **DS-11.12** `app/(app)/references/feedback.tsx` — done ✅ 2026-06-20

- [x] **DS-11.13** `app/(app)/references/branches.tsx` — done (root was Surface; style applied to card) ✅ 2026-06-20

- [x] **DS-11.14** `app/(app)/references/parents/index.tsx` — done ✅ 2026-06-20

- [x] **DS-11.15** `app/(app)/references/users/index.tsx` — done ✅ 2026-06-20

- [x] **DS-11.16** `src/components/pos/PosInventoryTab.tsx` — done ✅ 2026-06-20

- [x] **DS-11.17** `src/components/pos/MenuMgmtTab.tsx` — done ✅ 2026-06-20

- [x] **DS-11.18** `src/components/pos/CartItemRow.tsx` — lighter `cartItemCardStyle` (elevation: 1) applied; removed hairline border ✅ 2026-06-20

- [x] **DS-11.19** `app/(app)/notifications/index.tsx` + `src/components/notifications/NotificationRow.tsx` — `listCardStyle` on NotificationRow wrapper; removed ItemSeparatorComponent hairline ✅ 2026-06-20

- [ ] **DS-11.20** Manual visual check — scroll through Students, each Report screen, References list screens, and POS Transactions; confirm all rows float with rounded corners and no hairline borders between items

---

## Phase 12 — App Header with Logo (REQ-DS-016)

- [x] **DS-12.1** Created `src/components/shared/AppHeader.tsx` — Appbar.Header wrapper; AppLogo compact + NotificationBell built-in; showBack/right props ✅ 2026-06-20

- [x] **DS-12.2** `app/(app)/dashboard/index.tsx` — both states replaced; removed appbar style + Appbar import ✅ 2026-06-20

- [x] **DS-12.3** `app/(app)/pos/index.tsx` — swap-horizontal + logout in right; standalone NotificationBell removed; logoArea/branchPill styles removed; AppLogo/NotificationBell imports removed ✅ 2026-06-20

- [x] **DS-12.4** `app/(app)/enrollment/index.tsx` — both states replaced; removed appbar style + Appbar import ✅ 2026-06-20

- [x] **DS-12.5** `app/(app)/students/index.tsx` — enrollment action in right; removed appbar style ✅ 2026-06-20

- [x] **DS-12.6** `app/(app)/students/[id].tsx` — showBack + Menu in right; removed appbar style ✅ 2026-06-20

- [x] **DS-12.7** `app/(app)/reports/daily-summary.tsx` — title "Daily Summary" + subtitle={date}; calendar + share in right ✅ 2026-06-20

- [x] **DS-12.8** `app/(app)/references/meal-planner.tsx` — Chip visibility + edit/save actions preserved in right ✅ 2026-06-20

- [x] **DS-12.9** `app/(app)/references/users/index.tsx` — create action in right; removed appbar style ✅ 2026-06-20

- [x] **DS-12.10** `app/(app)/references/users/create.tsx` — showBack; removed appbar style + Appbar import ✅ 2026-06-20

- [x] **DS-12.11** `app/(app)/references/users/[id].tsx` — showBack + Menu in right; removed appbar style; unused router import removed ✅ 2026-06-20

- [x] **DS-12.12** `app/(app)/reports/index.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.13** `app/(app)/reports/sales.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.14** `app/(app)/reports/wallet.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.15** `app/(app)/reports/billing.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.16** `app/(app)/reports/credits.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.17** `app/(app)/reports/activity.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.18** `app/(app)/reports/inventory.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.19** `app/(app)/reports/students.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.20** `app/(app)/references/index.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.21** `app/(app)/references/inventory.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.22** `app/(app)/references/branches.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.23** `app/(app)/references/subscription-config.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.24** `app/(app)/references/feedback.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.25** `app/(app)/references/parents/index.tsx` — AppHeader added ✅ 2026-06-20
- [x] **DS-12.26** `app/(app)/references/parents/[id].tsx` — AppHeader title={parent.full_name} showBack added ✅ 2026-06-20
- [x] **DS-12.27** `app/(app)/references/system-settings.tsx` — AppHeader added ✅ 2026-06-20

- [x] **DS-12.28** `src/components/shared/PageHeader.tsx` deleted — zero imports confirmed ✅ 2026-06-20

- [x] **DS-12.29** `npm run typecheck` — 0 errors ✅ 2026-06-20

- [ ] **DS-12.30** Manual check — open every tab on the tablet; confirm Sunbites logo appears in every screen header consistently
