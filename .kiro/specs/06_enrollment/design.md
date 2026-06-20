# Design — 06 Enrollment

## API (`src/api/students.ts` — enrollment section)

```typescript
export const studentsApi = {
  enrollmentFormData: () =>
    client.get<EnrollmentFormData>('/enrollment'),
  enroll: (payload: EnrollPayload) =>
    client.post<EnrolledStudentResponse>('/enrollment', payload),
}
```

## Types (`src/types/enrollment.ts`)

```typescript
export interface EnrollmentFormData {
  grade_levels: string[]
  branches: Branch[]
  school_months: SchoolMonth[]
}

export interface ContactPayload {
  full_name: string; relationship: string
  phone: string; email?: string; address: string
}

export interface EnrollPayload {
  branch_id: number
  student_type: StudentType
  first_name: string; last_name: string
  student_number?: string; grade_level: string; section?: string
  birthday: string; allergies?: string; notes?: string
  contacts: ContactPayload[]
  permission_meals: boolean; permission_allergies: boolean
  signature: string
  subscription_start_month?: SchoolMonth; subscription_start_year?: number
  subscription_end_month?: SchoolMonth;   subscription_end_year?: number
}

export interface EnrolledStudentResponse {
  id: number; full_name: string; student_number: string
  student_type: StudentType; enrollment_date: string; qr_code: string
}
```

## Zod Validation Schema

```typescript
const contactSchema = z.object({
  full_name: z.string().min(1),
  relationship: z.enum(['Mother', 'Father', 'Guardian', 'Other']),
  phone: z.string().regex(/^(09|\+639)\d{9}$/, 'Invalid PH phone number'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1),
})

const enrollSchema = z.object({
  branch_id: z.number().positive(),
  student_type: z.enum(['subscription', 'non_subscription']),
  first_name: z.string().min(1), last_name: z.string().min(1),
  grade_level: z.string().min(1),
  birthday: z.string().refine(val => {
    const age = differenceInYears(new Date(), parseISO(val))
    return age >= 2 && age <= 20
  }, 'Student must be 2–20 years old'),
  contacts: z.array(contactSchema).min(1).max(3),
  permission_meals: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  permission_allergies: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  signature: z.string().min(1),
  // Conditional subscription fields handled with .superRefine()
})
```

## Screen Layout

```
app/(app)/enrollment/index.tsx

ScrollView (KeyboardAvoidingView)
  ├── Section Card: Branch Selection
  ├── Section Card: Enrollment Type (radio buttons)
  ├── Section Card: Subscription Period (conditional)
  ├── Section Card: Student Information
  ├── Section Card(s): Parent/Guardian (1–3, dynamic)
  │     └── Add Another Contact button
  ├── Section Card: Permissions & Signature
  └── Submit Button

─── Success State (replaces form) ───
  ├── Green checkmark icon
  ├── Success heading + detail card
  ├── QrCode component (react-native-qr-svg)
  ├── Share QR button
  └── Enroll Another Student button
```

## React Query Hooks (`src/hooks/useEnrollment.ts`)

```typescript
export function useEnrollmentFormData()   // queryKey: ['enrollment-form-data']
export function useEnrollStudent()        // useMutation → POST /enrollment
```

## Components (`src/components/enrollment/`)

| Component | Purpose |
|---|---|
| `BranchSelector` | Admin: button group; non-admin: pre-filled label |
| `EnrollmentTypeSelector` | Subscription / Non-Subscription radio buttons |
| `SubscriptionPeriodForm` | Start/End month+year + live preview |
| `StudentInfoForm` | Name, grade, birthday, allergies, notes fields |
| `ContactForm` | Single contact fields block (repeatable) |
| `PermissionsSection` | Two checkboxes + signature field |
| `EnrollmentSuccess` | QR display + share + re-enroll |

## Form State

Use React Hook Form's `useFieldArray` for dynamic contacts:

```typescript
const { fields, append, remove } = useFieldArray({ control, name: 'contacts' })
```

Subscription period fields use `watch('student_type')` to conditionally show/hide.
