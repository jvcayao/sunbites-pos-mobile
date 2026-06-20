import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Divider, Text } from 'react-native-paper'
import { usePosInventory, useAdjustStock } from '@/hooks/usePos'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { StockAdjustSheet } from '@/components/pos/StockAdjustSheet'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import { Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StockAdjustDto, PosInventoryItem } from '@/types/pos'

export function PosInventoryTab() {
  const toast = useToast()
  const { data, isLoading, refetch, isRefetching } = usePosInventory()
  const { mutate: adjustStock, isPending } = useAdjustStock()

  const [adjustTarget, setAdjustTarget] = useState<PosInventoryItem | null>(null)

  const items: PosInventoryItem[] = Array.isArray(data) ? data : (data as any)?.data ?? []

  const handleAdjust = (dto: StockAdjustDto): void => {
    if (adjustTarget === null) return
    adjustStock(
      { id: adjustTarget.id, data: dto },
      {
        onSuccess: () => {
          toast.success('Stock adjusted')
          setAdjustTarget(null)
        },
        onError: (err) => toast.error(getApiError(err)),
      },
    )
  }

  const renderItem = useCallback(({ item }: { item: PosInventoryItem }) => (
    <View style={[listCardStyle, styles.row]}>
      <View style={styles.info}>
        <Text variant="bodyMedium" style={styles.name}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Text variant="titleSmall" style={styles.qty}>
            {item.quantity} {item.unit}
          </Text>
          <StatusBadge variant={item.status.toLowerCase()} />
        </View>
      </View>
      <Pressable
        onPress={() => setAdjustTarget(item)}
        style={styles.adjustBtn}
        accessibilityRole="button"
        accessibilityLabel={`Adjust stock for ${item.name}`}
      >
        <MaterialCommunityIcons
          name="package-variant"
          size={18}
          color={palette.orange500}
          accessibilityElementsHidden
        />
        <Text variant="labelSmall" style={styles.adjustLabel}>Adjust</Text>
      </Pressable>
    </View>
  ), [])

  const keyExtractor = useCallback((item: PosInventoryItem) => String(item.id), [])

  if (isLoading) return <SkeletonCard count={6} />

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.orange500}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant-closed"
            title="No inventory items"
            subtitle="Items linked to menu items appear here"
          />
        }
        removeClippedSubviews
        maxToRenderPerBatch={15}
      />

      {adjustTarget !== null && (
        <StockAdjustSheet
          visible
          itemName={adjustTarget.name}
          currentQuantity={adjustTarget.quantity}
          loading={isPending}
          onConfirm={handleAdjust}
          onDismiss={() => setAdjustTarget(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    gap: 12,
  },
  info: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  name: { color: palette.zinc950 },
  qty: { color: palette.zinc950, fontWeight: '600' },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.orange500,
    minHeight: 44,
    minWidth: 80,
    justifyContent: 'center',
  },
  adjustLabel: { color: palette.orange500 },
})
