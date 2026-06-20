# Tasks — 07 Students

## Task List

### 1. Types & API

- [x] Extended `src/types/student.ts` — `StudentListParams`, `UpdateStudentDto`, `TopUpDto`, `SubscriptionRangeDto`, `ContactDto`, `WalletTransaction`, `StudentActivity`
- [x] `src/api/students.ts` full implementation — all list, detail, update, delete, status, type, QR, wallet, orders, payments, contacts, resend activation
- [x] Created `src/hooks/useStudents.ts` — all query and mutation hooks with key factory

### 2. Student Components

- [x] Create `src/components/students/WalletTopUpSheet.tsx`
- [x] Create `src/components/students/StatusPickerSheet.tsx`
- [x] Create `src/components/students/MonthPaymentBadge.tsx`
- [x] Create `src/components/students/ContactCard.tsx`
- [x] Create `src/components/students/PrintQrSheet.tsx`
- [x] Create `src/components/students/AddSubscriptionPeriodSheet.tsx`
- [x] Create `src/components/students/EditPaymentAmountSheet.tsx`

### 3. Student List Screen

- [x] Implement `app/(app)/students/index.tsx`
- [x] SegmentedButtons type tabs + debounced search + status filter chips
- [x] FlatList + 2-col on tablet/landscape via useLayout()
- [x] Checkbox selection + floating batch bar (Print QR)
- [x] WalletTopUpSheet + ConfirmDialog delete wired
- [x] Infinite scroll + pull-to-refresh

### 4. Student Card Component

- [x] Create `src/components/students/StudentCard.tsx` — avatar, status/type badges, credit badge, monthly payment badges, actions

### 5-11. Student Detail Screen

- [x] `app/(app)/students/[id].tsx` with route param Zod validation
- [x] Header: name, grade, status bar (wallet, points, credit, status)
- [x] More actions menu: change status, top up, print QR, remove (admin)
- [x] 6 tab bar: Profile, Contacts, Wallet, Orders, Payments (subscription only), Logs
- [x] Profile tab: DataTable fields + QR card + share + regenerate
- [x] Contacts tab: ContactCard list + add/edit/delete/resend activation
- [x] Wallet tab: balance + TopUp button + FlatList transactions
- [x] Orders tab: paginated FlatList with infinite scroll
- [x] Payments tab: monthly badges + toggle + edit amount + add period
- [x] Logs tab: activity log FlatList

### 12. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] Student list filters — verify on staging
- [x] Wallet top-up + balance update — verify on staging
- [x] Monthly payment badges toggle — verify on staging
- [x] QR code display and regenerate — verify on staging
