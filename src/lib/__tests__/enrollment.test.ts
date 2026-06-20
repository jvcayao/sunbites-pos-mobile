import { contactSchema, enrollSchema } from '../schemas/enrollment'

// ── contactSchema ─────────────────────────────────────────────────────────────

describe('contactSchema — phone validation', () => {
  const base = {
    full_name: 'Ana Santos',
    relationship: 'Mother' as const,
    address: '123 Rizal St',
  }

  it('accepts standard 09XXXXXXXXX format', () => {
    const result = contactSchema.safeParse({ ...base, phone: '09171234567' })
    expect(result.success).toBe(true)
  })

  it('accepts +639XXXXXXXXX international format', () => {
    const result = contactSchema.safeParse({ ...base, phone: '+639171234567' })
    expect(result.success).toBe(true)
  })

  it('rejects a number missing the leading 0', () => {
    const result = contactSchema.safeParse({ ...base, phone: '9171234567' })
    expect(result.success).toBe(false)
  })

  it('rejects a number that is too short', () => {
    const result = contactSchema.safeParse({ ...base, phone: '0917123' })
    expect(result.success).toBe(false)
  })

  it('rejects a plain landline number', () => {
    const result = contactSchema.safeParse({ ...base, phone: '028123456' })
    expect(result.success).toBe(false)
  })

  it('accepts optional empty email', () => {
    const result = contactSchema.safeParse({ ...base, phone: '09171234567', email: '' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = contactSchema.safeParse({ ...base, phone: '09171234567', email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})

// ── enrollSchema — birthday validation ───────────────────────────────────────

describe('enrollSchema — birthday validation', () => {
  const validBase = {
    branch_id: 1,
    student_type: 'non_subscription' as const,
    first_name: 'Maria',
    last_name: 'Santos',
    grade_level: 'Grade 3',
    contacts: [{ full_name: 'Ana Santos', relationship: 'Mother', phone: '09171234567', address: '123 Rizal St' }],
    permission_meals: true as const,
    permission_allergies: true as const,
    signature: 'Ana Santos',
  }

  it('rejects non-YYYY-MM-DD format', () => {
    const result = enrollSchema.safeParse({ ...validBase, birthday: '06/15/2018' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message)
      expect(msgs.some((m) => m.includes('YYYY-MM-DD'))).toBe(true)
    }
  })

  it('rejects an invalid date (month 13)', () => {
    const result = enrollSchema.safeParse({ ...validBase, birthday: '2018-13-01' })
    expect(result.success).toBe(false)
  })

  it('rejects a student older than 20 years', () => {
    const result = enrollSchema.safeParse({ ...validBase, birthday: '1980-01-01' })
    expect(result.success).toBe(false)
  })

  it('rejects a student younger than 2 years (future-ish date)', () => {
    const tooYoung = new Date()
    tooYoung.setMonth(tooYoung.getMonth() - 6)
    const birthday = tooYoung.toISOString().split('T')[0]
    const result = enrollSchema.safeParse({ ...validBase, birthday })
    expect(result.success).toBe(false)
  })
})

// ── enrollSchema — contacts validation ───────────────────────────────────────

describe('enrollSchema — contacts array', () => {
  const validBirthday = '2015-06-15'
  const validBase = {
    branch_id: 1,
    student_type: 'non_subscription' as const,
    first_name: 'Maria',
    last_name: 'Santos',
    grade_level: 'Grade 3',
    birthday: validBirthday,
    permission_meals: true as const,
    permission_allergies: true as const,
    signature: 'Ana Santos',
  }
  const oneContact = [{ full_name: 'Ana Santos', relationship: 'Mother', phone: '09171234567', address: '123 Rizal St' }]

  it('accepts exactly 1 contact', () => {
    const result = enrollSchema.safeParse({ ...validBase, contacts: oneContact })
    expect(result.success).toBe(true)
  })

  it('accepts 3 contacts', () => {
    const three = Array(3).fill(oneContact[0])
    const result = enrollSchema.safeParse({ ...validBase, contacts: three })
    expect(result.success).toBe(true)
  })

  it('rejects 0 contacts', () => {
    const result = enrollSchema.safeParse({ ...validBase, contacts: [] })
    expect(result.success).toBe(false)
  })

  it('rejects 4 contacts', () => {
    const four = Array(4).fill(oneContact[0])
    const result = enrollSchema.safeParse({ ...validBase, contacts: four })
    expect(result.success).toBe(false)
  })
})

// ── enrollSchema — subscription conditional fields ────────────────────────────

describe('enrollSchema — subscription conditional fields', () => {
  const validBirthday = '2015-06-15'
  const contact = [{ full_name: 'Ana Santos', relationship: 'Mother', phone: '09171234567', address: '123 Rizal St' }]
  const base = {
    branch_id: 1,
    first_name: 'Maria',
    last_name: 'Santos',
    grade_level: 'Grade 3',
    birthday: validBirthday,
    contacts: contact,
    permission_meals: true as const,
    permission_allergies: true as const,
    signature: 'Ana Santos',
  }

  it('requires subscription period fields when student_type is subscription', () => {
    const result = enrollSchema.safeParse({ ...base, student_type: 'subscription' })
    expect(result.success).toBe(false)
  })

  it('accepts subscription type with all period fields provided', () => {
    const result = enrollSchema.safeParse({
      ...base,
      student_type: 'subscription',
      subscription_start_month: 'june',
      subscription_start_year: 2025,
      subscription_end_month: 'march',
      subscription_end_year: 2026,
    })
    expect(result.success).toBe(true)
  })

  it('does not require subscription fields for non_subscription type', () => {
    const result = enrollSchema.safeParse({ ...base, student_type: 'non_subscription' })
    expect(result.success).toBe(true)
  })
})

// ── enrollSchema — permissions ────────────────────────────────────────────────

describe('enrollSchema — permission checkboxes', () => {
  const validBirthday = '2015-06-15'
  const contact = [{ full_name: 'Ana Santos', relationship: 'Mother', phone: '09171234567', address: '123 Rizal St' }]
  const base = {
    branch_id: 1,
    student_type: 'non_subscription' as const,
    first_name: 'Maria',
    last_name: 'Santos',
    grade_level: 'Grade 3',
    birthday: validBirthday,
    contacts: contact,
    signature: 'Ana Santos',
  }

  it('rejects when permission_meals is false', () => {
    const result = enrollSchema.safeParse({ ...base, permission_meals: false, permission_allergies: true })
    expect(result.success).toBe(false)
  })

  it('rejects when permission_allergies is false', () => {
    const result = enrollSchema.safeParse({ ...base, permission_meals: true, permission_allergies: false })
    expect(result.success).toBe(false)
  })

  it('accepts when both permissions are true', () => {
    const result = enrollSchema.safeParse({ ...base, permission_meals: true as const, permission_allergies: true as const })
    expect(result.success).toBe(true)
  })
})
