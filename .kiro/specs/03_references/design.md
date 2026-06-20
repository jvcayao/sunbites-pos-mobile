# Design — 03 References

## Color Palette

Same palette as Reports (inherited from `~/sunbites-pos`). See `src/theme/index.ts` for full token map.

Key colors used in References:
- Status: OK=#22C55E, LOW=#EAB308, OUT=#EF4444, OVER=#3B82F6
- Role badges: admin=#7C3AED, manager=#2563EB, supervisor=#0891B2, cashier=#059669
- Meal categories: Ulam=#F97316, Vegetables=#22C55E, Fruit=#3B82F6, Soup=#0EA5E9, Snacks=#A855F7
- Feedback categories: Food Quality=#F97316, Service=#3B82F6, Pricing=#22C55E, Cleanliness=#0891B2, Other=#71717A

---

## Navigation Architecture

```
app/(app)/references/
  _layout.tsx                    ← Stack navigator; header with back + title
  index.tsx                      ← References menu (7 section cards)
  inventory.tsx                  ← Tabs: Inventory List | Log History
  meal-planner.tsx               ← Month/Week navigator + editable grid
  users/
    index.tsx                    ← User list + search/filter
    create.tsx                   ← Full-screen create form
    [id].tsx                     ← User detail + edit + actions
  branches.tsx                   ← Branch cards + edit/toggle
  subscription-config.tsx        ← Month × Branch matrix
  parents/
    index.tsx                    ← Parent list + search
    [id].tsx                     ← Parent detail + resend activation
  feedback.tsx                   ← Feedback list + detail sheet
```

---

## Shared Components (`src/components/references/`)

### `SectionCard`
Card used on `references/index.tsx` to navigate to sub-sections. Props: `title`, `description`, `icon`, `onPress`, `visible` (hides if false).

### `FormBottomSheet`
Wrapper around `react-native-paper` `<Modal>` presented as a bottom sheet. Props: `visible`, `onDismiss`, `title`, `children`, action buttons. Used for all create/edit forms in References.

### `ConfirmDialog`
Standard confirmation dialog. Props: `visible`, `title`, `message`, `confirmLabel`, `confirmColor` (default red), `onConfirm`, `onCancel`.

### `AvatarInitials`
Circular avatar showing first + last name initials. Props: `name`, `size`, `color`.

### `RoleBadge`
Role-specific badge. Props: `role: UserRole`. Maps role → color.

### `StatusBadge`
Shared with `src/components/reports/StatusBadge.tsx` — imported from there.

---

## API Layer (`src/api/references.ts`)

```typescript
export const referencesApi = {
  // Inventory
  inventory: {
    list:      ()                          => client.get('/references/inventory'),
    create:    (data: CreateInventoryDto)  => client.post('/references/inventory', data),
    update:    (id, data)                  => client.put(`/references/inventory/${id}`, data),
    destroy:   (id)                        => client.delete(`/references/inventory/${id}`),
    archive:   (id)                        => client.patch(`/references/inventory/${id}/archive`),
    unarchive: (id)                        => client.patch(`/references/inventory/${id}/unarchive`),
    logs:      (id)                        => client.get(`/references/inventory/${id}/logs`),
    history:   (params)                    => client.get('/references/inventory/history', { params }),
  },

  // Meal Planner
  mealPlanner: {
    show:               (month, week)      => client.get('/references/meal-planner', { params: { month, week } }),
    update:             (data)             => client.patch('/references/meal-planner', data),
    reset:              (data)             => client.post('/references/meal-planner/reset', data),
    updateVisibility:   (data)             => client.patch('/references/meal-planner/week-visibility', data),
  },

  // Users
  users: {
    list:           (params)               => client.get('/users', { params }),
    show:           (id)                   => client.get(`/users/${id}`),
    create:         (data)                 => client.post('/users', data),
    update:         (id, data)             => client.put(`/users/${id}`, data),
    deactivate:     (id)                   => client.post(`/users/${id}/deactivate`),
    reactivate:     (id)                   => client.post(`/users/${id}/reactivate`),
    resetPassword:  (id)                   => client.post(`/users/${id}/reset-password`),
  },

  // Branches
  branches: {
    list:    ()           => client.get('/branches'),
    update:  (id, data)   => client.put(`/branches/${id}`, data),
    toggle:  (id)         => client.post(`/branches/${id}/toggle`),
  },

  // Subscription Config
  subscriptionConfig: {
    getMonthlyAmounts: (year)         => client.get('/branch-monthly-amounts', { params: { year } }),
    createAmount:      (data)         => client.post('/branch-monthly-amounts', data),
    updateAmount:      (id, data)     => client.put(`/branch-monthly-amounts/${id}`, data),
    getSystemMealRate: ()             => client.get('/references/subscription-config'),
  },

  // Parents
  parents: {
    list:             (params)   => client.get('/references/parents', { params }),
    show:             (id)       => client.get(`/references/parents/${id}`),
    resendActivation: (id)       => client.post(`/references/parents/${id}/resend-activation`),
  },

  // Feedback
  feedback: {
    list:    (params)       => client.get('/references/feedback', { params }),
    update:  (id, data)     => client.patch(`/references/feedback/${id}`, data),
    destroy: (id)           => client.delete(`/references/feedback/${id}`),
  },
}
```

---

## React Query Hooks (`src/hooks/useReferences.ts`)

```typescript
// Inventory
export function useInventoryList()
export function useInventoryHistory(params)
export function useInventoryLogs(id)

// Meal Planner
export function useMealPlanner(month: SchoolMonth, week: 1|2|3|4)

// Users
export function useUserList(params)
export function useUserDetail(id)

// Branches
export function useBranchList()

// Subscription Config
export function useMonthlyAmounts(year: number)

// Parents
export function useParentList(params)
export function useParentDetail(id)

// Feedback
export function useFeedbackList(params)
```

Mutation hooks (e.g., `useCreateInventoryItem`, `useUpdateUser`, etc.) invalidate the relevant list query key on success.

---

## Types (`src/types/references.ts`)

```typescript
// Inventory
interface InventoryItemCreate { name, unit, quantity, restock_threshold, overstock_threshold?, cost_per_unit? }

// Meal Planner
interface MealPlannerWeek {
  month: SchoolMonth, week: 1|2|3|4, visible_to_parents: boolean,
  meals: Array<{ day: 'monday'|...|'friday', ulam, vegetables, fruit, soup, snacks }>
}

// Users
interface CreateUserDto { first_name, last_name, email, password, password_confirmation,
  roles: UserRole[], branch_ids: number[], ... }

// Branches
interface BranchDetail extends Branch { gcash_number?, address?, is_active: boolean,
  stats: { staff_count, student_count, orders_today } }

// Monthly Amounts
interface BranchMonthlyAmount { id, branch_id, school_month: SchoolMonth,
  year: number, school_days: number, amount?: number }

// Parents
interface Parent { id, first_name, last_name, full_name, email,
  activation_status: 'active'|'pending', students: Array<{id, full_name, grade_level}> }

// Feedback
interface FeedbackItem { id, category: FeedbackCategory, student_name, message,
  created_at, is_resolved: boolean }
type FeedbackCategory = 'food_quality'|'service'|'pricing'|'cleanliness'|'other'
```

---

## Per-Screen Specifics

### Inventory (`references/inventory.tsx`)
- `SegmentedButtons` at top to switch between List and History tabs.
- List tab: `FlatList` of items; swipe-left on a row reveals Edit and Delete actions (via `react-native-swipeable` or long-press menu).
- "Add Item" FAB (floating action button) in bottom-right, opens `FormBottomSheet`.
- Archived items: collapsible section at the bottom of the list.

### Meal Planner (`references/meal-planner.tsx`)
- Month selector: horizontal scrollable tab bar of 10 month chips.
- Week selector: 4-button `SegmentedButtons` row below months.
- Grid: `ScrollView` with a `View`-based table (not FlatList — fixed 5 days × 5 categories = 25 cells).
- Edit mode toggled by a pencil button in the header; in view mode cells are plain text, in edit mode they become `TextInput`.
- Color-coded column headers matching web app.

### Users (`references/users/`)
- List: `FlatList` with `AvatarInitials` + `RoleBadge`.
- Create: Full-screen `ScrollView` form with 7 `<Card>` sections. Back button confirms discard if dirty.
- Detail: `<Appbar>` with Edit button; `<SegmentedButtons>` for 4 tabs.

### Subscription Config (`references/subscription-config.tsx`)
- Horizontal `ScrollView` wrapping the month × branch matrix.
- Each cell is a `<TouchableRipple>` that opens the edit `FormBottomSheet`.
- Shows computed amount `= school_days × daily_rate` below the days input in real time.

### Feedback (`references/feedback.tsx`)
- Row items show category chip + truncated message.
- Full detail opens in a `Modal` bottom sheet (not a new screen — avoids navigation for quick review).
