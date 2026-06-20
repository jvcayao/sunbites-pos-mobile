import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { FontFamily } from '@/theme/fonts'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'orange' | 'muted' | 'primary'

interface StatusBadgeProps {
  label: string
  variant: BadgeVariant
  size?: 'sm' | 'md'
}

const COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF9C3', text: '#854D0E' },
  error:   { bg: '#FEE2E2', text: '#991B1B' },
  info:    { bg: '#DBEAFE', text: '#1E40AF' },
  orange:  { bg: '#FFEDD5', text: '#9A3412' },
  muted:   { bg: '#F4F4F5', text: '#52525B' },
  primary: { bg: '#FEE2E2', text: '#B91C1C' },
}

export function StatusBadge({ label, variant, size = 'sm' }: StatusBadgeProps): React.JSX.Element {
  const { bg, text } = COLORS[variant]
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.label, { color: text }, size === 'md' && styles.labelMd]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 5 },
  label:   { fontFamily: FontFamily.sans.medium, fontSize: 11, lineHeight: 14 },
  labelMd: { fontSize: 13, lineHeight: 18 },
})
