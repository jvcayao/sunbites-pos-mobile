import { StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";
import { palette } from "@/theme";

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export function SummaryCard({
  label,
  value,
  sub,
  accent = palette.orange500,
}: SummaryCardProps) {
  return (
    <Surface style={[styles.card, { borderTopColor: accent }]} elevation={1}>
      <Text variant="labelSmall" style={styles.label}>
        {label}
      </Text>
      <Text variant="titleLarge" style={styles.value}>
        {value}
      </Text>
      {sub !== undefined && (
        <Text variant="bodySmall" style={styles.sub}>
          {sub}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: palette.white,
    borderTopWidth: 3,
  },
  label: {
    color: palette.zinc500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { color: palette.zinc950, fontWeight: "700" },
  sub: { color: palette.zinc500, marginTop: 2 },
});
