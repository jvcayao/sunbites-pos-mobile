import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { palette } from "@/theme";
import type { DashboardOrder } from "@/types/dashboard";

const PAYMENT_BADGE: Record<string, { bg: string; text: string }> = {
  cash: { bg: palette.green100, text: palette.green500 },
  gcash: { bg: palette.blue100, text: palette.blue500 },
  wallet: { bg: palette.orange100, text: palette.orange500 },
  subscription: { bg: "#F3E8FF", text: "#A855F7" },
};

interface OrderRowProps {
  order: DashboardOrder;
}

export function OrderRow({ order }: OrderRowProps) {
  const badge = PAYMENT_BADGE[order.payment_method] ?? PAYMENT_BADGE["cash"];
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="labelMedium" style={styles.receipt}>
          {order.receipt_number}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {order.student_name ?? "Walk-in"} · {order.item_count} item
          {order.item_count !== 1 ? "s" : ""}
        </Text>
        <Text variant="bodySmall" style={styles.time}>
          {formatDate(order.created_at, "MMM d, h:mm a")}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text variant="labelSmall" style={{ color: badge.text }}>
            {order.payment_method}
          </Text>
        </View>
        <Text variant="titleSmall" style={styles.total}>
          {formatCurrency(order.total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
    alignItems: "flex-start",
  },
  left: { flex: 1 },
  receipt: { color: palette.zinc950, fontWeight: "600" },
  meta: { color: palette.zinc500, marginTop: 2 },
  time: { color: palette.zinc500, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  total: { color: palette.zinc950 },
});
