import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { formatCurrency } from "@/lib/formatters";
import { palette } from "@/theme";

interface CashInputProps {
  total: number;
  tendered: string;
  onTenderedChange: (value: string) => void;
}

export function CashInput({
  total,
  tendered,
  onTenderedChange,
}: CashInputProps) {
  const change = parseFloat(tendered || "0") - total;
  const isInsufficient = parseFloat(tendered || "0") < total;

  return (
    <View style={styles.container}>
      <TextInput
        label="Amount Tendered (₱)"
        mode="outlined"
        keyboardType="decimal-pad"
        value={tendered}
        onChangeText={onTenderedChange}
        style={styles.input}
        error={isInsufficient && tendered !== ""}
        accessibilityLabel="Amount tendered"
      />
      {tendered !== "" && !isInsufficient && (
        <View style={styles.changeRow}>
          <Text variant="bodyMedium" style={styles.changeLabel}>
            Change:
          </Text>
          <Text variant="titleMedium" style={styles.changeValue}>
            {formatCurrency(change)}
          </Text>
        </View>
      )}
      {tendered !== "" && isInsufficient && (
        <Text variant="bodySmall" style={styles.insufficientText}>
          Insufficient — need {formatCurrency(total - parseFloat(tendered))}{" "}
          more
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  input: { backgroundColor: palette.white },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  changeLabel: { color: palette.zinc500 },
  changeValue: { color: palette.green500, fontWeight: "700" },
  insufficientText: { color: palette.red500 },
});
