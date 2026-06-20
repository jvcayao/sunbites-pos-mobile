import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Text,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import {
  useReminderParentDetail,
  useSendReminders,
} from "@/hooks/useReminders";
import { usePermission } from "@/lib/permissions";
import { useToast } from "@/components/shared/ErrorToast";
import { PaymentHistoryTable } from "@/components/reminders/PaymentHistoryTable";
import { palette } from "@/theme";

export default function ParentDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parentId = parseInt(id ?? "0", 10);

  const canSend = usePermission("reminders_send");
  const {
    data: parent,
    isLoading,
    refetch,
    isRefetching,
  } = useReminderParentDetail(parentId);
  const { mutate: sendReminders, isPending } = useSendReminders();
  const toast = useToast();

  const handleSendReminder = (): void => {
    sendReminders(
      { parent_ids: [parentId] },
      {
        onSuccess: (result) => {
          toast.success(`Reminder sent to ${parent?.full_name ?? "parent"}`);
          if (result.skipped > 0) {
            toast.error(
              "Reminder already sent this month. Use force to override.",
            );
          }
        },
        onError: () => {
          toast.error("Failed to send reminder. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered} testID="parent-detail-loading">
        <ActivityIndicator color={palette.orange500} />
      </View>
    );
  }

  if (parent === undefined) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">Parent not found</Text>
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
        <Appbar.Content title={parent.full_name} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.contactCard}>
          <Text variant="bodyMedium" style={styles.contactText}>
            {parent.email}
          </Text>
          {parent.phone !== null && (
            <Text variant="bodyMedium" style={styles.contactText}>
              {parent.phone}
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {parent.students.map((student) => (
          <View key={student.id} style={styles.studentSection}>
            <Text variant="titleSmall" style={styles.studentName}>
              {student.full_name}
            </Text>
            <Text variant="bodySmall" style={styles.gradeLevel}>
              {student.grade_level}
            </Text>
            <PaymentHistoryTable entries={student.payment_history} />
          </View>
        ))}
      </ScrollView>

      {canSend && (
        <View style={styles.footer}>
          <Button
            testID="send-reminder-single-btn"
            mode="contained"
            onPress={handleSendReminder}
            loading={isPending}
            disabled={isPending}
            style={styles.sendBtn}
            accessibilityRole="button"
            accessibilityLabel={`Send reminder to ${parent.full_name}`}
          >
            Send Reminder
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  appbar: { backgroundColor: palette.white, elevation: 0 },
  content: { padding: 16, gap: 16 },
  contactCard: {
    backgroundColor: palette.zinc50,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  contactText: { color: palette.zinc900 },
  divider: { marginVertical: 8 },
  studentSection: { gap: 4 },
  studentName: { color: palette.zinc900 },
  gradeLevel: { color: palette.zinc500, marginBottom: 8 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
    backgroundColor: palette.white,
  },
  sendBtn: { borderRadius: 8 },
});
