import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { relativeTime } from "@/lib/relative-time";
import { palette } from "@/theme";
import type { AnnouncementListItem } from "@/types/announcement";

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  parents: { bg: "#F3E8FF", text: "#A855F7" },
  staff: { bg: palette.blue100, text: palette.blue500 },
};

interface AnnouncementRowProps {
  announcement: AnnouncementListItem;
  onPress: (id: number) => void;
}

export function AnnouncementRow({
  announcement,
  onPress,
}: AnnouncementRowProps): React.JSX.Element {
  const badge = BADGE_COLORS[announcement.recipient_type];

  return (
    <Pressable
      testID="announcement-row"
      onPress={() => onPress(announcement.id)}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`Announcement from ${announcement.sender_name}`}
    >
      <View style={styles.header}>
        <Text variant="labelMedium" style={styles.sender}>
          {announcement.sender_name}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text
            variant="labelSmall"
            style={[styles.badgeText, { color: badge.text }]}
          >
            {announcement.recipient_type === "parents" ? "Parents" : "Staff"}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.date}>
          {relativeTime(announcement.created_at)}
        </Text>
      </View>

      {announcement.title !== null && (
        <Text variant="labelSmall" numberOfLines={1} style={styles.title}>
          {announcement.title}
        </Text>
      )}

      <Text variant="bodySmall" numberOfLines={2} style={styles.preview}>
        {announcement.message_preview}
      </Text>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.meta}>
          {announcement.recipient_count} recipients
        </Text>
        <Text variant="bodySmall" style={styles.metaDot}>
          •
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {announcement.read_count}/{announcement.recipient_count} read
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sender: { color: palette.zinc900, fontWeight: "600", flexShrink: 1 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontWeight: "600" },
  date: { color: palette.zinc500, marginLeft: "auto" },
  title: { color: palette.zinc900, fontWeight: "600" },
  preview: { color: palette.zinc500 },
  footer: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  meta: { color: palette.zinc500 },
  metaDot: { color: palette.zinc500 },
});
