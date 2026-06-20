import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { useSalesReport } from '@/hooks/useReports'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { DatePresetPicker, type DateRange } from '@/components/shared/DatePresetPicker'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { AppHeader } from '@/components/shared/AppHeader'
import { useLayout } from '@/hooks/useLayout'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { SalesReportItem } from '@/types/reports'
import type { OrderPaymentMethod } from '@/types/order'

const PAYMENT_OPTS = ['all', 'cash', 'gcash', 'wallet', 'subscription'] as const

export default function SalesReportScreen() {
  const { isTablet, isLandscape } = useLayout()
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [payment, setPayment]   = useState<string>('all')
  const [customer, setCustomer] = useState<string>('all')
  const [showDate, setShowDate] = useState(false)

  const params = {
    date_from: dateRange.from || undefined,
    date_to: dateRange.to || undefined,
    payment_method: payment === 'all' ? undefined : (payment as OrderPaymentMethod),
    customer_type: customer === 'all' ? undefined : (customer as any),
  }

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useSalesReport(params)
  const summary = data?.pages[0]?.summary
  const items = data?.pages.flatMap((p) => p.data) ?? []

  const numCols = isTablet || isLandscape ? 3 : 2

  const renderItem = useCallback(({ item }: { item: SalesReportItem }) => (
    <View style={[listCardStyle, styles.row]}>
      <View style={styles.left}>
        <Text variant="labelSmall" style={styles.receipt}>{item.receipt_number}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.student_name ?? 'Walk-in'} · {item.item_count} items</Text>
        <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d, h:mm a')}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge variant={item.payment_method} />
        <Text variant="titleSmall" style={styles.total}>{formatCurrency(item.total)}</Text>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      <AppHeader title="Sales Report" />
      {isLoading ? <SkeletonCard count={3} /> : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryGrid}>
              {[
                { label: 'Total Revenue', value: formatCurrency(summary.total_revenue), accent: palette.green500 },
                { label: 'Total Orders',  value: summary.total_orders, accent: palette.blue500 },
                { label: 'Avg Order',     value: formatCurrency(summary.avg_order_value) },
                { label: 'Discounts',     value: formatCurrency(summary.total_discounts), accent: palette.yellow500 },
                { label: 'Net Revenue',   value: formatCurrency(summary.net_revenue), accent: palette.green500 },
              ].reduce<React.ReactNode[][]>((rows, card, i) => {
                const ri = Math.floor(i / numCols)
                if (!rows[ri]) rows[ri] = []
                rows[ri].push(<SummaryCard key={card.label} label={card.label} value={card.value} accent={card.accent} />)
                return rows
              }, []).map((row, i) => <View key={i} style={styles.summaryRow}>{row}</View>)}
            </View>
          )}
          <FilterChipRow>
            <FilterChip label="Date" active={!!dateRange.from} onPress={() => setShowDate(true)} />
            {PAYMENT_OPTS.map((m) => <FilterChip key={m} label={m === 'all' ? 'All Methods' : m} active={payment === m} onPress={() => setPayment(m)} />)}
          </FilterChipRow>
          <FilterChipRow>
            {(['all', 'registered', 'walkin'] as const).map((c) => (
              <FilterChip key={c} label={c === 'all' ? 'All Customers' : c} active={customer === c} onPress={() => setCustomer(c)} />
            ))}
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="chart-bar" title="No sales data" />}
            ListFooterComponent={isFetchingNextPage ? <Text style={styles.meta}>Loading…</Text> : null}
          />
          <DatePresetPicker visible={showDate} value={dateRange} onConfirm={(r) => { setDateRange(r); setShowDate(false) }} onDismiss={() => setShowDate(false)} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  summaryGrid: { padding: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  receipt: { color: palette.zinc950, fontWeight: '600' },
  meta: { color: palette.zinc500 },
  total: { color: palette.zinc950, fontWeight: '700' },
})
