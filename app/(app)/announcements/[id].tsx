import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useAnnouncementDetail } from "@/hooks/useAnnouncements";
import { RecipientReadRow } from "@/components/announcements/RecipientReadRow";
import { palette } from "@/theme";
import { format, parseISO } from "date-fns";

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  parents: { bg: "#F3E8FF", text: "#A855F7" },
  staff: { bg: palette.blue100, text: palette.blue500 },
};

export default function AnnouncementDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = id !== undefined ? Number(id) : undefined;

  const { data, isLoading, refetch, isRefetching } =
    useAnnouncementDetail(numericId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          testID="loading-indicator"
          color={palette.orange500}
        />
      </View>
    );
  }

  const badge =
    data !== undefined ? BADGE_COLORS[data.recipient_type] : undefined;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
        <Appbar.Content title="Announcement" />
      </Appbar.Header>

      {data !== undefined && (
        <FlatList
          data={data.recipients}
          keyExtractor={(item) => String(item.id)}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <View style={styles.meta}>
                <Text variant="bodyMedium" style={styles.sender}>
                  {`From: ${data.sender_name}`}
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {format(parseISO(data.created_at), "MMM d, yyyy")}
                </Text>
              </View>

              {badge !== undefined && (
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text
                    variant="labelSmall"
                    style={[styles.badgeText, { color: badge.text }]}
                  >
                    {data.recipient_type === "parents" ? "Parents" : "Staff"}
                  </Text>
                </View>
              )}

              {data.title !== null && (
                <Text variant="titleMedium" style={styles.title}>
                  {data.title}
                </Text>
              )}

              <Text variant="bodyMedium" style={styles.message}>
                {data.message}
              </Text>

              <View style={styles.readSummary}>
                <Text variant="labelMedium" style={styles.readSummaryText}>
                  {`${data.read_count} of ${data.recipient_count} recipients have read this`}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => <RecipientReadRow recipient={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  appbar: { backgroundColor: palette.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { padding: 16, gap: 12 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: { color: palette.zinc500, flex: 1 },
  date: { color: palette.zinc500 },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "600" },
  title: { color: palette.zinc900, fontWeight: "700" },
  message: { color: palette.zinc900, lineHeight: 22 },
  readSummary: {
    backgroundColor: palette.zinc100,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  readSummaryText: { color: palette.zinc500 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.zinc200,
  },
});
