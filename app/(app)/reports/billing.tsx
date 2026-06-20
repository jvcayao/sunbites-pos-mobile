import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { useBillingReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { palette } from '@/theme'
import type { BillingReportItem } from '@/types/reports'

const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i)

export default function BillingReportScreen() {
  const [year, setYear]     = useState(new Date().getFullYear())
  const [month, setMonth]   = useState('all')
  const [status, setStatus] = useState('all')

  const params = { year, school_month: month === 'all' ? undefined : month, payment_status: status === 'all' ? undefined : status }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useBillingReport(params)
  const summary = (data?.pages[0] as any)?.summary
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: BillingReportItem }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.name}>{item.full_name}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.grade_level} · {item.school_month}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge variant={item.status} />
        <Text variant="titleSmall" style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      {isLoading ? <SkeletonCard count={3} /> : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryRow}>
              <SummaryCard label="Subscribers"  value={summary.total_subscribers}            />
              <SummaryCard label="Collected"    value={formatCurrency(summary.total_collected)} accent={palette.green500} />
              <SummaryCard label="Collection %" value={`${summary.collection_rate?.toFixed(1)}%`} accent={palette.blue500} />
            </View>
          )}
          <FilterChipRow>{YEARS.map((y) => <FilterChip key={y} label={String(y)} active={year === y} onPress={() => setYear(y)} />)}</FilterChipRow>
          <FilterChipRow>
            <FilterChip label="All Months" active={month === 'all'} onPress={() => setMonth('all')} />
            {SCHOOL_MONTHS.map((m) => <FilterChip key={m} label={m.slice(0,3)} active={month === m} onPress={() => setMonth(m)} />)}
          </FilterChipRow>
          <FilterChipRow>
            {(['all', 'paid', 'unpaid'] as const).map((s) => <FilterChip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />)}
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i: BillingReportItem) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="receipt" title="No billing data" />}
            ListFooterComponent={isFetchingNextPage ? <Text style={styles.meta}>Loading…</Text> : null}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 8 },
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  amount: { color: palette.zinc950, fontWeight: '700' },
})
