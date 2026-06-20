export interface EligibleParentPeriod {
  school_month: string;
  year: number;
  was_sent: boolean;
  last_sent_at: string | null;
  send_count: number;
  total_amount: number;
  students: { id: number; full_name: string }[];
}

export interface EligibleParent {
  id: number;
  full_name: string;
  email: string;
  total_send_count: number;
  has_overdue: boolean;
  unpaid_periods: EligibleParentPeriod[];
}

export interface SendRemindersResponse {
  sent: number;
  skipped: number;
  skipped_names: string[];
}

export interface PaymentHistoryEntry {
  id: number;
  school_month: string;
  school_year: number;
  amount: number;
  status: "paid" | "unpaid";
  paid_at: string | null;
}

export interface ReminderParentStudent {
  id: number;
  full_name: string;
  grade_level: string;
  payment_history: PaymentHistoryEntry[];
}

export interface ReminderParentDetail {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  students: ReminderParentStudent[];
}

export function getTotalAmountDue(parent: EligibleParent): number {
  return parent.unpaid_periods.reduce((sum, p) => sum + p.total_amount, 0);
}

export function getAllStudents(
  parent: EligibleParent,
): { id: number; full_name: string }[] {
  const seen = new Set<number>();
  const result: { id: number; full_name: string }[] = [];
  for (const period of parent.unpaid_periods) {
    for (const student of period.students) {
      if (!seen.has(student.id)) {
        seen.add(student.id);
        result.push(student);
      }
    }
  }
  return result;
}
