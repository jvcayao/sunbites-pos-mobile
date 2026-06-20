import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SegmentedButtons, Text } from "react-native-paper";
import { useInventoryReport } from "@/hooks/useReports";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { SummaryCard } from "@/components/reports/SummaryCard";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { AppHeader } from "@/components/shared/AppHeader";
import { listCardStyle } from "@/lib/constants";
import { palette } from "@/theme";
import type { InventoryReportItem, InventoryLogItem } from "@/types/reports";

export default function InventoryReportScreen() {
  const [view, setView] = useState<"snapshot" | "history">("snapshot");
  const [statusF, setStatusF] = useState("all");

  const { data, isLoading, refetch, isRefetching } = useInventoryReport({
    status: statusF === "all" ? undefined : statusF,
  });
  const snapshot = (data as any)?.snapshot ?? [];
  const history = (data as any)?.history?.data ?? [];
  const summary = (data as any)?.summary;

  const renderSnapshot = useCallback(
    ({ item }: { item: InventoryReportItem }) => (
      <View style={[listCardStyle, styles.row]}>
        <View style={styles.left}>
          <Text variant="bodyMedium" style={styles.name}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        <StatusBadge variant={item.status.toLowerCase()} />
      </View>
    ),
    [],
  );

  const renderLog = useCallback(
    ({ item }: { item: InventoryLogItem }) => (
      <View style={[listCardStyle, styles.row]}>
        <View style={styles.left}>
          <Text variant="bodyMedium" style={styles.name}>
            {item.item_name}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {item.adjusted_by}
          </Text>
        </View>
        <View style={styles.right}>
          <StatusBadge variant={item.type} />
          <Text
            variant="bodySmall"
            style={
              item.quantity_change >= 0 ? styles.positive : styles.negative
            }
          >
            {item.quantity_change >= 0 ? "+" : ""}
            {item.quantity_change}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Inventory Report" showBack />
      {isLoading ? (
        <SkeletonCard count={3} />
      ) : (
        <>
          {summary !== undefined && (
            <View style={styles.summaryRow}>
              <SummaryCard
                label="Out of Stock"
                value={summary.out_of_stock}
                accent={palette.red500}
              />
              <SummaryCard
                label="Below Threshold"
                value={summary.below_threshold}
                accent={palette.yellow500}
              />
              <SummaryCard
                label="Overstock"
                value={summary.overstock}
                accent={palette.blue500}
              />
            </View>
          )}
          <SegmentedButtons
            value={view}
            onValueChange={(v) => setView(v as any)}
            buttons={[
              { value: "snapshot", label: "Snapshot" },
              { value: "history", label: "History" },
            ]}
            style={styles.tabs}
          />
          {view === "snapshot" && (
            <>
              <FilterChipRow>
                {(["all", "ok", "low", "out", "over"] as const).map((s) => (
                  <FilterChip
                    key={s}
                    label={s.toUpperCase()}
                    active={statusF === s}
                    onPress={() => setStatusF(s)}
                  />
                ))}
              </FilterChipRow>
              <FlatList
                data={snapshot}
                keyExtractor={(i: InventoryReportItem) => String(i.id)}
                renderItem={renderSnapshot}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor={palette.orange500}
                  />
                }
                ListEmptyComponent={
                  <EmptyState
                    icon="package-variant-closed"
                    title="No inventory data"
                  />
                }
              />
            </>
          )}
          {view === "history" && (
            <FlatList
              data={history}
              keyExtractor={(i: InventoryLogItem) => String(i.id)}
              renderItem={renderLog}
              ListEmptyComponent={
                <EmptyState icon="history" title="No history" />
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  summaryRow: { flexDirection: "row", padding: 16, gap: 8 },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  left: { flex: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  positive: { color: palette.green500, fontWeight: "700" },
  negative: { color: palette.red500, fontWeight: "700" },
});
