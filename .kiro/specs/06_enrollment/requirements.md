# Requirements — 06 Enrollment

## Overview

The Enrollment screen allows Admin and Manager roles to register new students, replicating `~/sunbites-pos/app/(kitchen)/enrollment/page.tsx`.

---

## Role Access

Accessible to: `admin`, `manager`. Tab hidden from `supervisor` and `cashier`.

---

## REQ-ENR-001 — Branch Selection

- If the user is an admin, they may select any branch from a button group.
- Non-admin users see only their assigned branch (pre-selected, not changeable).

## REQ-ENR-002 — Enrollment Type

- Radio-style selector: **Subscription** or **Non-Subscription**.
- Selection affects which fields appear in Section 3.

## REQ-ENR-003 — Subscription Period (conditional)

- Shown only when type = Subscription.
- Fields: Start Month (dropdown, school months only), Start Year (number, 2020–2099), End Month (dropdown), End Year (number).
- Live display: "X months" count and "Jun 2025 – Mar 2026" date range preview.
- Validation: End date must be ≥ Start date.

## REQ-ENR-004 — Student Information

- First Name* (text)
- Last Name* (text)
- Student Number (text, optional)
- Grade Level* (dropdown — Nursery, Kinder 1, Kinder 2, Grade 1–12)
- Section (text, optional)
- Birthday* (date picker — student must be 2–20 years old)
- Allergies (textarea, optional)
- Notes (textarea, optional)

## REQ-ENR-005 — Parent/Guardian Contacts (1–3)

- At minimum 1 contact required.
- Up to 3 contacts allowed.
- Per contact:
  - Full Name* (text)
  - Relationship* (dropdown: Mother, Father, Guardian, Other)
  - Phone* (tel — PH format: `09XXXXXXXXX` or `+639XXXXXXXXX`)
  - Email (email, optional)
  - Address* (textarea)
- **Add Another Contact** button shown when < 3 contacts.
- **Remove** (✕) on non-primary contacts.

## REQ-ENR-006 — Permissions & Acknowledgement

- Checkbox: "I give permission for my child to receive meals provided by Sunbites."
- Checkbox: "I acknowledge that Sunbites will be informed of my child's dietary restrictions and allergies."
- Digital Signature field: user types full name.
- Date: read-only display of today's date.
- Both checkboxes must be checked before submission.

## REQ-ENR-007 — Submission & Success

- **Submit Enrollment** button at bottom.
- On success, replace the form with a **Success screen**:
  - Checkmark icon (green).
  - "Enrollment Successful!" heading.
  - Detail card: Full Name, Student Type, Student Number, Enrollment Date.
  - QR Code display (using `react-native-qr-svg`).
  - **Share QR** button — shares QR as image or plain-text ID via `Share.share()`.
  - **Enroll Another Student** button resets and returns to blank form.

## REQ-ENR-008 — Validation

| Field | Rule |
|---|---|
| First / Last Name | Required |
| Grade Level | Required |
| Birthday | Required; age 2–20 years |
| Contact Full Name | Required |
| Contact Relationship | Required |
| Contact Phone | Required; PH mobile format |
| Contact Address | Required |
| Permissions | Both must be checked |
| Signature | Required |
| Subscription Start/End | Required if type = subscription; end ≥ start |
