import { StyleSheet, View } from 'react-native'
import { Text, TouchableRipple } from 'react-native-paper'
import { palette } from '@/theme'
import type { StaffMember, StaffStatus } from '@/types/dashboard'

const STATUS_STYLE: Record<StaffStatus, { bg: string; text: string }> = {
  Working:   { bg: palette.green100,  text: palette.green500 },
  Off:       { bg: palette.zinc100,   text: palette.zinc500 },
  OnLeave:   { bg: palette.blue100,   text: palette.blue500 },
  Emergency: { bg: '#FEE2E2',         text: palette.red500 },
  OnBreak:   { bg: palette.yellow100, text: palette.yellow500 },
}

const STATUS_LABEL: Record<StaffStatus, string> = {
  Working:   'Working',
  Off:       'Off',
  OnLeave:   'On Leave',
  Emergency: 'Emergency',
  OnBreak:   'On Break',
}

interface StaffRowProps {
  staff: StaffMember
  onStatusPress: (staff: StaffMember) => void
}

export function StaffRow({ staff, onStatusPress }: StaffRowProps) {
  const badge = STATUS_STYLE[staff.status]
  const roleLabel = staff.roles[0] ?? ''

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text variant="bodyMedium" style={styles.name}>{staff.full_name}</Text>
        <Text variant="bodySmall" style={styles.role}>{roleLabel}</Text>
      </View>
      <TouchableRipple
        onPress={() => onStatusPress(staff)}
        borderless
        style={[styles.badge, { backgroundColor: badge.bg }]}
        accessibilityRole="button"
        accessibilityLabel={`Change status for ${staff.full_name}, currently ${STATUS_LABEL[staff.status]}`}
      >
        <Text variant="labelSmall" style={{ color: badge.text }}>
          {STATUS_LABEL[staff.status]}
        </Text>
      </TouchableRipple>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  info: { flex: 1 },
  name: { color: palette.zinc950 },
  role: { color: palette.zinc500, marginTop: 2, textTransform: 'capitalize' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
