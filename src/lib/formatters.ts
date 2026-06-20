import { format, parseISO } from 'date-fns'

export function formatCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0
  return `₱ ${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(
  dateString: string,
  formatStr: string = 'MMM d, yyyy',
): string {
  try {
    return format(parseISO(dateString), formatStr)
  } catch {
    return dateString
  }
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('63') && digits.length === 12) {
    return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone
}
