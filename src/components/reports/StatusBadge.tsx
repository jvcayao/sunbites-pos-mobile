import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

const BADGE_MAP: Record<string, { bg: string; text: string }> = {
  // Enrollment
  enrolled:   { bg: palette.green100,  text: palette.green500 },
  paused:     { bg: palette.yellow100, text: palette.yellow500 },
  unenrolled: { bg: palette.zinc100,   text: palette.zinc500 },
  banned:     { bg: '#FEE2E2',         text: palette.red500 },
  graduated:  { bg: palette.blue100,   text: palette.blue500 },
  // Payment method
  cash:         { bg: palette.green100,  text: palette.green500 },
  gcash:        { bg: palette.blue100,   text: palette.blue500 },
  wallet:       { bg: palette.orange100, text: palette.orange500 },
  subscription: { bg: '#F3E8FF',         text: '#A855F7' },
  // Inventory
  ok:   { bg: palette.green100,  text: palette.green500 },
  low:  { bg: palette.yellow100, text: palette.yellow500 },
  out:  { bg: '#FEE2E2',         text: palette.red500 },
  over: { bg: palette.blue100,   text: palette.blue500 },
  // Log types
  restock: { bg: palette.green100,  text: palette.green500 },
  sale:    { bg: palette.orange100, text: palette.orange500 },
  waste:   { bg: '#FEE2E2',         text: palette.red500 },
  manual:  { bg: palette.zinc100,   text: palette.zinc500 },
  // Credits
  charged:  { bg: '#FEE2E2',         text: palette.red500 },
  settled:  { bg: palette.green100,  text: palette.green500 },
  voided:   { bg: palette.zinc100,   text: palette.zinc500 },
  // Payment status
  paid:   { bg: palette.green100, text: palette.green500 },
  unpaid: { bg: '#FEF9C3',        text: '#854D0E' },
  // Order status
  completed: { bg: palette.green100, text: palette.green500 },
  voided_order: { bg: '#FEE2E2',     text: palette.red500 },
}

interface StatusBadgeProps {
  variant: string
}

export function StatusBadge({ variant }: StatusBadgeProps) {
  const style = BADGE_MAP[variant.toLowerCase()] ?? { bg: palette.zinc100, text: palette.zinc500 }
  return (
    <Text
      variant="labelSmall"
      style={[styles.badge, { backgroundColor: style.bg, color: style.text }]}
    >
      {variant}
    </Text>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    textTransform: 'capitalize',
  },
})
