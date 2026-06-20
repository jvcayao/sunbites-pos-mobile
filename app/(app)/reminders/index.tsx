import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Checkbox, Text } from "react-native-paper";
import { AppHeader } from "@/components/shared/AppHeader";
import { router, useFocusEffect } from "expo-router";
import {
  useEligibleParents,
  useSendReminders,
  useReminderBellCount,
} from "@/hooks/useReminders";
import { usePermission } from "@/lib/permissions";
import { useToast } from "@/components/shared/ErrorToast";
import { EligibleParentRow } from "@/components/reminders/EligibleParentRow";
import { SendRemindersBar } from "@/components/reminders/SendRemindersBar";
import { DuplicateWarningSheet } from "@/components/reminders/DuplicateWarningSheet";
import { EmptyState } from "@/components/shared/EmptyState";
import { palette } from "@/theme";
import type { EligibleParent } from "@/types/reminder";

export default function RemindersScreen(): React.JSX.Element {
  const canSend = usePermission("reminders_send");

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useEligibleParents();

  const { mutate: sendReminders, isPending } = useSendReminders();
  const { refetch: refetchBellCount } = useReminderBellCount();
  const toast = useToast();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [forcedIds, setForcedIds] = useState<Set<number>>(new Set());
  const [showWarningSheet, setShowWarningSheet] = useState(false);

  const parents: EligibleParent[] = data?.pages.flatMap((p) => p.data) ?? [];

  const unsentParents = parents.filter((p) =>
    p.unpaid_periods.some((period) => !period.was_sent),
  );
  const allUnsentSelected =
    unsentParents.length > 0 && unsentParents.every((p) => selected.has(p.id));

  useFocusEffect(
    useCallback(() => {
      void refetchBellCount();
    }, [refetchBellCount]),
  );

  const handleToggle = (id: number): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLongPress = (id: number): void => {
    setForcedIds((prev) => new Set(prev).add(id));
    setSelected((prev) => new Set(prev).add(id));
  };

  const handleSelectAll = (): void => {
    if (allUnsentSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(unsentParents.map((p) => p.id)));
    }
  };

  const alreadySentSelectedParents = parents
    .filter(
      (p) =>
        selected.has(p.id) &&
        p.unpaid_periods.every((period) => period.was_sent),
    )
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      last_sent_at:
        p.unpaid_periods.find((period) => period.last_sent_at)?.last_sent_at ??
        "",
    }));

  const handleSendPress = (): void => {
    if (alreadySentSelectedParents.length > 0) {
      setShowWarningSheet(true);
    } else {
      executeSend(false);
    }
  };

  const executeSend = (force: boolean): void => {
    setShowWarningSheet(false);
    const parentIds = Array.from(selected);
    sendReminders(
      { parent_ids: parentIds, ...(force ? { force: true } : {}) },
      {
        onSuccess: (result) => {
          toast.success(
            `Sent to ${result.sent} parent${result.sent !== 1 ? "s" : ""}`,
          );
          if (result.skipped > 0) {
            toast.error(
              `${result.skipped} parent${result.skipped !== 1 ? "s" : ""} skipped — already sent this month.`,
            );
          }
          setSelected(new Set());
          setForcedIds(new Set());
        },
        onError: () => {
          toast.error("Failed to send reminders. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered} testID="reminders-loading">
        <ActivityIndicator color={palette.orange500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Payment Reminders"
        right={
          <Pressable
            testID="select-all-btn"
            onPress={handleSelectAll}
            style={styles.selectAllBtn}
            accessibilityRole="checkbox"
            accessibilityLabel="Select all unsent"
            accessibilityState={{ checked: allUnsentSelected }}
          >
            <Checkbox.Android
              status={allUnsentSelected ? "checked" : "unchecked"}
            />
            <Text variant="labelSmall" style={styles.selectAllText}>
              Select All Unsent
            </Text>
          </Pressable>
        }
      />

      <FlatList
        data={parents}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EligibleParentRow
            parent={item}
            isSelected={selected.has(item.id)}
            isForced={forcedIds.has(item.id)}
            onPress={(id) => router.push(`/(app)/reminders/${id}` as never)}
            onToggle={handleToggle}
            onLongPress={handleLongPress}
          />
        )}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && void fetchNextPage()
        }
        onEndReachedThreshold={0.2}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState title="No parents eligible for reminders this month" />
        }
        contentContainerStyle={styles.list}
      />

      {canSend && (
        <SendRemindersBar
          selectedCount={selected.size}
          isWindowOpen
          isPending={isPending}
          onSend={handleSendPress}
        />
      )}

      <DuplicateWarningSheet
        visible={showWarningSheet}
        alreadySentParents={alreadySentSelectedParents}
        onConfirm={() => executeSend(true)}
        onDismiss={() => setShowWarningSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  selectAllText: { color: palette.zinc900 },
  list: { flexGrow: 1 },
  footerLoader: { padding: 16 },
});
