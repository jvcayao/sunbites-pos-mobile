import { Pressable, StyleSheet, View } from 'react-native'
import { Checkbox, Text } from 'react-native-paper'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { getTotalAmountDue, getAllStudents } from '@/types/reminder'
import { palette } from '@/theme'
import type { EligibleParent } from '@/types/reminder'

interface Props {
  parent: EligibleParent
  isSelected: boolean
  isForced?: boolean
  onPress: (id: number) => void
  onToggle: (id: number) => void
  onLongPress: (id: number) => void
}

export function EligibleParentRow({
  parent,
  isSelected,
  isForced = false,
  onPress,
  onToggle,
  onLongPress,
}: Props): React.JSX.Element {
  const allSent = parent.unpaid_periods.every((p) => p.was_sent)
  const isDisabled = allSent && !isForced
  const totalAmount = getTotalAmountDue(parent)
  const students = getAllStudents(parent)
  const lastSentAt = parent.unpaid_periods.find((p) => p.last_sent_at)?.last_sent_at ?? null

  return (
    <Pressable
      testID={`parent-row-${parent.id}`}
      onPress={() => onPress(parent.id)}
      onLongPress={() => onLongPress(parent.id)}
      style={[styles.row, allSent && styles.rowSent]}
      accessibilityRole="button"
      accessibilityLabel={`${parent.full_name}`}
    >
      <Checkbox.Android
        testID={`parent-checkbox-${parent.id}`}
        status={isSelected ? 'checked' : 'unchecked'}
        disabled={isDisabled}
        onPress={() => !isDisabled && onToggle(parent.id)}
      />

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text variant="labelLarge" style={[styles.name, allSent && styles.textMuted]}>
            {parent.full_name}
          </Text>
          {allSent && (
            <View testID={`sent-badge-${parent.id}`} style={styles.sentBadge}>
              <Text variant="labelSmall" style={styles.sentBadgeText}>
                Sent
              </Text>
            </View>
          )}
        </View>

        <Text variant="bodySmall" style={[styles.email, allSent && styles.textMuted]}>
          {parent.email}
        </Text>

        <Text variant="bodySmall" style={[styles.meta, allSent && styles.textMuted]}>
          {students.length} {students.length === 1 ? 'student' : 'students'} •{' '}
          {formatCurrency(totalAmount)}
        </Text>

        {allSent && lastSentAt !== null && (
          <Text variant="bodySmall" style={styles.sentDate}>
            Sent: {formatDate(lastSentAt, 'MMM d, yyyy')}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  rowSent: { backgroundColor: palette.zinc50 },
  body: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: palette.zinc900 },
  textMuted: { color: palette.zinc500 },
  email: { color: palette.zinc500, marginTop: 2 },
  meta: { color: palette.zinc500, marginTop: 2 },
  sentDate: { color: palette.zinc500, marginTop: 2 },
  sentBadge: {
    backgroundColor: palette.zinc200,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sentBadgeText: { color: palette.zinc900 },
})
