import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { useStudentsReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { palette } from '@/theme'
import { GRADE_LEVELS } from '@/lib/constants'
import type { StudentsReportItem } from '@/types/reports'

export default function StudentsReportScreen() {
  const [status, setStatus] = useState('all')
  const [grade, setGrade]   = useState('all')
  const [type, setType]     = useState('all')

  const params = {
    enrollment_status: status === 'all' ? undefined : status,
    grade_level:       grade  === 'all' ? undefined : grade,
    student_type:      type   === 'all' ? undefined : type,
  }

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useStudentsReport(params)
  const summary = (data?.pages[0] as any)?.summary
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: StudentsReportItem }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.name}>{item.full_name}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.student_number} · {item.grade_level}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge variant={item.enrollment_status} />
        <Text variant="bodySmall" style={styles.meta}>{formatCurrency(item.wallet_balance)}</Text>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      {isLoading ? <SkeletonCard count={3} /> : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryRow}>
              <SummaryCard label="Enrolled" value={summary.total_enrolled ?? 0} accent={palette.green500} />
            </View>
          )}
          <FilterChipRow>
            {(['all', 'enrolled', 'paused', 'unenrolled', 'banned', 'graduated'] as const).map((s) => (
              <FilterChip key={s} label={s === 'all' ? 'All Status' : s} active={status === s} onPress={() => setStatus(s)} />
            ))}
          </FilterChipRow>
          <FilterChipRow>
            {(['all', 'subscription', 'non_subscription'] as const).map((t) => (
              <FilterChip key={t} label={t === 'all' ? 'All Types' : t} active={type === t} onPress={() => setType(t)} />
            ))}
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i: StudentsReportItem) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="account-group-outline" title="No students found" />}
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
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
    backgroundColor: palette.white,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
})
