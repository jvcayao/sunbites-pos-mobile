import {
  getTotalAmountDue,
  getAllStudents,
} from '../reminder'
import type {
  EligibleParent,
  EligibleParentPeriod,
  PaymentHistoryEntry,
  ReminderParentDetail,
} from '../reminder'

const makePeriod = (overrides: Partial<EligibleParentPeriod> = {}): EligibleParentPeriod => ({
  school_month: 'June',
  year: 2026,
  was_sent: false,
  last_sent_at: null,
  send_count: 0,
  total_amount: 810,
  students: [{ id: 1, full_name: 'Ana Santos' }],
  ...overrides,
})

const makeParent = (overrides: Partial<EligibleParent> = {}): EligibleParent => ({
  id: 1,
  full_name: 'Maria Santos',
  email: 'maria@example.com',
  total_send_count: 0,
  has_overdue: false,
  unpaid_periods: [makePeriod()],
  ...overrides,
})

describe('getTotalAmountDue', () => {
  it('sums total_amount across all unpaid periods', () => {
    const parent = makeParent({
      unpaid_periods: [makePeriod({ total_amount: 810 }), makePeriod({ total_amount: 900 })],
    })
    expect(getTotalAmountDue(parent)).toBe(1710)
  })

  it('returns 0 when unpaid_periods is empty', () => {
    const parent = makeParent({ unpaid_periods: [] })
    expect(getTotalAmountDue(parent)).toBe(0)
  })

  it('returns the single period amount when only one period', () => {
    const parent = makeParent({ unpaid_periods: [makePeriod({ total_amount: 1620 })] })
    expect(getTotalAmountDue(parent)).toBe(1620)
  })
})

describe('getAllStudents', () => {
  it('returns deduplicated students across all periods', () => {
    const student1 = { id: 1, full_name: 'Ana Santos' }
    const student2 = { id: 2, full_name: 'Ben Santos' }
    const parent = makeParent({
      unpaid_periods: [
        makePeriod({ students: [student1] }),
        makePeriod({ students: [student1, student2] }),
      ],
    })
    const result = getAllStudents(parent)
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.id)).toEqual(expect.arrayContaining([1, 2]))
  })

  it('returns empty array when no periods', () => {
    const parent = makeParent({ unpaid_periods: [] })
    expect(getAllStudents(parent)).toEqual([])
  })
})

// Type shape smoke tests — compile-time validation via assignment
const _parentShape: EligibleParent = {
  id: 1,
  full_name: 'Test Parent',
  email: 'test@example.com',
  total_send_count: 0,
  has_overdue: false,
  unpaid_periods: [],
}

const _periodShape: EligibleParentPeriod = {
  school_month: 'June',
  year: 2026,
  was_sent: false,
  last_sent_at: null,
  send_count: 0,
  total_amount: 810,
  students: [],
}

const _paymentEntry: PaymentHistoryEntry = {
  id: 1,
  school_month: 'June',
  school_year: 2026,
  amount: 810,
  status: 'unpaid',
  paid_at: null,
}

const _parentDetail: ReminderParentDetail = {
  id: 1,
  full_name: 'Maria Santos',
  email: 'maria@example.com',
  phone: null,
  students: [],
}

// Suppress unused variable warnings
void _parentShape
void _periodShape
void _paymentEntry
void _parentDetail
