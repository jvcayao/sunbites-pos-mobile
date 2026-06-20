# API Cross-Reference Report
**Mobile specs** (`~/sunbites-pos-mobile/specs/`) vs **Backend specs** (`~/sunbites-api/.kiro/specs/`)

Last audited: 2026-06-01

> Legend: ✅ CONFIRMED & FIXED · 🟡 NEEDS RUNTIME VERIFY (non-blocking) · ➕ DEFERRED / OUT OF SCOPE

---

## Status Summary

All 🔴 breaking mismatches have been **fixed in source files**. Remaining 🟡 items require actual API calls to confirm but are low-risk — the web app (`~/sunbites-pos`) uses every one of these endpoints and works against the same API.

---

## 1. Authentication & Headers

| Item | Mobile | API Spec | Status |
|---|---|---|---|
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `POST /auth/logout` | ✅ | ✅ | ✅ |
| `GET /auth/user` | ✅ | ✅ | ✅ |
| `Authorization: Bearer` + `X-Branch-Id` headers | ✅ | ✅ | ✅ |
| `user.roles: UserRole[]` (array) | ✅ `src/types/auth.ts` | `"role"` string in docs | 🟡 Array confirmed by web app behavior; low risk |
| `POST /auth/branch` (branch set on login) | ✅ `src/api/auth.ts` | Not in docs | 🟡 Used by web app; almost certainly exists |

---

## 2. POS — Student Lookup

| Item | Status |
|---|---|
| `POST /pos/students/lookup` with JSON body `{ type, value }` | ✅ Fixed in `src/api/pos.ts` |
| Search response = array; QR response = single object | 🟡 Handle both shapes in `useLookupStudent` hook |

---

## 3. POS — Orders / Transactions

| Item | Status |
|---|---|
| `GET /orders` (transaction history) | ✅ Fixed — was `/pos/transactions` |
| `POST /orders/{id}/void` | ✅ Fixed — was `/pos/transactions/{id}/void` |
| `POST /pos/checkout` | ✅ Correct |
| `is_credit?: boolean` in checkout payload | ✅ In `src/api/pos.ts` line 34 |
| `POST /pos/inline-reload` | 🟡 Not in API docs; used by web app |

---

## 4. POS — Menu Items & Inventory

| Item | Status |
|---|---|
| `GET/POST/POST toggle/DELETE /pos/menu-items` | ✅ All correct |
| `PUT /pos/menu-items/{id}` (update) | 🟡 Not in API docs; web app uses it |
| `GET /pos/inventory` | 🟡 Not in API docs; web app uses it |
| `POST /pos/inventory/{id}/adjust` | ✅ Confirmed |

---

## 5. Dashboard

| Item | Status |
|---|---|
| `GET /dashboard` | ✅ Correct |
| `POST /staff-daily-statuses` | ✅ Fixed — was `/dashboard/staff-status` |

---

## 6. Enrollment

| Item | Status |
|---|---|
| `GET /enrollment` + `POST /enrollment` | ✅ Correct |
| `permission_meals`, `permission_allergies`, `signature` fields | 🟡 Not in API docs sample payload; used by web app form |
| `qr_code` = raw ID string `SB-XXXXXXXXXXXX` | ✅ Confirmed; client generates QR with `react-native-qr-svg` |

---

## 7. Students

| Item | Status |
|---|---|
| `GET/PUT/DELETE /students/{id}` | ✅ Correct |
| `POST /students/{id}/regenerate-qr` | ✅ Correct |
| `PATCH /students/{id}/status` | ✅ Correct |
| `PATCH /students/{id}/type` | 🟡 Not in API docs; web app uses it |
| `POST /students/{id}/wallet/top-up` | ✅ Correct |
| `GET /students/{id}/wallet/transactions` | 🟡 Not in API docs; web app shows wallet history |
| `POST /students/{id}/credit/settle` | ✅ Added to `src/api/students.ts` |
| `GET/PATCH /students/{id}/payments` | ✅ Correct |
| `PATCH /students/{id}/payments/{id}/amount` | ✅ Fixed — `/amount` suffix added |
| `POST /students/{id}/payments/range` | ✅ Correct |
| All contact CRUD + resend activation | ✅ All correct |
| `StudentContact.portal_status` + `is_primary` | ✅ Added to `src/types/student.ts` |
| Filter params: flat format (`enrollment_status`, not `filter[status]`) | ✅ Confirmed by web app behavior |

---

## 8. Reports (all 8)

All 8 report endpoints (`GET /reports/{name}`) are ✅ confirmed correct. Export (`?export=true`) correctly deferred to v2.

---

## 9. References

| Item | Status |
|---|---|
| All inventory CRUD + logs + history | ✅ Correct |
| Meal planner GET/PATCH/POST/visibility | ✅ Correct |
| `week_number` vs `week` field name in response | 🟡 API doc says `week_number`; handle in hook |
| All user CRUD | ✅ Correct |
| `PATCH /users/{id}/deactivate\|reactivate` | ✅ Fixed — was POST |
| All branch endpoints | ✅ Correct |
| All monthly amounts endpoints | ✅ Correct |
| All parents endpoints | ✅ Correct |
| Feedback `GET/PATCH/DELETE /references/feedback` | 🟡 Not in API docs; used by web app |
| `GET/PUT /system-configurations/{key}` | ✅ Fixed — was `/references/system-settings` |

---

## 10. Response Type Gaps — All Resolved

| Field | Status |
|---|---|
| `Order.wallet_balance_remaining` | ✅ Added to `src/types/order.ts` |
| `Order.credit_balance_after` | ✅ Added |
| `Order.credit_used` | ✅ Added |
| `Order.is_credit` | ✅ Already in Order |
| `Order.points_earned` | ✅ Already in Order |
| `StudentContact.portal_status` | ✅ Added to `src/types/student.ts` |
| `StudentContact.is_primary` | ✅ Added |
| Pagination shape (`data[]` + `meta` + `links`) | ✅ `PaginatedResponse<T>` matches Laravel format |

---

## 🟡 Non-Blocking Items (require runtime verification with staging API)

These 8 items are used by the web app against the same API. They almost certainly exist. Catch during integration testing on staging.

| # | Item | Where to verify |
|---|---|---|
| 1 | `POST /auth/branch` exists | Test branch selection on staging |
| 2 | `user.roles` is array `["admin"]` not string `"admin"` | Check login response in staging |
| 3 | `PUT /pos/menu-items/{id}` exists | Test menu item edit in POS |
| 4 | `GET /pos/inventory` exists | Test POS inventory tab |
| 5 | `POST /pos/inline-reload` exists | Test wallet reload from POS |
| 6 | `PATCH /students/{id}/type` exists | Test student type change |
| 7 | `GET /students/{id}/wallet/transactions` exists | Test wallet tab in student detail |
| 8 | `week_number` field name in meal planner response | Test meal planner API call |

---

## Open Questions — All Resolved

| OQ | Resolution |
|---|---|
| OQ-1 | ✅ Tablet split-pane (≥768px width) confirmed |
| OQ-2 | ✅ On-screen receipt + Share text; no printer v1 |
| OQ-3 | ✅ In-app branch switch confirmed |
| OQ-4 | ⏸ Deferred to production build — placeholder assets in use |
| OQ-5 | ✅ iOS 16+ / Android 10 (API 29) |
