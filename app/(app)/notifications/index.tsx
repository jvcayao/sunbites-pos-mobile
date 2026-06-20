import { StyleSheet, View, FlatList } from "react-native";
import { Appbar, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import {
  useNotificationList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { palette } from "@/theme";
import type { StaffNotification } from "@/types/staff-notification";

export default function NotificationsScreen(): React.JSX.Element {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useNotificationList();

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const notifications: StaffNotification[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.orange500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
        <Appbar.Content title="Notifications" />
        <Appbar.Action
          icon="check-all"
          onPress={() => markAllRead()}
          disabled={isMarkingAll || notifications.length === 0}
          accessibilityLabel="Mark all as read"
        />
      </Appbar.Header>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onMarkRead={(id) => markRead(id)}
            onDelete={(id) => deleteNotif(id)}
          />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => {
          if (hasNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.2}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell-check-outline"
            title="You're all caught up"
            subtitle="No new notifications"
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.footerSpinner}
              color={palette.orange500}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  appbar: { backgroundColor: palette.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  footerSpinner: { paddingVertical: 16 },
});
