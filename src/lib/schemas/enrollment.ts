import { z } from 'zod'
import { differenceInYears, isValid, parseISO } from 'date-fns'

export const contactSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  relationship: z.enum(['Mother', 'Father', 'Guardian', 'Other'], {
    errorMap: () => ({ message: 'Select a relationship' }),
  }),
  phone: z
    .string()
    .regex(/^(09|\+639)\d{9}$/, 'Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX)'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  is_primary: z.boolean().optional(),
})

export const enrollSchema = z
  .object({
    branch_id: z.number().positive('Select a branch'),
    student_type: z.enum(['subscription', 'non_subscription']),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    student_number: z.string().optional(),
    grade_level: z.string().min(1, 'Grade level is required'),
    section: z.string().optional(),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
      .refine((val) => isValid(parseISO(val)), 'Invalid date')
      .refine((val) => {
        const age = differenceInYears(new Date(), parseISO(val))
        return age >= 2 && age <= 20
      }, 'Student must be 2–20 years old'),
    allergies: z.string().optional(),
    notes: z.string().optional(),
    contacts: z.array(contactSchema).min(1, 'At least one contact is required').max(3),
    permission_meals: z.literal(true, { errorMap: () => ({ message: 'Permission required' }) }),
    permission_allergies: z.literal(true, { errorMap: () => ({ message: 'Permission required' }) }),
    signature: z.string().min(1, 'Signature is required'),
    subscription_start_month: z.string().optional(),
    subscription_start_year: z.number().optional(),
    subscription_end_month: z.string().optional(),
    subscription_end_year: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.student_type === 'subscription') {
      if (!data.subscription_start_month) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start month required', path: ['subscription_start_month'] })
      }
      if (!data.subscription_start_year) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start year required', path: ['subscription_start_year'] })
      }
      if (!data.subscription_end_month) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End month required', path: ['subscription_end_month'] })
      }
      if (!data.subscription_end_year) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End year required', path: ['subscription_end_year'] })
      }
    }
  })

export type EnrollFormData = z.infer<typeof enrollSchema>
