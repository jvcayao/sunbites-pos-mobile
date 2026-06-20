import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useActivityLog } from '@/hooks/useReports'
import { formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { DatePresetPicker, type DateRange } from '@/components/shared/DatePresetPicker'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { palette } from '@/theme'
import type { ActivityItem } from '@/types/reports'

const CATEGORIES = ['all', 'auth', 'pos', 'students', 'wallet', 'payments', 'menu', 'inventory', 'users'] as const

export default function ActivityLogScreen() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [category, setCategory]  = useState('all')
  const [search, setSearch]      = useState('')
  const [expanded, setExpanded]  = useState<Set<number>>(new Set())
  const [showDate, setShowDate]  = useState(false)

  const params = { date_from: dateRange.from || undefined, date_to: dateRange.to || undefined, category: category === 'all' ? undefined : category, search: search || undefined }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityLog(params)
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const toggleExpand = (id: number) => setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  const renderItem = useCallback(({ item }: { item: ActivityItem }) => {
    const isExpanded = expanded.has(item.id)
    const props = Object.entries(item.properties ?? {})
    return (
      <Pressable onPress={() => toggleExpand(item.id)} style={styles.row} accessibilityRole="button" accessibilityLabel={item.subject} accessibilityState={{ expanded: isExpanded }}>
        <View style={styles.rowHeader}>
          <View style={styles.left}>
            <Text variant="bodyMedium" style={styles.subject}>{item.subject}</Text>
            <Text variant="bodySmall" style={styles.meta}>{item.user_name} · {formatDate(item.created_at, 'MMM d, h:mm a')}</Text>
          </View>
          <View style={styles.right}>
            <StatusBadge variant={item.category} />
            <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={palette.zinc500} accessibilityElementsHidden />
          </View>
        </View>
        {isExpanded && props.length > 0 && (
          <View style={styles.properties}>
            {props.map(([k, v]) => (
              <Text key={k} variant="bodySmall" style={styles.prop}>
                <Text style={styles.propKey}>{k}: </Text>
                {String(v)}
              </Text>
            ))}
          </View>
        )}
      </Pressable>
    )
  }, [expanded])

  return (
    <View style={styles.container}>
      {isLoading ? <SkeletonCard count={4} /> : (
        <>
          <TextInput mode="outlined" placeholder="Search activity…" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} accessibilityLabel="Search activity" />
          <FilterChipRow>
            <FilterChip label="Date" active={!!dateRange.from} onPress={() => setShowDate(true)} />
            {CATEGORIES.map((c) => <FilterChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />)}
          </FilterChipRow>
          <FlatList
            data={items}
            keyExtractor={(i: ActivityItem) => String(i.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
            onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={<EmptyState icon="history" title="No activity found" />}
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
  search: { marginHorizontal: 16, marginTop: 8, backgroundColor: palette.white },
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  rowHeader: { flexDirection: 'row', gap: 8 },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  subject: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  properties: { marginTop: 8, padding: 8, backgroundColor: palette.zinc100, borderRadius: 8 },
  prop: { color: palette.zinc900 ?? palette.zinc900, fontSize: 12 },
  propKey: { fontWeight: '700', color: palette.zinc950 },
})
