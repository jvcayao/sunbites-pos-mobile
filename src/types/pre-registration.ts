export type PreRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type EnrollmentType = 'subscription' | 'non_subscription'

export interface PreRegistrationContact {
  id: number
  full_name: string
  relationship: string
  phone: string
  email: string | null
  address: string
  is_primary: boolean
}

export interface PreRegistrationListItem {
  id: number
  first_name: string
  last_name: string
  full_name: string
  status: PreRegistrationStatus
  enrollment_type: EnrollmentType
  submitted_at: string
  expires_at: string | null
  contact_name: string
}

export interface PreRegistrationDetail extends PreRegistrationListItem {
  student_number: string | null
  grade_level: string
  section: string | null
  birthday: string
  allergies: string | null
  notes: string | null
  subscription_start_month: string | null
  subscription_start_year: number | null
  subscription_end_month: string | null
  subscription_end_year: number | null
  contacts: PreRegistrationContact[]
  rejection_reason: string | null
  rejected_by: string | null
  approved_by: string | null
  processed_at: string | null
  recaptcha_score: number | null
  submitter_ip: string | null
  duplicate_warning: boolean
  existing_student_name: string | null
}

export interface UpdatePreRegistrationDto {
  first_name?: string
  last_name?: string
  student_number?: string
  grade_level?: string
  section?: string
  birthday?: string
  allergies?: string
  notes?: string
  enrollment_type?: EnrollmentType
  subscription_start_month?: string
  subscription_start_year?: number
  subscription_end_month?: string
  subscription_end_year?: number
  contacts?: Omit<PreRegistrationContact, 'id'>[]
}

export function isExpiringSoon(expiresAt: string | null): boolean {
  if (expiresAt === null) return false
  const expires = new Date(expiresAt).getTime()
  const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000
  return expires <= threeDaysFromNow
}
