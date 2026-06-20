import { StyleSheet, View } from "react-native";
import { SegmentedButtons, Text, TextInput } from "react-native-paper";
import { palette } from "@/theme";

type DiscountType = "percent" | "fixed";

interface DiscountInputProps {
  type: DiscountType;
  amount: string;
  reason: string;
  subtotal: number;
  onTypeChange: (type: DiscountType) => void;
  onAmountChange: (amount: string) => void;
  onReasonChange: (reason: string) => void;
}

export function DiscountInput({
  type,
  amount,
  reason,
  subtotal,
  onTypeChange,
  onAmountChange,
  onReasonChange,
}: DiscountInputProps) {
  const discountValue =
    type === "percent"
      ? (subtotal * parseFloat(amount || "0")) / 100
      : parseFloat(amount || "0");

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>
        Discount
      </Text>
      <SegmentedButtons
        value={type}
        onValueChange={(v) => onTypeChange(v as DiscountType)}
        buttons={[
          { value: "percent", label: "Percent (%)" },
          { value: "fixed", label: "Fixed (₱)" },
        ]}
        style={styles.toggle}
      />
      <TextInput
        mode="outlined"
        label={type === "percent" ? "Discount %" : "Discount ₱"}
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="decimal-pad"
        style={styles.input}
        accessibilityLabel={
          type === "percent" ? "Discount percentage" : "Discount amount"
        }
      />
      {parseFloat(amount || "0") > 0 && (
        <>
          <TextInput
            mode="outlined"
            label="Reason (required)"
            value={reason}
            onChangeText={onReasonChange}
            style={styles.input}
            accessibilityLabel="Discount reason"
          />
          <Text variant="bodySmall" style={styles.preview}>
            Discount: −₱{discountValue.toFixed(2)}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: palette.zinc500, textTransform: "uppercase" },
  toggle: { marginBottom: 4 },
  input: { backgroundColor: palette.white },
  preview: { color: palette.orange500 },
});
