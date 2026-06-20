import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, SegmentedButtons, Surface, Text, TextInput } from 'react-native-paper'
import {
  useInventoryList, useInventoryHistory, useInventoryItemLogs,
  useCreateInventoryItem, useDeleteInventoryItem, useArchiveInventoryItem,
} from '@/hooks/useReferences'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AppHeader } from '@/components/shared/AppHeader'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { InventoryItem, InventoryLog, InventoryLogType } from '@/types/references'

const LOG_ROW_COLOR: Record<InventoryLogType, string> = {
  restock: '#F0FDF4', // green-50
  sale:    '#FEF2F2', // red-50
  waste:   '#FEF2F2', // red-50
  manual:  palette.zinc100,
}

const OVER_BADGE = { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' } // orange-100/700/300

function StatusBadgeInline({ status }: { status: string }) {
  const s = status?.toUpperCase()
  if (s === 'OK')   return <View style={[styles.badge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}><Text style={[styles.badgeText, { color: '#16A34A' }]}>OK</Text></View>
  if (s === 'LOW')  return <View style={[styles.badge, { backgroundColor: '#FEF9C3', borderColor: '#FDE047' }]}><Text style={[styles.badgeText, { color: '#CA8A04' }]}>LOW</Text></View>
  if (s === 'OUT')  return <View style={[styles.badge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}><Text style={[styles.badgeText, { color: '#DC2626' }]}>OUT</Text></View>
  if (s === 'OVER') return <View style={[styles.badge, { backgroundColor: OVER_BADGE.bg, borderColor: OVER_BADGE.border }]}><Text style={[styles.badgeText, { color: OVER_BADGE.text }]}>OVER</Text></View>
  return null
}

const EMPTY_FORM = { name: '', unit: '', quantity: '0', restock_threshold: '', overstock_threshold: '', cost_per_unit: '' }

export default function InventoryScreen() {
  const toast = useToast()
  const [view, setView]             = useState<'list' | 'history'>('list')
  const [form, setForm]             = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [historyItem, setHistoryItem]   = useState<InventoryItem | null>(null)

  const { data: items, isLoading, refetch, isRefetching } = useInventoryList()
  const { data: history } = useInventoryHistory()
  const { data: itemLogs, isLoading: isLogsLoading } = useInventoryItemLogs(historyItem?.id ?? 0)
  const { mutate: createItem, isPending: isCreating }   = useCreateInventoryItem()
  const { mutate: deleteItem, isPending: isDeleting }   = useDeleteInventoryItem()
  const { mutate: archiveItem, isPending: isArchiving } = useArchiveInventoryItem()

  const rawItems   = Array.isArray(items) ? items : (items as any)?.data ?? []
  const active     = (rawItems as InventoryItem[]).filter((i) => !i.is_archived)
  const archived   = (rawItems as InventoryItem[]).filter((i) => i.is_archived)
  const historyList: InventoryLog[] = Array.isArray(history) ? history : (history as any)?.data ?? []
  const logs: InventoryLog[]        = Array.isArray(itemLogs) ? itemLogs : (itemLogs as any)?.data ?? []

  const isFormValid = form.name.trim().length > 0 && form.unit.trim().length > 0 && form.restock_threshold.trim().length > 0

  const handleCreate = (): void => {
    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim(),
      quantity: Number(form.quantity) || 0,
      restock_threshold: Number(form.restock_threshold),
      ...(form.overstock_threshold ? { overstock_threshold: Number(form.overstock_threshold) } : {}),
      ...(form.cost_per_unit ? { cost_per_unit: Number(form.cost_per_unit) } : {}),
    }
    createItem(payload, {
      onSuccess: () => { toast.success('Item created'); setForm(EMPTY_FORM) },
      onError: (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    if (!deleteTarget) return
    if ((deleteTarget as any).has_logs) {
      archiveItem(deleteTarget.id, {
        onSuccess: () => { toast.success('Item archived'); setDeleteTarget(null) },
        onError: (err: unknown) => toast.error(getApiError(err)),
      })
    } else {
      deleteItem(deleteTarget.id, {
        onSuccess: () => { toast.success('Item deleted'); setDeleteTarget(null) },
        onError: (err: unknown) => toast.error(getApiError(err)),
      })
    }
  }

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => (
    <View style={[listCardStyle, styles.row]}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.name}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.meta}>
          {item.quantity} {item.unit} · alert: {item.restock_threshold}
          {item.cost_per_unit != null ? ` · ₱${item.cost_per_unit}` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusBadgeInline status={item.status} />
        <View style={styles.actions}>
          <Button compact mode="text" onPress={() => setHistoryItem(item)} accessibilityRole="button" accessibilityLabel={`History for ${item.name}`}>History</Button>
          <Button compact mode="text" textColor={palette.red500} onPress={() => setDeleteTarget(item)} accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`}>✕</Button>
        </View>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      <AppHeader title="Inventory" />
      <SegmentedButtons
        value={view}
        onValueChange={(v) => setView(v as 'list' | 'history')}
        buttons={[{ value: 'list', label: 'Inventory' }, { value: 'history', label: 'History' }]}
        style={styles.tabs}
      />

      {view === 'list' && (
        <>
          {/* Inline Add New Item form */}
          <Surface style={styles.addForm} elevation={0}>
            <Text variant="labelMedium" style={styles.addTitle}>Add New Item</Text>
            <View style={styles.formRow}>
              <TextInput mode="outlined" label="Name *" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} style={styles.inputFlex} dense accessibilityLabel="Item name" />
              <TextInput mode="outlined" label="Unit *" value={form.unit} onChangeText={(v) => setForm((f) => ({ ...f, unit: v }))} style={styles.inputSmall} dense accessibilityLabel="Unit" />
            </View>
            <View style={styles.formRow}>
              <TextInput mode="outlined" label="Initial Qty *" value={form.quantity} onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))} style={styles.inputFlex} dense keyboardType="numeric" accessibilityLabel="Initial quantity" />
              <TextInput mode="outlined" label="Low Alert Qty *" value={form.restock_threshold} onChangeText={(v) => setForm((f) => ({ ...f, restock_threshold: v }))} style={styles.inputFlex} dense keyboardType="numeric" accessibilityLabel="Low alert quantity" />
            </View>
            <View style={styles.formRow}>
              <TextInput mode="outlined" label="Overstock Qty" value={form.overstock_threshold} onChangeText={(v) => setForm((f) => ({ ...f, overstock_threshold: v }))} style={styles.inputFlex} dense keyboardType="numeric" accessibilityLabel="Overstock quantity" />
              <TextInput mode="outlined" label="Cost/Unit" value={form.cost_per_unit} onChangeText={(v) => setForm((f) => ({ ...f, cost_per_unit: v }))} style={styles.inputFlex} dense keyboardType="numeric" accessibilityLabel="Cost per unit" />
            </View>
            <Button mode="contained" onPress={handleCreate} loading={isCreating} disabled={isCreating || !isFormValid} style={styles.addBtn} accessibilityRole="button">Add Item</Button>
          </Surface>

          {isLoading ? <SkeletonCard count={4} /> : (
            <FlatList
              data={active}
              keyExtractor={(i: InventoryItem) => String(i.id)}
              renderItem={renderItem}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
              ListEmptyComponent={<EmptyState icon="package-variant-closed" title="No inventory items" />}
              ListFooterComponent={archived.length > 0 ? (
                <View style={styles.archivedSection}>
                  <Text variant="labelMedium" style={styles.archivedLabel}>Archived ({archived.length})</Text>
                  {archived.map((item: InventoryItem) => (
                    <Text key={item.id} variant="bodySmall" style={styles.meta}>{item.name}</Text>
                  ))}
                </View>
              ) : null}
            />
          )}
        </>
      )}

      {view === 'history' && (
        <FlatList
          data={historyList}
          keyExtractor={(i: InventoryLog) => String(i.id)}
          renderItem={({ item }: { item: InventoryLog }) => (
            <View style={[styles.row, { backgroundColor: LOG_ROW_COLOR[item.type] ?? palette.white }]}>
              <View style={styles.left}>
                <Text variant="bodyMedium" style={styles.name}>{item.item_name_snapshot}</Text>
                <Text variant="bodySmall" style={styles.meta}>{item.adjusted_by_name} · {item.reason}</Text>
              </View>
              <View style={styles.right}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.type}</Text>
                </View>
                <Text variant="bodySmall" style={item.quantity_change >= 0 ? styles.positive : styles.negative}>
                  {item.quantity_change >= 0 ? '+' : ''}{item.quantity_change}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>→ {item.stock_after}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<EmptyState icon="history" title="No history" />}
        />
      )}

      {/* Per-item log history modal */}
      {historyItem !== null && (
        <Portal>
          <Modal visible onDismiss={() => setHistoryItem(null)} contentContainerStyle={styles.modal}>
            <Surface style={styles.modalSurface} elevation={4}>
              <Text variant="titleMedium" style={styles.modalTitle}>History — {historyItem.name}</Text>
              <Divider style={styles.divider} />
              {isLogsLoading ? (
                <Text style={styles.meta}>Loading…</Text>
              ) : logs.length === 0 ? (
                <Text style={styles.meta}>No log history for this item.</Text>
              ) : (
                <ScrollView style={styles.logScroll}>
                  {logs.map((log) => (
                    <View key={log.id} style={[styles.logRow, { backgroundColor: LOG_ROW_COLOR[log.type] ?? palette.white }]}>
                      <Text variant="bodySmall" style={styles.meta}>{log.created_at}</Text>
                      <View style={styles.logRight}>
                        <View style={styles.badge}><Text style={styles.badgeText}>{log.type}</Text></View>
                        <Text variant="bodySmall" style={log.quantity_change >= 0 ? styles.positive : styles.negative}>
                          {log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}
                        </Text>
                        <Text variant="bodySmall" style={styles.meta}>→ {log.stock_after}</Text>
                      </View>
                      {log.reason ? <Text variant="bodySmall" style={styles.meta}>{log.reason} · {log.adjusted_by_name}</Text> : null}
                    </View>
                  ))}
                </ScrollView>
              )}
              <Button mode="outlined" onPress={() => setHistoryItem(null)} style={styles.closeBtn} accessibilityRole="button">Close</Button>
            </Surface>
          </Modal>
        </Portal>
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={(deleteTarget as any)?.has_logs ? 'Archive Item' : 'Delete Item'}
        message={(deleteTarget as any)?.has_logs ? `Archive "${deleteTarget?.name}"?` : `Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={isDeleting || isArchiving}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: palette.zinc100 },
  tabs:           { marginHorizontal: 16, marginVertical: 8 },
  addForm:        { margin: 16, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: palette.zinc200, borderStyle: 'dashed', backgroundColor: palette.white },
  addTitle:       { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 8 },
  formRow:        { flexDirection: 'row', gap: 8, marginBottom: 8 },
  inputFlex:      { flex: 1, backgroundColor: palette.white },
  inputSmall:     { width: 80, backgroundColor: palette.white },
  addBtn:         { alignSelf: 'flex-end', marginTop: 4 },
  row:            { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12 },
  left:           { flex: 1 },
  right:          { alignItems: 'flex-end', gap: 4 },
  actions:        { flexDirection: 'row', gap: 4 },
  name:           { color: palette.zinc950 },
  meta:           { color: palette.zinc500 },
  positive:       { color: palette.green500, fontWeight: '700' },
  negative:       { color: palette.red500, fontWeight: '700' },
  badge:          { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: palette.zinc200, backgroundColor: palette.zinc100 },
  badgeText:      { fontSize: 10, fontWeight: '600', color: palette.zinc500 },
  archivedSection: { padding: 16, backgroundColor: palette.zinc100 },
  archivedLabel:  { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 8 },
  modal:          { marginHorizontal: 20 },
  modalSurface:   { borderRadius: 16, overflow: 'hidden', padding: 20, maxHeight: '80%' },
  modalTitle:     { fontWeight: '700', color: palette.zinc950 },
  divider:        { marginVertical: 12 },
  logScroll:      { maxHeight: 300 },
  logRow:         { paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200 },
  logRight:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  closeBtn:       { marginTop: 12 },
})
