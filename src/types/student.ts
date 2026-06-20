export type StudentType = 'subscription' | 'non_subscription'

export type EnrollmentStatus = 'enrolled' | 'paused' | 'unenrolled' | 'banned' | 'graduated'

export type SchoolMonth =
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december'
  | 'january'
  | 'february'
  | 'march'

export type PaymentStatus = 'paid' | 'unpaid'

export type PortalStatus = 'Activated' | 'Pending Activation' | 'No Email'

export interface StudentContact {
  id: number
  full_name: string
  relationship: string
  phone: string
  address: string
  email: string | null
  is_primary: boolean
  portal_status: PortalStatus
}

export interface MonthlyPayment {
  id: number
  school_month: SchoolMonth
  amount: number
  status: PaymentStatus
  recorded_at: string | null
}

export interface Student {
  id: number
  branch_id: number
  student_number: string
  first_name: string
  last_name: string
  full_name: string
  grade_level: string
  section: string | null
  birthday: string | null
  has_photo: boolean
  allergies: string | null
  notes: string | null
  qr_code: string
  student_type: StudentType
  enrollment_status: EnrollmentStatus
  enrollment_date: string | null
  points: number
  total_spent: number
  credit_balance: number
  wallet_balance: number
  contacts: StudentContact[]
  monthly_payments: MonthlyPayment[]
}

export interface StudentListParams {
  page?: number
  per_page?: number
  search?: string
  grade_level?: string
  enrollment_status?: EnrollmentStatus | 'all'
  student_type?: StudentType | 'all'
  month?: SchoolMonth | 'all'
  payment_status?: PaymentStatus | 'all'
}

export interface UpdateStudentDto {
  first_name?: string
  last_name?: string
  grade_level?: string
  section?: string
  birthday?: string
  allergies?: string
  notes?: string
}

export interface TopUpDto {
  amount: number
  payment_method: 'cash' | 'gcash' | 'bank_transfer'
  reference_number?: string
  note?: string
}

export interface SubscriptionRangeDto {
  subscription_start_month: SchoolMonth
  subscription_start_year: number
  subscription_end_month: SchoolMonth
  subscription_end_year: number
}

export interface ContactDto {
  full_name: string
  relationship: string
  phone: string
  email?: string
  address: string
  is_primary?: boolean
}

export interface WalletTransaction {
  id: number
  created_at: string
  type: string
  amount: number
  note?: string
}

export interface StudentActivity {
  id: number
  created_at: string
  causer_name: string
  description: string
}

export interface PosStudent {
  id: number
  full_name: string
  student_number: string
  grade_level: string
  wallet_balance: number
  credit_balance: number
  enrollment_status?: EnrollmentStatus
}
