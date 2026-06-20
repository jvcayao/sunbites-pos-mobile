# API Cross-Reference Report — Sunbites POS Mobile

**Last audited: 2026-06-20**

## Status Summary

All breaking (red) mismatches from the original audit have been fixed in `src/api/`. Specs 10–13 are newly added to the API and are **not yet implemented** on mobile. Their endpoints are listed below for planning purposes.

---

## 1. Authentication & Headers

| Endpoint | Status | Notes |
|---|---|---|
| `POST /auth/login` | ✅ Confirmed | |
| `POST /auth/logout` | ✅ Confirmed | Fire-and-forget on client |
| `GET /auth/user` | ✅ Confirmed | Cold-launch bootstrap |
| `POST /auth/branch` | ✅ Confirmed | Used by web app against same API |
| `Authorization: Bearer` + `X-Branch-Id` headers | ✅ Confirmed | Injected by `src/api/client.ts` |
| `user.roles: UserRole[]` (array) | ✅ Confirmed | Spatie behavior; array of strings |

---

## 2. POS — Student Lookup

| Endpoint | Status | Notes |
|---|---|---|
| `POST /pos/students/lookup` with JSON body `{ type, value }` | ✅ Fixed | Was `GET` with params |
| Search response = array; QR response = single object | ✅ Handled | Both shapes handled |

---

## 3. POS — Orders / Transactions

| Endpoint | Status | Notes |
|---|---|---|
| `GET /orders` | ✅ Fixed | Was `GET /pos/transactions` |
| `POST /orders/{id}/void` | ✅ Fixed | Was `POST /pos/transactions/{id}/void` |
| `POST /pos/checkout` | ✅ Confirmed | |
| `is_credit?: boolean` in checkout payload | ✅ Confirmed | |
| `POST /pos/inline-reload` | ⚠️ Unverified | Used by web app; not in API docs |

---

## 4. POS — Menu Items & Inventory

| Endpoint | Status | Notes |
|---|---|---|
| `GET /pos/menu-items` | ✅ Confirmed | |
| `POST /pos/menu-items` | ✅ Confirmed | |
| `POST /pos/menu-items/{id}/toggle` | ✅ Confirmed | |
| `DELETE /pos/menu-items/{id}` | ✅ Confirmed | |
| `PUT /pos/menu-items/{id}` | ⚠️ Unverified | Used by web app; not in API docs |
| `GET /pos/inventory` | ⚠️ Unverified | Used by web app; not in API docs |
| `POST /pos/inventory/{id}/adjust` | ✅ Confirmed | |

---

## 5. Dashboard

| Endpoint | Status | Notes |
|---|---|---|
| `GET /dashboard` | ✅ Confirmed | |
| `POST /staff-daily-statuses` | ✅ Fixed | Was `POST /dashboard/staff-status` |

---

## 6. Enrollment

| Endpoint | Status | Notes |
|---|---|---|
| `GET /enrollment` | ✅ Confirmed | Form config data |
| `POST /enrollment` | ✅ Confirmed | |
| `permission_meals`, `permission_allergies`, `signature` fields | ✅ Confirmed | In payload; used by web app |
| `qr_code` = raw ID string `SB-XXXXXXXXXXXX` | ✅ Confirmed | Pattern `^SB-[A-Za-z0-9]{12}$` |

---

## 7. Students

| Endpoint | Status | Notes |
|---|---|---|
| All basic CRUD | ✅ Confirmed | |
| `PATCH /students/{id}/type` | ⚠️ Unverified | Web app uses it; not in API docs |
| `GET /students/{id}/wallet/transactions` | ⚠️ Unverified | Web app uses it; not in API docs |
| `POST /students/{id}/credit/settle` | ✅ Added | In `src/api/students.ts` |
| `PATCH /students/{id}/payments/{id}/amount` | ✅ Fixed | `/amount` suffix required |
| All contact CRUD + resend activation | ✅ Confirmed | |
| Filter params: flat format | ✅ Confirmed | Not bracket syntax |

---

## 8. Reports (all 8)

All `GET /reports/{name}` endpoints confirmed correct. Export deferred to v2.

---

## 9. References

| Endpoint | Status | Notes |
|---|---|---|
| `GET /references/inventory` | ✅ Confirmed | |
| `GET /references/meal-planner` | ✅ Confirmed | |
| `GET /users` | ✅ Confirmed | |
| `GET /branches` | ✅ Confirmed | |
| `GET /branch-monthly-amounts` | ✅ Confirmed | |
| `GET /references/parents` | ✅ Confirmed | |
| `PATCH /users/{id}/deactivate` | ✅ Fixed | Was `POST` |
| `PATCH /users/{id}/reactivate` | ✅ Fixed | Was `POST` |
| `GET /system-configurations` | ✅ Fixed | Was `GET /references/system-settings` |
| `PUT /system-configurations/{key}` | ✅ Fixed | Was `PUT /references/system-settings/{key}` |
| `GET /references/feedback` | ✅ Confirmed | Staff feedback list (branch-scoped) |
| `PATCH /references/feedback/{id}/mark-read` | ✅ Confirmed | Sets `is_read = true` |
| `POST /references/feedback/{id}/reply` | ✅ Confirmed | Admin reply → sends `FeedbackReplyMail` |

---

## 10. Parents (Staff-Side)

| Endpoint | Status | Notes |
|---|---|---|
| `POST /references/parents/{id}/resend-activation` | ✅ Confirmed | Rate-limited: max 3 per 24h |
| `POST /references/parents/{id}/disable` | ✅ Confirmed | Admin/manager only |
| `POST /references/parents/{id}/enable` | ✅ Confirmed | Admin/manager only |
| `DELETE /references/parents/{id}` | ✅ Confirmed | Soft-delete |
| `POST /references/parents/{id}/restore` | ✅ Confirmed | Admin/manager only |

---

## 11. Notifications (Spec 11 — Implemented)

| Endpoint | Status | Notes |
|---|---|---|
| `POST /broadcasting/auth` | ✅ Confirmed | WebSocket private channel auth — Reverb |
| `GET /staff/notifications` | ✅ Confirmed | All user notifications, newest first |
| `GET /staff/notifications/unread-count` | ✅ Confirmed | Returns `{ count: N }` |
| `PATCH /staff/notifications/{id}/read` | ✅ Confirmed | Mark single notification read |
| `POST /staff/notifications/read-all` | ✅ Confirmed | Mark all read |
| `DELETE /staff/notifications/{id}` | ✅ Confirmed | Hard delete |
| `POST /staff/notifications/clear` | ✅ Confirmed | Clear all for user |

**WebSocket channel:** `staff.{userId}` — private, authenticated via `POST /broadcasting/auth`

---

## 12. Payment Reminders (Spec 12 — Not Yet Implemented on Mobile)

| Endpoint | Status | Notes |
|---|---|---|
| `GET /reminders/bell-count` | 🔲 Planned | `{ count: N }` of unsent eligible parents for upcoming month |
| `GET /reminders/eligible-parents` | 🔲 Planned | Eligible parents list; paginated; branch-scoped; subscription only |
| `POST /reminders/send` | 🔲 Planned | Body: `{ parent_ids[], force? }` → `{ sent, skipped, skipped_names }` |
| `GET /reminders/parents/{parent}` | 🔲 Planned | Parent contact + subscription students + full payment history |

**Roles:** Admin/Manager can send; Supervisor view-only (Send button hidden); Cashier → 403

---

## 13. Announcements (Spec 13 — Not Yet Implemented on Mobile)

| Endpoint | Status | Notes |
|---|---|---|
| `GET /announcements` | 🔲 Planned | Branch-scoped list; newest first |
| `POST /announcements` | 🔲 Planned | Admin/Manager/Supervisor; recipient_type=parents\|staff |
| `GET /announcements/{id}` | 🔲 Planned | Detail + recipient list with `read_at` status |

**WebSocket broadcast:** `staff.{userId}` channel (same NotificationBell as spec 11)

---

## 14. Pre-Registrations (Spec 14 — Not Yet Implemented on Mobile)

| Endpoint | Status | Notes |
|---|---|---|
| `GET /pre-registrations` | 🔲 Planned | Branch-scoped; default filter `pending`; supports status filter |
| `GET /pre-registrations/{id}` | 🔲 Planned | Full detail + contacts |
| `PATCH /pre-registrations/{id}` | 🔲 Planned | Edit; only allowed when status=pending |
| `POST /pre-registrations/{id}/approve` | 🔲 Planned | Admin/Manager only; creates student; 422 if student_number duplicate |
| `POST /pre-registrations/{id}/reject` | 🔲 Planned | Admin/Manager only; requires `rejection_reason` |
| `POST /pre-registrations/{id}/reactivate` | 🔲 Planned | Admin/Manager/Supervisor; resets expired record to pending |

**Roles:** Admin/Manager can approve/reject; Supervisor can reactivate; Cashier → 403 on mutations
**Public form** (`POST /public/pre-registrations`) is portal-only — not exposed on mobile.

---

## 15. Response Type Gaps — All Resolved

`Order.wallet_balance_remaining`, `credit_balance_after`, `credit_used`, `is_credit`, `points_earned`, `StudentContact.portal_status`, `StudentContact.is_primary`, `PaginatedResponse<T>` — all added to `src/types/`.

---

## 16. System Configuration Keys

All keys from `system_configurations` table (seeded values):

| Key | Default | Type | Used By |
|---|---|---|---|
| `daily_meal_rate` | 135 | decimal | Subscription Config live amount preview |
| `credit_limit` | 300 | decimal | POS checkout credit validation |
| `loyalty_point_threshold` | 1000 | decimal | POS wallet |
| `payment_reminder_days` | 14 | integer | Spec 12: reminder window calculation |
| `pre_registration_expiry_days` | 30 | integer | Spec 14: auto-expire pending records |

---

## 17. Non-Blocking Open Items (runtime verification needed)

1. `PUT /pos/menu-items/{id}` exists ⚠️ (web app uses; not in API docs)
2. `GET /pos/inventory` exists ⚠️ (web app uses; not in API docs)
3. `POST /pos/inline-reload` exists ⚠️ (web app uses; not in API docs)
4. `PATCH /students/{id}/type` exists ⚠️ (web app uses; not in API docs)
5. `GET /students/{id}/wallet/transactions` exists ⚠️ (web app uses; not in API docs)
6. `week_number` field name in meal planner response ⚠️ (unverified)
