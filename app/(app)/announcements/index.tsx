import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { Appbar, FAB } from 'react-native-paper'
import { router } from 'expo-router'
import { useAnnouncementList } from '@/hooks/useAnnouncements'
import { AnnouncementRow } from '@/components/announcements/AnnouncementRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePermission } from '@/lib/permissions'
import { palette } from '@/theme'
import type { AnnouncementListItem } from '@/types/announcement'

export default function AnnouncementsScreen(): React.JSX.Element {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useAnnouncementList()

  const canCreate = usePermission('announcements')

  const announcements: AnnouncementListItem[] =
    data?.pages.flatMap((page) => page.data) ?? []

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator testID="loading-indicator" color={palette.orange500} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Announcements" />
      </Appbar.Header>

      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AnnouncementRow
            announcement={item}
            onPress={(id) => router.push(`/(app)/announcements/${id}` as never)}
          />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
        onEndReachedThreshold={0.2}
        contentContainerStyle={announcements.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <EmptyState
            icon="bullhorn-outline"
            title="No announcements yet"
            subtitle="Sent announcements will appear here"
          />
        }
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator style={styles.footerSpinner} color={palette.orange500} />
            : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {canCreate && (
        <FAB
          testID="create-announcement-fab"
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/(app)/announcements/create' as never)}
          accessibilityLabel="Create announcement"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: palette.white },
  appbar:         { backgroundColor: palette.white },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  separator:      { height: StyleSheet.hairlineWidth, backgroundColor: palette.zinc200 },
  footerSpinner:  { paddingVertical: 16 },
  fab:            { position: 'absolute', right: 16, bottom: 16, backgroundColor: palette.orange500 },
})
