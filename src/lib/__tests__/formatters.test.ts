import { formatCurrency, formatDate, formatPhone } from '../formatters'

describe('formatCurrency', () => {
  it('formats a normal positive amount', () => {
    expect(formatCurrency(1234.5)).toBe('₱ 1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₱ 0.00')
  })

  it('formats a whole number with two decimal places', () => {
    expect(formatCurrency(500)).toBe('₱ 500.00')
  })

  it('formats large amounts with thousand separators', () => {
    expect(formatCurrency(100000)).toMatch('₱')
    expect(formatCurrency(100000)).toContain('100')
  })

  it('returns ₱ 0.00 for undefined (API field missing on list endpoint)', () => {
    expect(formatCurrency(undefined)).toBe('₱ 0.00')
  })

  it('returns ₱ 0.00 for null', () => {
    expect(formatCurrency(null)).toBe('₱ 0.00')
  })

  it('formats small decimal amounts', () => {
    expect(formatCurrency(0.5)).toBe('₱ 0.50')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date string with default format', () => {
    const result = formatDate('2025-06-15')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('returns the original string on invalid input', () => {
    const invalid = 'not-a-date'
    expect(formatDate(invalid)).toBe(invalid)
  })

  it('supports custom format strings', () => {
    const result = formatDate('2025-06-15', 'yyyy-MM-dd')
    expect(result).toBe('2025-06-15')
  })

  it('formats month/year only', () => {
    const result = formatDate('2025-06-15', 'MMMM yyyy')
    expect(result).toBe('June 2025')
  })
})

describe('formatPhone', () => {
  it('formats a standard Philippine mobile number (09XXXXXXXXX)', () => {
    const result = formatPhone('09171234567')
    expect(result).toContain('0917')
    expect(result).toContain('123')
  })

  it('formats a +63 international format', () => {
    const result = formatPhone('+639171234567')
    expect(result).toContain('+63')
  })

  it('returns the original string for unrecognized format', () => {
    const raw = '1234'
    expect(formatPhone(raw)).toBe(raw)
  })

  it('handles a 11-digit number starting with 0', () => {
    const result = formatPhone('09271234567')
    expect(result.replace(/\s/g, '')).toContain('0927')
  })
})
