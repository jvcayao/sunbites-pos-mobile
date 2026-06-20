import { StyleSheet, View } from 'react-native'
import { Button, Checkbox, Chip, Surface, Text, TouchableRipple } from 'react-native-paper'
import { router } from 'expo-router'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { MonthPaymentBadge } from './MonthPaymentBadge'
import { palette } from '@/theme'
import type { Student } from '@/types/student'
import type { SchoolMonth } from '@/types/student'

const STATUS_COLOR: Record<string, string> = {
  enrolled:   palette.green500,
  paused:     palette.yellow500,
  unenrolled: palette.zinc500,
  banned:     palette.red500,
  graduated:  palette.blue500,
}

interface StudentCardProps {
  student: Student
  selected: boolean
  onSelect: () => void
  onTopUp: () => void
  onRemove: () => void
  onTogglePayment: (paymentId: number) => void
}

export function StudentCard({
  student,
  selected,
  onSelect,
  onTopUp,
  onRemove,
  onTogglePayment,
}: StudentCardProps) {
  const canTogglePayment = usePermission('enrollment') // admin/manager
  const primaryContact = (student.contacts ?? []).find((c) => c.is_primary)
  const statusColor = STATUS_COLOR[student.enrollment_status] ?? palette.zinc500

  return (
    <Surface style={[styles.card, selected && styles.cardSelected]} elevation={1}>
      <View style={styles.row}>
        <View style={styles.checkboxArea}>
          <Checkbox
            status={selected ? 'checked' : 'unchecked'}
            onPress={onSelect}
            color={palette.orange500}
          />
        </View>

        <TouchableRipple
          onPress={() => router.push(`/(app)/students/${student.id}`)}
          style={styles.content}
          accessibilityRole="button"
          accessibilityLabel={`View ${student.full_name}`}
        >
          <View>
            <View style={styles.headerRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{student.full_name[0]}</Text>
              </View>
              <View style={styles.nameArea}>
                <View style={styles.badgeRow}>
                  <Text variant="titleSmall" style={styles.name}>{student.full_name}</Text>
                  {(student.credit_balance ?? 0) > 0 && (
                    <Chip compact style={styles.creditChip} textStyle={styles.creditText}>
                      Credit: {formatCurrency(student.credit_balance)}
                    </Chip>
                  )}
                </View>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text variant="bodySmall" style={styles.meta}>{student.enrollment_status}</Text>
                  <Text variant="bodySmall" style={styles.meta}>· {student.student_type === 'subscription' ? 'Sub' : 'Non-Sub'}</Text>
                </View>
              </View>
            </View>

            <Text variant="bodySmall" style={styles.meta}>
              {student.grade_level}{student.section !== null ? ` · ${student.section}` : ''}{primaryContact !== undefined ? ` · ${primaryContact.full_name}` : ''}
            </Text>
            {student.enrollment_date !== null && (
              <Text variant="bodySmall" style={styles.meta}>
                Enrolled: {formatDate(student.enrollment_date)}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.wallet}>
              Wallet: {formatCurrency(student.wallet_balance ?? 0)} · {student.points ?? 0} pts
            </Text>

            {student.student_type === 'subscription' && (student.monthly_payments ?? []).length > 0 && (
              <View style={styles.monthsRow}>
                {(SCHOOL_MONTHS as readonly SchoolMonth[]).map((month) => {
                  const payment = student.monthly_payments.find((p) => p.school_month === month)
                  if (payment === undefined) return null
                  return (
                    <MonthPaymentBadge
                      key={month}
                      month={month}
                      status={payment.status}
                      canToggle={canTogglePayment}
                      onPress={() => onTogglePayment(payment.id)}
                    />
                  )
                })}
              </View>
            )}
          </View>
        </TouchableRipple>
      </View>

      <View style={styles.actions}>
        <Button
          compact
          mode="outlined"
          icon="pencil"
          onPress={() => router.push(`/(app)/students/${student.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${student.full_name}`}
        >
          Edit
        </Button>
        <Button
          compact
          mode="outlined"
          icon="wallet"
          onPress={onTopUp}
          accessibilityRole="button"
          accessibilityLabel={`Top up wallet for ${student.full_name}`}
        >
          Wallet
        </Button>
        <Button
          compact
          mode="text"
          textColor={palette.red500}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${student.full_name}`}
        >
          Remove
        </Button>
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: palette.white,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: palette.orange500,
  },
  row: { flexDirection: 'row' },
  checkboxArea: { paddingTop: 16, paddingLeft: 8 },
  content: { flex: 1, padding: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.orange100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: palette.orange500, fontWeight: '700', fontSize: 14 },
  nameArea: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  name: { color: palette.zinc950 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  meta: { color: palette.zinc500 },
  wallet: { color: palette.green500, marginTop: 4 },
  monthsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  creditChip: { backgroundColor: '#FEE2E2', height: 22 },
  creditText: { color: palette.red500, fontSize: 10 },
  actions: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
    gap: 8,
    flexWrap: 'wrap',
  },
})
