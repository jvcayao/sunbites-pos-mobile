import type { Branch } from "./auth";
import type { StudentType, SchoolMonth } from "./student";

export interface EnrollmentFormData {
  grade_levels: string[];
  branches: Branch[];
  school_months: SchoolMonth[];
}

export interface ContactPayload {
  full_name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: string;
  is_primary?: boolean;
}

export interface EnrollPayload {
  branch_id: number;
  student_type: StudentType;
  first_name: string;
  last_name: string;
  student_number?: string;
  grade_level: string;
  section?: string;
  birthday: string;
  allergies?: string;
  notes?: string;
  contacts: ContactPayload[];
  permission_meals: boolean;
  permission_allergies: boolean;
  signature: string;
  subscription_start_month?: SchoolMonth;
  subscription_start_year?: number;
  subscription_end_month?: SchoolMonth;
  subscription_end_year?: number;
}

export interface EnrolledStudentResponse {
  id: number;
  full_name: string;
  student_number: string;
  student_type: StudentType;
  enrollment_date: string;
  qr_code: string;
}
