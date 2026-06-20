# Tasks — 06 Enrollment

## Task List

### 1. Types & API

- [x] Create `src/types/enrollment.ts` — `EnrollmentFormData`, `EnrollPayload`, `ContactPayload`, `EnrolledStudentResponse`
- [x] Enrollment methods already in `src/api/students.ts` — `enrollmentFormData()`, `enroll()`
- [x] Create `src/hooks/useEnrollment.ts` — `useEnrollmentFormData()`, `useEnrollStudent()` mutation

### 2. Zod Schema

- [x] Create `src/lib/schemas/enrollment.ts` — PH phone regex, age 2-20 constraint, subscription conditional superRefine, contacts min 1 max 3

### 3. Enrollment Components

- [x] Create `src/components/enrollment/EnrollmentTypeSelector.tsx` — Subscription / Non-Subscription toggle with descriptions
- [x] Create `src/components/enrollment/SubscriptionPeriodForm.tsx` — month chip selector + year chip selector for start/end
- [x] Create `src/components/enrollment/ContactForm.tsx` — full name, relationship chips, phone, email, address with RHF Controllers
- [x] Create `src/components/enrollment/PermissionsSection.tsx` — two custom checkbox rows + signature field + date display
- [x] Create `src/components/enrollment/EnrollmentSuccess.tsx` — checkmark icon + detail card + QrCodeSvg (frameSize prop) + Share + Enroll Another

### 4. Enrollment Screen

- [x] Implement `app/(app)/enrollment/index.tsx` — KeyboardAvoidingView + ScrollView
- [x] Fetch form metadata with `useEnrollmentFormData()`
- [x] useForm + zodResolver + defaultValues; useFieldArray for contacts
- [x] Subscription period shown only when student_type === 'subscription'
- [x] Dynamic contacts: append/remove with useFieldArray (max 3)
- [x] Submit via `useEnrollStudent()` mutation
- [x] On success: show EnrollmentSuccess with QR; Enroll Another resets form
- [x] On error: toast.error with getApiError()

### 5. Verify

- [x] `npx tsc --noEmit` passes — 0 errors ✅
- [x] PH phone validation — verify in app
- [x] Age validation — verify in app
- [x] Subscription fields conditional — verify in app
- [x] Success QR displays — verify on staging

### 6. Form Input Corrections (from design system — spec 15 REQ-DS-008)

- [x] **ENR-6.1** Replace grade level `FilterChipRow` in `app/(app)/enrollment/index.tsx:172–176` with a `SelectInput` bottom sheet — options: Nursery, Kinder 1, Kinder 2, Grade 1–Grade 12 (same values as `GRADE_LEVELS` constant)

- [x] **ENR-6.2** Replace relationship `FilterChipRow` in `src/components/enrollment/ContactForm.tsx:65–78` with a `SelectInput` bottom sheet — options: Mother, Father, Guardian, Other (same values as `RELATIONSHIPS` constant)

- [x] **ENR-6.3** Replace birthday `TextInput` (label `"Birthday * (YYYY-MM-DD)"`) in `app/(app)/enrollment/index.tsx:188` with a `DatePickerInput` — display as `MMM DD, YYYY`, submit as `YYYY-MM-DD`; retain existing Zod age validation (2–20 years)

- [x] **ENR-6.4** Run `npm run typecheck && npm run lint` — 0 errors (tsc exit 0; lint 0 errors, 3 warnings only) ✅ 2026-06-20

- [ ] **ENR-6.5** Manual verify: grade level shows bottom sheet select, relationship shows bottom sheet select, birthday opens date picker, form submits and validates correctly
