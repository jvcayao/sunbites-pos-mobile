import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Button, Chip, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { Pressable } from 'react-native'
import { useFeedbackList, useMarkFeedbackRead, useReplyToFeedback } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { AppHeader } from '@/components/shared/AppHeader'
import { formatDate } from '@/lib/formatters'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { FeedbackItem, FeedbackCategory } from '@/types/references'

const CAT_COLOR: Record<FeedbackCategory, { bg: string; text: string }> = {
  food_quality:  { bg: palette.orange100, text: palette.orange500 },
  service:       { bg: palette.blue100,   text: palette.blue500 },
  portion_size:  { bg: palette.green100,  text: palette.green500 },
  cleanliness:   { bg: '#E0F2FE',         text: '#0891B2' },
  general:       { bg: palette.zinc100,   text: palette.zinc500 },
}

export default function FeedbackScreen() {
  const toast  = useToast()
  const canAct = usePermission('enrollment') // admin/manager
  const [search, setSearch]       = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [detail, setDetail]       = useState<FeedbackItem | null>(null)
  const [replyText, setReplyText] = useState('')

  const params = { search: search || undefined, unread_only: unreadOnly || undefined }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedbackList(params)
  const items = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const { mutate: markRead, isPending: isMarkingRead } = useMarkFeedbackRead()
  const { mutate: sendReply, isPending: isReplying }   = useReplyToFeedback()

  const handleMarkRead = (item: FeedbackItem): void => {
    markRead(item.id, {
      onSuccess: () => { toast.success('Marked as read'); setDetail((prev) => prev ? { ...prev, is_read: true } : null) },
      onError: (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const handleReply = (): void => {
    if (!detail || !replyText.trim()) return
    sendReply({ id: detail.id, message: replyText.trim() }, {
      onSuccess: () => { toast.success('Reply sent'); setReplyText(''); setDetail(null) },
      onError: (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const openDetail = (item: FeedbackItem): void => {
    setDetail(item)
    setReplyText('')
  }

  const renderItem = useCallback(({ item }: { item: FeedbackItem }) => {
    const cat = CAT_COLOR[item.category] ?? CAT_COLOR['general']
    return (
      <Pressable
        onPress={() => openDetail(item)}
        style={[listCardStyle, styles.row]}
        accessibilityRole="button"
        accessibilityLabel={`Feedback from ${item.student_name}`}
      >
        <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
          <Text variant="labelSmall" style={{ color: cat.text }}>
            {item.category.replace(/_/g, ' ')}
          </Text>
        </View>
        <View style={styles.rowInfo}>
          <Text variant="bodyMedium" style={styles.studentName}>{item.student_name}</Text>
          <Text variant="bodySmall" style={styles.preview} numberOfLines={1}>
            {item.message ?? '—'}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d, yyyy')}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </Pressable>
    )
  }, [])

  return (
    <View style={styles.container}>
      <AppHeader title="Feedback" />
      <View style={styles.toolbar}>
        <TextInput
          mode="outlined"
          placeholder="Search feedback…"
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.search}
          accessibilityLabel="Search feedback"
        />
        <Chip
          selected={unreadOnly}
          onPress={() => setUnreadOnly((v) => !v)}
          compact
          style={styles.filterChip}
          accessibilityLabel="Show unread only"
        >
          Unread
        </Chip>
      </View>

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
              <Text variant="bodySmall" style={styles.meta}>
                {detail.category.replace(/_/g, ' ')} · {formatDate(detail.created_at)}
              </Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.message}>{detail.message ?? '—'}</Text>

              {detail.admin_reply !== null && (
                <>
                  <Divider style={styles.divider} />
                  <Text variant="labelSmall" style={styles.replyLabel}>Admin reply</Text>
                  <Text variant="bodyMedium">{detail.admin_reply}</Text>
                </>
              )}

              {canAct && (
                <>
                  <Divider style={styles.divider} />
                  <TextInput
                    mode="outlined"
                    label="Reply to parent"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    numberOfLines={3}
                    style={styles.replyInput}
                    accessibilityLabel="Reply text"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                {canAct && !detail.is_read && (
                  <Button
                    onPress={() => handleMarkRead(detail)}
                    loading={isMarkingRead}
                    disabled={isMarkingRead}
                    textColor={palette.blue500}
                    accessibilityRole="button"
                  >
                    Mark as Read
                  </Button>
                )}
                {canAct && replyText.trim().length > 0 && (
                  <Button
                    mode="contained"
                    onPress={handleReply}
                    loading={isReplying}
                    disabled={isReplying}
                    accessibilityRole="button"
                  >
                    Send Reply
                  </Button>
                )}
                <Button mode="outlined" onPress={() => setDetail(null)} accessibilityRole="button">Close</Button>
              </View>
            </Surface>
          </Modal>
        </Portal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: palette.zinc100 },
  toolbar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  search:       { flex: 1, backgroundColor: palette.white },
  filterChip:   {},
  row:          { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  catBadge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  rowInfo:      { flex: 1 },
  studentName:  { color: palette.zinc950, fontWeight: '600' },
  preview:      { color: palette.zinc500, marginTop: 2 },
  meta:         { color: palette.zinc500 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.blue500, marginTop: 4 },
  modal:        { marginHorizontal: 20 },
  modalSurface: { borderRadius: 16, overflow: 'hidden', padding: 20 },
  modalTitle:   { fontWeight: '700', color: palette.zinc950 },
  divider:      { marginVertical: 12 },
  message:      { color: palette.zinc900 },
  replyLabel:   { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 4 },
  replyInput:   { marginBottom: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8, gap: 8 },
})
