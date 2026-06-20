import type { UserRole, Branch } from './auth'

export type { UserRole }

export interface StaffUser {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  roles: UserRole[]
  branches: Branch[]
  birthday: string | null
  gender: string | null
  civil_status: string | null
  phone: string | null
  position: string | null
  employment_type: string | null
  date_hired: string | null
  daily_rate: number | null
  is_active: boolean
}
