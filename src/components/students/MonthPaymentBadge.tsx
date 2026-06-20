import { StyleSheet } from 'react-native'
import { TouchableRipple, Text } from 'react-native-paper'
import { palette } from '@/theme'
import type { PaymentStatus, SchoolMonth } from '@/types/student'

const MONTH_ABBR: Record<SchoolMonth, string> = {
  june: 'Jun', july: 'Jul', august: 'Aug', september: 'Sep',
  october: 'Oct', november: 'Nov', december: 'Dec',
  january: 'Jan', february: 'Feb', march: 'Mar',
}

interface MonthPaymentBadgeProps {
  month: SchoolMonth
  status: PaymentStatus
  canToggle: boolean
  onPress?: () => void
}

export function MonthPaymentBadge({ month, status, canToggle, onPress }: MonthPaymentBadgeProps) {
  const isPaid = status === 'paid'
  return (
    <TouchableRipple
      onPress={canToggle ? onPress : undefined}
      disabled={!canToggle}
      borderless
      style={[styles.badge, isPaid ? styles.paid : styles.unpaid]}
      accessibilityRole={canToggle ? 'button' : undefined}
      accessibilityLabel={`${MONTH_ABBR[month]}: ${status}`}
      accessibilityState={canToggle ? { selected: isPaid } : undefined}
    >
      <Text variant="labelSmall" style={isPaid ? styles.paidText : styles.unpaidText}>
        {MONTH_ABBR[month]}
      </Text>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 36,
    alignItems: 'center',
    minHeight: 28,
    justifyContent: 'center',
  },
  paid: { backgroundColor: palette.green100 },
  unpaid: { backgroundColor: palette.zinc100 },
  paidText: { color: palette.green500, fontWeight: '700' },
  unpaidText: { color: palette.zinc500 },
})
