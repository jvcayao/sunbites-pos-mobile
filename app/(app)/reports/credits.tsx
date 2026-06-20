import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { useCreditsReport } from '@/hooks/useReports'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { DatePresetPicker, type DateRange } from '@/components/shared/DatePresetPicker'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { palette } from '@/theme'
import type { CreditsReportItem } from '@/types/reports'

export default function CreditsReportScreen() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [type, setType]   = useState('all')
  const [search, setSearch] = useState('')
  const [showDate, setShowDate] = useState(false)

  const params = {
    date_from: dateRange.from || undefined,
    date_to: dateRange.to || undefined,
    type: type === 'all' ? undefined : type,
    search: search || undefined,
  }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useCreditsReport(params)
  const summary = (data?.pages[0] as any)?.summary
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: CreditsReportItem }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.name}>{item.full_name}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.grade_level} · {formatDate(item.created_at, 'MMM d')}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge variant={item.type} />
        <Text variant="titleSmall" style={item.type === 'settled' ? styles.settled : styles.charged}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      {isLoading ? <SkeletonCard count={3} /> : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryRow}>
              <SummaryCard label="Charged"     value={formatCurrency(summary.total_charged)}     accent={palette.red500} />
              <SummaryCard label="Settled"     value={formatCurrency(summary.total_settled)}     accent={palette.green500} />
              <SummaryCard label="Outstanding" value={formatCurrency(summary.net_outstanding)}   accent={palette.yellow500} />
            </View>
          )}
          <TextInput mode="outlined" placeholder="Search student…" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} accessibilityLabel="Search credits" />
          <FilterChipRow>
            <FilterChip label="Date" active={!!dateRange.from} onPress={() => setShowDate(true)} />
            {(['all', 'charged', 'settled', 'voided'] as const).map((t) => <FilterChip key={t} label={t} active={type === t} onPress={() => setType(t)} />)}
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i: CreditsReportItem) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="alert-circle" title="No credit records" />}
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
  search: { marginHorizontal: 16, marginTop: 8, backgroundColor: palette.white },
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  charged: { color: palette.red500, fontWeight: '700' },
  settled: { color: palette.green500, fontWeight: '700' },
})
