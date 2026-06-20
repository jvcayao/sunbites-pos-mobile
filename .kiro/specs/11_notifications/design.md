# Design — 11 Notifications

## Architecture

```
EchoProvider (root layout, inside auth guard)
  └── laravel-echo + pusher-js
        └── private channel: staff.{userId}
              └── on any event → invalidate unread-count query

NotificationBell (POS header — single instance)
  ├── useQuery: GET /staff/notifications/unread-count
  │     └── shows badge with count (hidden if 0)
  └── onPress → router.push('/(app)/notifications')

Notifications Page
  ├── useInfiniteQuery: GET /staff/notifications
  └── per-row: unread dot + type-aware title + preview + timestamp + context menu
```

---

## EchoProvider (`src/components/notifications/EchoProvider.tsx`)

```typescript
// Client component mounted inside authenticated root layout
// Uses useRef<Echo> to hold the Echo instance
// Reads token from useAuthStore — only connects when token is present
// Connects using:
//   broadcaster: 'reverb'
//   key: EXPO_PUBLIC_REVERB_APP_KEY
//   wsHost: EXPO_PUBLIC_REVERB_HOST
//   wsPort / wssPort: EXPO_PUBLIC_REVERB_PORT
//   forceTLS: EXPO_PUBLIC_REVERB_SCHEME === 'https'
//   authEndpoint: `${EXPO_PUBLIC_API_URL}/broadcasting/auth`
//   auth.headers.Authorization: `Bearer ${token}`
// useEffect cleanup: echo.disconnect()
```

---

## NotificationBell (`src/components/notifications/NotificationBell.tsx`)

```typescript
// Reads userId from useAuthStore(s => s.user?.id)
// useQuery: unreadCountApi.get() → GET /staff/notifications/unread-count → { count: N }
// queryKey: ['staff-notifications-unread-count']
// refetchInterval: none — relies on WebSocket invalidation

// On mount (after EchoProvider is up):
// echo.private(`staff.${userId}`).notification(() => {
//   queryClient.invalidateQueries({ queryKey: ['staff-notifications-unread-count'] })
// })

// Renders: Pressable with bell icon (MaterialCommunityIcons 'bell-outline' / 'bell')
// Badge: react-native-paper Badge shown absolutely positioned top-right
// Badge hidden when count === 0
```

---

## API Layer (`src/api/notifications.ts`)

```typescript
export const notificationsApi = {
  unreadCount: () =>
    client.get<{ count: number }>('/staff/notifications/unread-count'),
  list: (params?: { page?: number; per_page?: number }) =>
    client.get<PaginatedResponse<StaffNotification>>('/staff/notifications', { params }),
  markRead: (id: string) =>
    client.patch(`/staff/notifications/${id}/read`),
  markAllRead: () =>
    client.post('/staff/notifications/mark-all-read'),
  destroy: (id: string) =>
    client.delete(`/staff/notifications/${id}`),
}
```

---

## Types (`src/types/staff-notification.ts`)

Discriminated union on the `type` FQCN (fully-qualified class name from Laravel):

```typescript
// Known notification type strings from Laravel
type AnnouncementFQCN = 'App\\Notifications\\AnnouncementNotification'
type PreRegistrationFQCN = 'App\\Notifications\\PreRegistrationNotification'

interface AnnouncementData {
  announcement_id: number
  title: string | null
  message: string
  sender_name: string
  sent_at: string
}

interface PreRegistrationData {
  pre_registration_id: number
  student_name: string
  enrollment_type: string
  branch_name: string
  submitted_at: string
}

type StaffNotification =
  | { id: string; type: AnnouncementFQCN; data: AnnouncementData; read_at: string | null; created_at: string }
  | { id: string; type: PreRegistrationFQCN; data: PreRegistrationData; read_at: string | null; created_at: string }

// Helper: derive display title from notification
function getNotificationTitle(n: StaffNotification): string {
  switch (n.type) {
    case 'App\\Notifications\\AnnouncementNotification':
      return n.data.title ?? 'Announcement'
    case 'App\\Notifications\\PreRegistrationNotification':
      return `New Pre-Registration: ${n.data.student_name}`
  }
}

// Helper: derive navigation target
function getNotificationRoute(n: StaffNotification): string | null {
  switch (n.type) {
    case 'App\\Notifications\\AnnouncementNotification':
      return `/(app)/announcements/${n.data.announcement_id}`
    case 'App\\Notifications\\PreRegistrationNotification':
      return `/(app)/pre-registrations/${n.data.pre_registration_id}`
    default:
      return null
  }
}
```

---

## React Query Hooks (`src/hooks/useNotifications.ts`)

```typescript
export function useNotificationUnreadCount()   // queryKey: ['staff-notifications-unread-count']
export function useNotificationList()          // useInfiniteQuery, queryKey: ['staff-notifications']
export function useMarkNotificationRead()      // mutation → invalidates unread-count + list
export function useMarkAllNotificationsRead()  // mutation → invalidates unread-count + list
export function useDeleteNotification()        // mutation → invalidates list
```

---

## Utility (`src/lib/relative-time.ts`)

```typescript
// Returns human-readable relative time from an ISO timestamp
// Examples: "just now", "2m ago", "3h ago", "Yesterday", "Jun 15"
export function relativeTime(isoString: string): string
```

---

## Screen Layout (`app/(app)/notifications/index.tsx`)

```
┌─────────────────────────────────────────────┐
│  ← Notifications         [Mark All Read]    │
├─────────────────────────────────────────────┤
│  [●] Announcement: New Update               │  ← unread (dot shown)
│      "The canteen will be open on..."       │
│      2m ago                        [...]    │
├─────────────────────────────────────────────┤
│      New Pre-Registration: Maria Santos     │  ← read (no dot)
│      "Submitted from the portal"            │
│      1h ago                        [...]    │
├─────────────────────────────────────────────┤
│                                             │
│     (empty state when no notifications)     │
│     🔔  You're all caught up               │
│                                             │
└─────────────────────────────────────────────┘
```

Context menu (`...`) options per row:
- Mark as Read (hidden if already read)
- Delete → ConfirmDialog → `DELETE /staff/notifications/{id}`

---

## Components (`src/components/notifications/`)

| Component | Purpose |
|---|---|
| `EchoProvider` | Mounts Echo connection; child of root layout auth guard |
| `NotificationBell` | Bell icon + badge for POS header (single instance) |
| `NotificationRow` | Single notification row with unread dot, type-aware title, preview, timestamp, context menu |
| `NotificationContextMenu` | Popover/modal with Mark Read + Delete actions |
