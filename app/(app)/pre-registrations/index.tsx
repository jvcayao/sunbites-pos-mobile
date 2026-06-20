import React, { useState, useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { ActivityIndicator, SegmentedButtons } from 'react-native-paper'
import { AppHeader } from '@/components/shared/AppHeader'
import { router } from 'expo-router'
import { usePreRegistrationList } from '@/hooks/usePreRegistrations'
import { PreRegistrationRow } from '@/components/pre-registrations/PreRegistrationRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { palette } from '@/theme'
import type { PreRegistrationListItem, PreRegistrationStatus } from '@/types/pre-registration'

const STATUS_OPTIONS: { value: PreRegistrationStatus; label: string }[] = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired',  label: 'Expired' },
]

const EMPTY_MESSAGES: Record<PreRegistrationStatus, string> = {
  pending:  'No pending pre-registrations',
  approved: 'No approved pre-registrations',
  rejected: 'No rejected pre-registrations',
  expired:  'No expired pre-registrations',
}

export default function PreRegistrationsScreen(): React.JSX.Element {
  const [status, setStatus] = useState<PreRegistrationStatus>('pending')

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = usePreRegistrationList({ status })

  const items: PreRegistrationListItem[] =
    data?.pages.flatMap((page) => page.data) ?? []

  const handlePress = useCallback((id: number): void => {
    router.push(`/(app)/pre-registrations/${id}`)
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: PreRegistrationListItem }) => (
      <PreRegistrationRow item={item} onPress={handlePress} />
    ),
    [handlePress],
  )

  const keyExtractor = useCallback(
    (item: PreRegistrationListItem) => String(item.id),
    [],
  )

  return (
    <View style={styles.container}>
      <AppHeader title="Pre-Registrations" />

      <SegmentedButtons
        value={status}
        onValueChange={(v) => setStatus(v as PreRegistrationStatus)}
        buttons={STATUS_OPTIONS}
        style={styles.tabs}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.orange500} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <EmptyState
              icon="clipboard-check-outline"
              title={EMPTY_MESSAGES[status]}
            />
          }
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator style={styles.footerSpinner} color={palette.orange500} />
              : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: palette.white },

  tabs:           { marginHorizontal: 16, marginVertical: 8 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  separator:      { height: StyleSheet.hairlineWidth, backgroundColor: palette.zinc200 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerSpinner:  { paddingVertical: 16 },
})
