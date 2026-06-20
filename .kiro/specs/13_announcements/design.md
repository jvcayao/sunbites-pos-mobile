# Design — 13 Announcements

## Navigation

```
app/(app)/announcements/
  index.tsx      ← Announcements list
  create.tsx     ← Create announcement form
  [id].tsx       ← Announcement detail + recipient read status
```

Bottom tab: `bullhorn` icon (MaterialCommunityIcons), visible to admin/manager/supervisor.

---

## API Layer (`src/api/announcements.ts`)

```typescript
export const announcementsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    client.get<PaginatedResponse<AnnouncementListItem>>('/announcements', { params }),
  create: (data: CreateAnnouncementDto) =>
    client.post<Announcement>('/announcements', data),
  show: (id: number) =>
    client.get<AnnouncementDetail>(`/announcements/${id}`),
}
```

---

## Types (`src/types/announcement.ts`)

```typescript
type RecipientType = 'parents' | 'staff'

interface AnnouncementListItem {
  id: number
  title: string | null
  message_preview: string     // first 100 chars of message, from mb_substr()
  sender_name: string
  recipient_type: RecipientType
  recipient_count: number
  read_count: number
  created_at: string
}

interface AnnouncementRecipient {
  id: number
  full_name: string
  read_at: string | null
}

interface AnnouncementDetail extends AnnouncementListItem {
  message: string             // full message body, only in detail response
  recipients: AnnouncementRecipient[]
}

interface CreateAnnouncementDto {
  title?: string
  message: string
  recipient_type: RecipientType
  recipient_ids: number[]
}
```

---

## React Query Hooks (`src/hooks/useAnnouncements.ts`)

```typescript
export function useAnnouncementList(params)   // useInfiniteQuery, queryKey: ['announcements']
export function useAnnouncementDetail(id)     // queryKey: ['announcement', id]
export function useCreateAnnouncement()       // mutation → invalidates announcements list on success
```

---

## Announcements List Screen

```
┌─────────────────────────────────────────────┐
│  ← Announcements                        [+] │
├─────────────────────────────────────────────┤
│  Admin Name  [Parents]   •  Jun 20, 2026    │
│  "Reminder: No classes tomorrow..."          │
│  12 recipients  •  8/12 read                │
├─────────────────────────────────────────────┤
│  Manager Name  [Staff]   •  Jun 19, 2026    │
│  "Please complete your timesheets by..."     │
│  5 recipients  •  5/5 read                  │
└─────────────────────────────────────────────┘
```

Recipient type badge colors:
- Parents: purple (`#A855F7`)
- Staff: blue (`#3B82F6`)

---

## Create Announcement Screen

```
┌─────────────────────────────────────────────┐
│  ← New Announcement                  [Send] │
├─────────────────────────────────────────────┤
│  Title (optional)                           │
│  [_________________________________]        │
├─────────────────────────────────────────────┤
│  Message *                         (0/1000) │
│  [_________________________________]        │
│  [_________________________________]        │
├─────────────────────────────────────────────┤
│  Send to:  [● Parents]  [  Staff  ]         │  ← pill toggle
├─────────────────────────────────────────────┤
│  [✓] Select All                             │
│  [✓] Maria Santos                           │
│  [ ] Ana Reyes                              │
│  ...                                        │
└─────────────────────────────────────────────┘
```

- Recipient list changes based on pill toggle selection.
  - When **Parents** is selected: load from `GET /references/parents` (branch-scoped).
  - When **Staff** is selected: load from `GET /users` (branch-scoped).
- Character count shown live on message textarea.
- `Send` button in appbar is disabled until message and at least one recipient are selected.

---

## Announcement Detail Screen

```
┌─────────────────────────────────────────────┐
│  ← Announcement                            │
│  From: Admin Name  •  Jun 20, 2026          │
│  [Parents]                                  │
├─────────────────────────────────────────────┤
│  Optional Title Here                        │
│                                             │
│  Message body goes here...                  │
├─────────────────────────────────────────────┤
│  8 of 12 recipients have read this          │
├─────────────────────────────────────────────┤
│  Maria Santos         Jun 20, 4:05 PM ✓     │
│  Ana Reyes            Not yet read          │
│  ...                                        │
└─────────────────────────────────────────────┘
```

---

## Components (`src/components/announcements/`)

| Component | Purpose |
|---|---|
| `AnnouncementRow` | List row with sender, recipient type badge, message preview, read summary, date |
| `RecipientTypePill` | Toggle between Parents and Staff (pill/segmented style) |
| `RecipientSelector` | Searchable multi-select list of parents or staff |
| `RecipientReadRow` | Per-recipient row in detail screen showing name and read_at status |
