import { Share, StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native'
import { Appbar, DataTable, Surface, Text } from 'react-native-paper'
import { format } from 'date-fns'
import { useDailySummary } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/formatters'
import { DatePresetPicker, type DateRange } from '@/components/shared/DatePresetPicker'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { palette } from '@/theme'
import { useState } from 'react'

export default function DailySummaryScreen() {
  const [showDate, setShowDate] = useState(false)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data, isLoading } = useDailySummary(date)
  const summary = data as any

  const handleShare = async (): Promise<void> => {
    if (summary === undefined) return
    const lines = [
      `Daily Summary — ${date}`,
      `Total Orders: ${summary.total_orders}`,
      '',
      'Payment Breakdown:',
      ...(summary.by_payment_method ?? []).map((r: any) => `  ${r.method}: ${r.count} orders, ${formatCurrency(r.amount)}`),
      '',
      'By Cashier:',
      ...(summary.by_cashier ?? []).map((r: any) => `  ${r.name}: ${r.orders} orders, ${formatCurrency(r.amount)}`),
    ].join('\n')
    await Share.share({ message: lines, title: `Daily Summary ${date}` })
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={`Summary: ${date}`} />
        <Appbar.Action icon="calendar" onPress={() => setShowDate(true)} accessibilityLabel="Select date" />
        <Appbar.Action icon="share-variant" onPress={handleShare} accessibilityLabel="Share summary" />
      </Appbar.Header>

      {isLoading ? <SkeletonCard count={3} /> : summary === undefined ? <EmptyState icon="calendar-today" title="No data for this date" /> : (
        <ScrollView>
          <View style={styles.totalRow}>
            <SummaryCard label="Total Orders" value={summary.total_orders} accent={palette.orange500} />
          </View>
          {(summary.by_payment_method?.length ?? 0) > 0 && (
            <Surface style={styles.section} elevation={1}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Payment Breakdown</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Method</DataTable.Title>
                  <DataTable.Title numeric>Count</DataTable.Title>
                  <DataTable.Title numeric>Amount</DataTable.Title>
                </DataTable.Header>
                {(summary.by_payment_method ?? []).map((r: any) => (
                  <DataTable.Row key={r.method}>
                    <DataTable.Cell>{r.method}</DataTable.Cell>
                    <DataTable.Cell numeric>{r.count}</DataTable.Cell>
                    <DataTable.Cell numeric>{formatCurrency(r.amount)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Surface>
          )}
          {(summary.by_cashier?.length ?? 0) > 0 && (
            <Surface style={styles.section} elevation={1}>
              <Text variant="titleSmall" style={styles.sectionTitle}>By Cashier</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Cashier</DataTable.Title>
                  <DataTable.Title numeric>Orders</DataTable.Title>
                  <DataTable.Title numeric>Amount</DataTable.Title>
                </DataTable.Header>
                {(summary.by_cashier ?? []).map((r: any) => (
                  <DataTable.Row key={r.name}>
                    <DataTable.Cell>{r.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{r.orders}</DataTable.Cell>
                    <DataTable.Cell numeric>{formatCurrency(r.amount)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Surface>
          )}
          {(summary.items_sold?.length ?? 0) > 0 && (
            <Surface style={styles.section} elevation={1}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Items Sold</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Item</DataTable.Title>
                  <DataTable.Title numeric>Qty</DataTable.Title>
                  <DataTable.Title numeric>Revenue</DataTable.Title>
                </DataTable.Header>
                {(summary.items_sold ?? []).map((r: any) => (
                  <DataTable.Row key={r.name}>
                    <DataTable.Cell>{r.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{r.qty}</DataTable.Cell>
                    <DataTable.Cell numeric>{formatCurrency(r.revenue)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Surface>
          )}
        </ScrollView>
      )}

      <DatePresetPicker
        visible={showDate}
        value={{ from: date, to: date }}
        onConfirm={(r) => { setDate(r.from || date); setShowDate(false) }}
        onDismiss={() => setShowDate(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  totalRow: { padding: 16 },
  section: { margin: 16, borderRadius: 12, backgroundColor: palette.white, overflow: 'hidden' },
  sectionTitle: { padding: 16, fontWeight: '700', color: palette.zinc950 },
})
