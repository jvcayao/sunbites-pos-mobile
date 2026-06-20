import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { palette } from '@/theme'
import type { PaymentHistoryEntry } from '@/types/reminder'

interface Props {
  entries: PaymentHistoryEntry[]
}

export function PaymentHistoryTable({ entries }: Props): React.JSX.Element {
  return (
    <View style={styles.table} testID="payment-history-table">
      <View style={styles.headerRow}>
        <Text variant="labelSmall" style={[styles.cell, styles.header, styles.monthCol]}>
          Month
        </Text>
        <Text variant="labelSmall" style={[styles.cell, styles.header, styles.amountCol]}>
          Amount
        </Text>
        <Text variant="labelSmall" style={[styles.cell, styles.header, styles.statusCol]}>
          Status
        </Text>
        <Text variant="labelSmall" style={[styles.cell, styles.header, styles.dateCol]}>
          Paid Date
        </Text>
      </View>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.dataRow}>
          <Text variant="bodySmall" style={[styles.cell, styles.monthCol]}>
            {entry.school_month}
          </Text>
          <Text variant="bodySmall" style={[styles.cell, styles.amountCol]}>
            {formatCurrency(entry.amount)}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.cell,
              styles.statusCol,
              entry.status === 'paid' ? styles.statusPaid : styles.statusUnpaid,
            ]}
          >
            {entry.status === 'paid' ? 'Paid' : 'Unpaid'}
          </Text>
          <Text variant="bodySmall" style={[styles.cell, styles.dateCol]}>
            {entry.paid_at !== null ? formatDate(entry.paid_at, 'MMM d') : '—'}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  table: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.zinc200, borderRadius: 8, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', backgroundColor: palette.zinc100, paddingVertical: 8 },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
  },
  cell: { paddingHorizontal: 12 },
  header: { color: palette.zinc500 },
  monthCol: { flex: 2 },
  amountCol: { flex: 2 },
  statusCol: { flex: 2 },
  dateCol: { flex: 2 },
  statusPaid: { color: palette.green500 },
  statusUnpaid: { color: palette.red500 },
})
