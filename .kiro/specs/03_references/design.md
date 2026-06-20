# Design — 03 References

## Color Palette

Same palette as Reports (inherited from `~/sunbites-pos`). See `src/theme/index.ts` for full token map.

Key colors used in References:
- Status: OK=#22C55E, LOW=#EAB308, OUT=#EF4444, OVER=orange (bg-orange-100 text-orange-700 border-orange-300)
- Role badges: admin=#7C3AED, manager=#2563EB, supervisor=#0891B2, cashier=#059669
- Meal categories: Ulam=#F97316, Vegetables=#22C55E, Fruit=#3B82F6, Soup=#0EA5E9, Snacks=#A855F7
- Feedback categories: Food Quality=#F97316, Service=#3B82F6, Portion Size=#22C55E, Cleanliness=#0891B2, General=#71717A

---

## Navigation Architecture

```
app/(app)/references/
  _layout.tsx                    ← Stack navigator; header with back + title
  index.tsx                      ← References menu (8 section cards)
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
    [id].tsx                     ← Parent detail + actions
  feedback.tsx                   ← Feedback list + detail sheet
  system-settings.tsx            ← System config list + edit sheet
```

---

## Shared Components (`src/components/references/`)

### `SectionCard`
Card used on `references/index.tsx` to navigate to sub-sections. Props: `title`, `description`, `icon`, `onPress`, `visible` (hides if false), `badgeCount` (optional — shows unread/pending count).

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
    logs:      (id)                        => client.get(`/references/inventory/${id}/logs`),     // per-item history
    history:   (params)                    => client.get('/references/inventory/history', { params }), // cross-item history
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
    deactivate:     (id)                   => client.patch(`/users/${id}/deactivate`),
    reactivate:     (id)                   => client.patch(`/users/${id}/reactivate`),
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
  },

  // Parents
  parents: {
    list:             (params)   => client.get('/references/parents', { params }),
    show:             (id)       => client.get(`/references/parents/${id}`),
    resendActivation: (id)       => client.post(`/references/parents/${id}/resend-activation`),
    disable:          (id)       => client.post(`/references/parents/${id}/disable`),
    enable:           (id)       => client.post(`/references/parents/${id}/enable`),
    destroy:          (id)       => client.delete(`/references/parents/${id}`),
    restore:          (id)       => client.post(`/references/parents/${id}/restore`),
  },

  // Feedback
  feedback: {
    list:     (params)       => client.get('/references/feedback', { params }),
    markRead: (id)           => client.patch(`/references/feedback/${id}/mark-read`),
    reply:    (id, message)  => client.post(`/references/feedback/${id}/reply`, { message }),
  },

  // System Settings
  systemSettings: {
    list:   ()             => client.get('/system-configurations'),
    update: (key, data)    => client.put(`/system-configurations/${key}`, data),
  },
}
```

---

## React Query Hooks (`src/hooks/useReferences.ts`)

```typescript
// Inventory
export function useInventoryList()                    // queryKey: ['inventory-list']
export function useInventoryItemLogs(id: number)      // queryKey: ['inventory-item-logs', id] — per-item history modal
export function useInventoryHistory(params)           // queryKey: ['inventory-history', params] — cross-item History tab

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
export function useMarkFeedbackRead()     // mutation → invalidates feedback list
export function useReplyToFeedback()      // mutation → invalidates feedback list

// System Settings
export function useSystemSettings()
```

Mutation hooks (e.g., `useCreateInventoryItem`, `useUpdateUser`, etc.) invalidate the relevant list query key on success.

---

## Types (`src/types/references.ts`)

```typescript
// Inventory
export type InventoryStatus = 'OK' | 'LOW' | 'OUT' | 'OVER'
export type InventoryLogType = 'restock' | 'waste' | 'manual' | 'sale'

export interface InventoryItem {
  id: number
  branch_id: number
  name: string
  quantity: number
  unit: string
  restock_threshold: number
  overstock_threshold: number | null
  cost_per_unit: number | null
  is_archived: boolean
  status: InventoryStatus            // computed by API: OUT | LOW | OVER | OK
}

export interface InventoryLog {
  id: number
  inventory_item_id: number
  order_id: number | null            // set when auto-created by checkout (Sale type)
  adjusted_by: number                // user id
  adjusted_by_name: string           // user display name (included by API relation)
  type: InventoryLogType
  quantity_change: number            // positive = add, negative = deduct
  stock_after: number
  item_name_snapshot: string         // item name at time of log (preserved if renamed)
  reason: string
  created_at: string
}

export interface CreateInventoryDto {
  name: string
  unit: string
  quantity: number                   // initial stock; if > 0, a Restock log is auto-created
  restock_threshold: number
  overstock_threshold?: number
  cost_per_unit?: number
}

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
  activation_status: 'active'|'pending', disabled_at: string|null,
  deleted_at: string|null, students: Array<{id, full_name, grade_level}> }

// Feedback
type FeedbackCategory = 'food_quality'|'service'|'portion_size'|'cleanliness'|'general'
interface FeedbackItem {
  id, category: FeedbackCategory, student_name, rating: number,
  message: string|null, admin_reply: string|null, replied_at: string|null,
  created_at, is_read: boolean
}

// System Settings
interface SystemConfig { key: string, value: string, type: 'integer'|'decimal'|'string', label: string, description: string|null }
```

---

## Per-Screen Specifics

### Inventory (`references/inventory.tsx`)
- `SegmentedButtons` at top to switch between List and History tabs.
- **List tab layout (top to bottom):**
  1. **Add New Item inline form** (always visible at top, dashed-border card): Name, Unit, Initial Qty, Low Alert Qty, Overstock Qty (optional), Cost/Unit (optional) — no FAB.
  2. Active items `FlatList` — each row shows: Name, Qty, Unit, Low Alert, Overstock, Cost/Unit, Status badge, and three action buttons: **[Edit] [History] [✕]**.
     - Edit → opens `FormBottomSheet` with current values (no Initial Qty).
     - History → opens a modal with that item's per-item log: Date/Time, Type, Qty Change, Stock After, Reason, Adjusted By.
     - Delete `[✕]` → blocked if item has log history (offer Archive instead); otherwise confirmation + delete.
  3. Archived items: collapsible section at the bottom with Unarchive button per row.
- Status badge colors: OK=green, LOW=yellow, OUT=red, OVER=orange (`bg-orange-100 text-orange-700 border-orange-300`).

### Meal Planner (`references/meal-planner.tsx`)
- Month selector: horizontal scrollable tab bar of 10 month chips.
- Week selector: 4-button `SegmentedButtons` row below months.
- **Week visibility row** (between week selector and grid): `── [Month] — Week [N] ──── [● Visible to Parents]`
  - Admin/Manager: badge is interactive → tapping opens confirmation dialog
  - Supervisor/Cashier: badge is read-only
  - Published badge: `bg-green-100 text-green-700 border-green-300` — "● Visible to Parents"
  - Unpublished badge: `bg-muted text-muted-foreground` — "○ Hidden from Parents"
  - **Confirmation dialog when toggling visibility:**
    - Publishing: title "Publish {Month} — Week {N} to Parents?", body "Parents will be able to see this week's meal plan.", confirm button primary color, label "Yes, Publish It"
    - Hiding: title "Hide {Month} — Week {N} from Parents?", body "Parents will no longer see this week's meal plan.", confirm button destructive red, label "Yes, Hide It"
- Grid: `ScrollView` with a `View`-based table (not FlatList — fixed 5 days × 5 categories = 25 cells).
- Admin/Manager: cells are editable `TextInput`; Save Week + Reset buttons shown.
- Supervisor/Cashier: cells are plain text; no Save/Reset buttons.
- **Column header colors:** `bg-primary text-primary-foreground text-sm font-semibold` — same for all 5 columns (Day, Ulam, Vegetables, Fruit, Soup, Snacks). No per-column eye icons.
- **Cell background colors (per column):**
  - Day column: `bg-muted text-primary font-bold` — non-editable
  - Ulam cells: `bg-orange-50`
  - Vegetables cells: `bg-green-50`
  - Fruit cells: `bg-blue-50`
  - Soup cells: `bg-sky-50`
  - Snacks cells: `bg-purple-50`
- Table must horizontal-scroll on small screens (min-width: 700px equivalent).
- Toast on save: *"Week {N} of {Month} menu saved."*

### Users (`references/users/`)
- List: `FlatList` with `AvatarInitials` + `RoleBadge`.
- Create: Full-screen `ScrollView` form with 7 `<Card>` sections. Back button confirms discard if dirty.
- Detail: `<Appbar>` with Edit button; `<SegmentedButtons>` for 4 tabs.

### Subscription Config (`references/subscription-config.tsx`)
- Horizontal `ScrollView` wrapping the month × branch matrix.
- Each cell is a `<Pressable>` that opens the edit `FormBottomSheet`.
- Shows computed amount `= school_days × daily_rate` below the days input in real time.
- Daily rate fetched via `referencesApi.systemSettings.list()` → find key `daily_meal_rate`.

### Feedback (`references/feedback.tsx`)
- Row items show category chip + truncated message + unread dot.
- "Unread only" toggle chip to filter list.
- Full detail opens in a `Modal` bottom sheet (not a new screen — avoids navigation for quick review).
- Detail sheet includes: rating stars, message, existing admin reply (if any), reply textarea, Mark as Read button.
- Mark as Read: calls `PATCH /references/feedback/{id}/mark-read` via `referencesApi.feedback.markRead(id)`.
- Reply: calls `POST /references/feedback/{id}/reply` via `referencesApi.feedback.reply(id, message)`.
- No delete action — endpoint does not exist on the API.

### System Settings (`references/system-settings.tsx`)
- `FlatList` of config rows with label, description, value.
- Decimal/integer values shown with ₱ prefix.
- Each row has an Edit button opening a `FormBottomSheet`.
- On save, calls `referencesApi.systemSettings.update(key, { value: '...' })`.
- Inline "Saved ✓" green text on the row that fades after 2s on success.
