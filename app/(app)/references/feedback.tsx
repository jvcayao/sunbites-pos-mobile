import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Switch, Text, TextInput } from 'react-native-paper'
import { Pressable } from 'react-native'
import { useFeedbackList, useUpdateFeedback, useDeleteFeedback } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/formatters'
import { palette } from '@/theme'
import type { FeedbackItem, FeedbackCategory } from '@/types/references'

const CAT_COLOR: Record<FeedbackCategory, { bg: string; text: string }> = {
  food_quality: { bg: palette.orange100, text: palette.orange500 },
  service:      { bg: palette.blue100,   text: palette.blue500 },
  pricing:      { bg: palette.green100,  text: palette.green500 },
  cleanliness:  { bg: '#E0F2FE',         text: '#0891B2' },
  other:        { bg: palette.zinc100,   text: palette.zinc500 },
}

export default function FeedbackScreen() {
  const toast    = useToast()
  const canAct   = usePermission('enrollment') // admin/manager
  const [search, setSearch]   = useState('')
  const [detail, setDetail]   = useState<FeedbackItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null)

  const params = { search: search || undefined }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeedbackList(params)
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const { mutate: updateFeedback, isPending: isUpdating } = useUpdateFeedback()
  const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback()

  const handleToggleResolved = (item: FeedbackItem): void => {
    updateFeedback({ id: item.id, data: { is_resolved: !item.is_resolved } }, {
      onSuccess: () => toast.success(item.is_resolved ? 'Marked unresolved' : 'Marked resolved'),
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    if (!deleteTarget) return
    deleteFeedback(deleteTarget.id, {
      onSuccess: () => { toast.success('Deleted'); setDeleteTarget(null); setDetail(null) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const renderItem = useCallback(({ item }: { item: FeedbackItem }) => {
    const cat = CAT_COLOR[item.category] ?? CAT_COLOR['other']
    return (
      <Pressable onPress={() => setDetail(item)} style={styles.row} accessibilityRole="button" accessibilityLabel={`Feedback from ${item.student_name}`}>
        <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
          <Text variant="labelSmall" style={{ color: cat.text }}>{item.category.replace('_', ' ')}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text variant="bodyMedium" style={styles.studentName}>{item.student_name}</Text>
          <Text variant="bodySmall" style={styles.preview} numberOfLines={1}>{item.message}</Text>
          <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d, yyyy')}</Text>
        </View>
        {item.is_resolved && <View style={styles.resolvedDot} />}
      </Pressable>
    )
  }, [])

  return (
    <View style={styles.container}>
      <TextInput mode="outlined" placeholder="Search feedback…" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} accessibilityLabel="Search feedback" />
      {isLoading ? <SkeletonCard count={4} /> : (
        <FlatList
          data={items}
          keyExtractor={(i: FeedbackItem) => String(i.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={<EmptyState icon="message-text" title="No feedback found" />}
          ListFooterComponent={isFetchingNextPage ? <Text style={styles.meta}>Loading…</Text> : null}
        />
      )}

      {detail !== null && (
        <Portal>
          <Modal visible onDismiss={() => setDetail(null)} contentContainerStyle={styles.modal}>
            <Surface style={styles.modalSurface} elevation={4}>
              <Text variant="titleMedium" style={styles.modalTitle}>{detail.student_name}</Text>
              <Text variant="bodySmall" style={styles.meta}>{detail.category.replace('_', ' ')} · {formatDate(detail.created_at)}</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.message}>{detail.message}</Text>
              <Divider style={styles.divider} />
              {canAct && (
                <View style={styles.resolvedRow}>
                  <Text variant="bodyMedium">Resolved</Text>
                  <Switch value={detail.is_resolved} onValueChange={() => handleToggleResolved(detail)} color={palette.orange500} />
                </View>
              )}
              <View style={styles.modalActions}>
                {canAct && <Button textColor={palette.red500} onPress={() => setDeleteTarget(detail)} accessibilityRole="button">Delete</Button>}
                <Button mode="contained" onPress={() => setDetail(null)} accessibilityRole="button">Close</Button>
              </View>
            </Surface>
          </Modal>
        </Portal>
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Feedback"
        message="Delete this feedback item?"
        loading={isDeleting}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  search: { marginHorizontal: 16, marginTop: 8, backgroundColor: palette.white },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  rowInfo: { flex: 1 },
  studentName: { color: palette.zinc950, fontWeight: '600' },
  preview: { color: palette.zinc500, marginTop: 2 },
  meta: { color: palette.zinc500 },
  resolvedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green500, marginTop: 4 },
  modal: { marginHorizontal: 20 },
  modalSurface: { borderRadius: 16, overflow: 'hidden', padding: 20 },
  modalTitle: { fontWeight: '700', color: palette.zinc950 },
  divider: { marginVertical: 12 },
  message: { color: palette.zinc900 },
  resolvedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
})
