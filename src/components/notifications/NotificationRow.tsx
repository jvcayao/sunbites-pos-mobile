import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getNotificationTitle,
  getNotificationRoute,
} from "@/types/staff-notification";
import { relativeTime } from "@/lib/relative-time";
import { listCardStyle } from "@/lib/constants";
import { NotificationContextMenu } from "./NotificationContextMenu";
import { palette } from "@/theme";
import type { StaffNotification } from "@/types/staff-notification";

interface NotificationRowProps {
  notification: StaffNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function getPreview(n: StaffNotification): string {
  switch (n.type) {
    case "App\\Notifications\\AnnouncementNotification":
      return n.data.message;
    case "App\\Notifications\\PreRegistrationNotification":
      return `${n.data.enrollment_type} • ${n.data.branch_name}`;
    default:
      return "";
  }
}

export function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
}: NotificationRowProps): React.JSX.Element {
  const [menuVisible, setMenuVisible] = useState(false);
  const isRead = notification.read_at !== null;
  const title = getNotificationTitle(notification);
  const preview = getPreview(notification);
  const timestamp = relativeTime(notification.created_at);
  const route = getNotificationRoute(notification);

  const handlePress = (): void => {
    if (!isRead) onMarkRead(notification.id);
    if (route !== null) router.push(route as never);
  };

  return (
    <View style={[listCardStyle, styles.wrapper]}>
      <Pressable
        testID="notification-row"
        onPress={handlePress}
        style={[styles.row, !isRead && styles.rowUnread]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.dotCol}>
          {!isRead && <View testID="unread-dot" style={styles.dot} />}
        </View>

        <View style={styles.body}>
          <Text
            variant="labelMedium"
            numberOfLines={1}
            style={[styles.title, !isRead && styles.titleUnread]}
          >
            {title}
          </Text>
          <Text variant="bodySmall" numberOfLines={2} style={styles.preview}>
            {preview}
          </Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            {timestamp}
          </Text>
        </View>

        <Pressable
          testID="notification-menu-btn"
          onPress={() => setMenuVisible(true)}
          style={styles.menuBtn}
          accessibilityRole="button"
          accessibilityLabel="Notification options"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={20}
            color={palette.zinc500}
          />
        </Pressable>
      </Pressable>

      <NotificationContextMenu
        visible={menuVisible}
        isRead={isRead}
        onMarkRead={() => onMarkRead(notification.id)}
        onDelete={() => onDelete(notification.id)}
        onDismiss={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  rowUnread: { backgroundColor: palette.orange100 },
  dotCol: { width: 10, paddingTop: 4, alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.orange500,
  },
  body: { flex: 1, gap: 2 },
  title: { color: palette.zinc900 },
  titleUnread: { color: palette.zinc950, fontWeight: "600" },
  preview: { color: palette.zinc500 },
  timestamp: { color: palette.zinc500, marginTop: 2 },
  menuBtn: { paddingLeft: 8, paddingVertical: 4 },
});
