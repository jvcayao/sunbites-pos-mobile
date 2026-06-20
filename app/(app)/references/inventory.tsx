import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Appbar, FAB, SegmentedButtons, Text, TextInput } from 'react-native-paper'
import {
  useInventoryList, useInventoryHistory,
  useCreateInventoryItem, useUpdateInventoryItem,
  useDeleteInventoryItem, useArchiveInventoryItem,
} from '@/hooks/useReferences'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { palette } from '@/theme'

export default function InventoryScreen() {
  const toast = useToast()
  const [view, setView] = useState<'list' | 'history'>('list')
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', restock_threshold: '' })

  const { data: items, isLoading, refetch, isRefetching } = useInventoryList()
  const { data: history } = useInventoryHistory()
  const { mutate: createItem, isPending: isCreating } = useCreateInventoryItem()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem()
  const { mutate: archiveItem, isPending: isArchiving } = useArchiveInventoryItem()

  const active   = (Array.isArray(items) ? items : (items as any)?.data ?? []).filter((i: any) => !i.is_archived)
  const archived = (Array.isArray(items) ? items : (items as any)?.data ?? []).filter((i: any) => i.is_archived)
  const historyList = Array.isArray(history) ? history : (history as any)?.data ?? []

  const handleCreate = (): void => {
    const payload = { name: form.name, unit: form.unit, quantity: Number(form.quantity), restock_threshold: Number(form.restock_threshold) }
    createItem(payload, {
      onSuccess: () => { toast.success('Item created'); setShowAdd(false); setForm({ name: '', unit: '', quantity: '', restock_threshold: '' }) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    if (!deleteTarget) return
    const hasLogs = deleteTarget.has_logs
    if (hasLogs) {
      archiveItem(deleteTarget.id, {
        onSuccess: () => { toast.success('Item archived'); setDeleteTarget(null) },
        onError: (err) => toast.error(getApiError(err)),
      })
    } else {
      deleteItem(deleteTarget.id, {
        onSuccess: () => { toast.success('Item deleted'); setDeleteTarget(null) },
        onError: (err) => toast.error(getApiError(err)),
      })
    }
  }

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.name}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.quantity} {item.unit} · threshold: {item.restock_threshold}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge variant={item.status?.toLowerCase() ?? 'ok'} />
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      <SegmentedButtons value={view} onValueChange={(v) => setView(v as any)} buttons={[{ value: 'list', label: 'Inventory' }, { value: 'history', label: 'History' }]} style={styles.tabs} />
      {view === 'list' && (
        <>
          {isLoading ? <SkeletonCard count={4} /> : (
            <FlatList
              data={active}
              keyExtractor={(i: any) => String(i.id)}
              renderItem={renderItem}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
              ListEmptyComponent={<EmptyState icon="package-variant-closed" title="No inventory items" />}
              ListFooterComponent={archived.length > 0 ? (
                <View style={styles.archivedSection}>
                  <Text variant="labelMedium" style={styles.archivedLabel}>Archived ({archived.length})</Text>
                  {archived.map((item: any) => (
                    <Text key={item.id} variant="bodySmall" style={styles.meta}>{item.name}</Text>
                  ))}
                </View>
              ) : null}
            />
          )}
          <FAB icon="plus" style={styles.fab} onPress={() => setShowAdd(true)} accessibilityLabel="Add inventory item" />
        </>
      )}
      {view === 'history' && (
        <FlatList
          data={historyList}
          keyExtractor={(i: any) => String(i.id)}
          renderItem={({ item }: { item: any }) => (
            <View style={styles.row}>
              <View style={styles.left}>
                <Text variant="bodyMedium" style={styles.name}>{item.item_name}</Text>
                <Text variant="bodySmall" style={styles.meta}>{item.adjusted_by}</Text>
              </View>
              <View style={styles.right}>
                <StatusBadge variant={item.type} />
                <Text variant="bodySmall" style={item.quantity_change >= 0 ? styles.positive : styles.negative}>
                  {item.quantity_change >= 0 ? '+' : ''}{item.quantity_change}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<EmptyState icon="history" title="No history" />}
        />
      )}

      {/* Add item form as a simple modal-like bottom sheet using ConfirmDialog pattern */}
      <ConfirmDialog
        visible={showAdd}
        title="Add Inventory Item"
        message=""
        confirmLabel="Create"
        confirmColor={palette.orange500}
        loading={isCreating}
        onConfirm={handleCreate}
        onDismiss={() => setShowAdd(false)}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title={deleteTarget?.has_logs ? 'Archive Item' : 'Delete Item'}
        message={deleteTarget?.has_logs ? `Archive "${deleteTarget?.name}"?` : `Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={isDeleting || isArchiving}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  positive: { color: palette.green500, fontWeight: '700' },
  negative: { color: palette.red500, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: palette.orange500 },
  archivedSection: { padding: 16, backgroundColor: palette.zinc100 },
  archivedLabel: { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 8 },
})
