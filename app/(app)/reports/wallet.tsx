import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Banner, Text } from 'react-native-paper'
import { useWalletReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { DatePresetPicker, type DateRange } from '@/components/shared/DatePresetPicker'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { AppHeader } from '@/components/shared/AppHeader'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { WalletReportItem } from '@/types/reports'

export default function WalletReportScreen() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [showDate, setShowDate] = useState(false)

  const params = { date_from: dateRange.from || undefined, date_to: dateRange.to || undefined }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useWalletReport(params)
  const summary = (data?.pages[0] as any)?.summary
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: WalletReportItem }) => {
    const isLow = item.wallet_balance < 100
    return (
      <View style={[listCardStyle, styles.row]}>
        <View style={styles.left}>
          <Text variant="bodyMedium" style={styles.name}>{item.full_name}</Text>
          <Text variant="bodySmall" style={styles.meta}>{item.grade_level}</Text>
        </View>
        <View style={styles.right}>
          <Text variant="titleSmall" style={[styles.balance, isLow && styles.low]}>
            {formatCurrency(item.wallet_balance)}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>+{formatCurrency(item.total_credited)}</Text>
        </View>
      </View>
    )
  }, [])

  return (
    <View style={styles.container}>
      <AppHeader title="Wallet Report" />
      {isLoading ? <SkeletonCard count={3} /> : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryRow}>
              <SummaryCard label="Total Credits" value={formatCurrency(summary.total_credits)} accent={palette.green500} />
              <SummaryCard label="Total Debits"  value={formatCurrency(summary.total_debits)}  accent={palette.red500} />
            </View>
          )}
          {summary?.below_threshold_count > 0 && (
            <Banner visible actions={[]} icon="alert">
              {summary.below_threshold_count} student(s) have balance below ₱100
            </Banner>
          )}
          <FilterChipRow>
            <FilterChip label="Date Range" active={!!dateRange.from} onPress={() => setShowDate(true)} />
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i: WalletReportItem) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="wallet" title="No wallet data" />}
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
  summaryRow: { flexDirection: 'row', padding: 16, gap: 8 },
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 2 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  balance: { color: palette.zinc950, fontWeight: '700' },
  low: { color: palette.red500 },
})
