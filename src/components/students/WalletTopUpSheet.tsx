import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { formatCurrency } from "@/lib/formatters";
import { palette } from "@/theme";
import type { TopUpDto } from "@/types/student";

type PaymentMethod = TopUpDto["payment_method"];

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "gcash", label: "GCash" },
  { key: "bank_transfer", label: "Bank Transfer" },
];

interface WalletTopUpSheetProps {
  visible: boolean;
  currentBalance: number;
  studentName: string;
  loading?: boolean;
  onConfirm: (data: TopUpDto) => void;
  onDismiss: () => void;
}

export function WalletTopUpSheet({
  visible,
  currentBalance,
  studentName,
  loading = false,
  onConfirm,
  onDismiss,
}: WalletTopUpSheetProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");

  const newBalance = currentBalance + parseFloat(amount || "0");
  const canSubmit = parseFloat(amount || "0") > 0 && !loading;
  const needsRef = method === "gcash" || method === "bank_transfer";

  const handleConfirm = (): void => {
    onConfirm({
      amount: parseFloat(amount),
      payment_method: method,
      reference_number: needsRef ? ref || undefined : undefined,
      note: note || undefined,
    });
    setAmount("");
    setRef("");
    setNote("");
  };

  const handleDismiss = (): void => {
    setAmount("");
    setRef("");
    setNote("");
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Top Up — {studentName}
          </Text>
          <Divider />
          <View style={styles.body}>
            <TextInput
              label="Amount (₱)"
              mode="outlined"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.input}
              accessibilityLabel="Top up amount"
            />
            <FilterChipRow>
              {METHODS.map((m) => (
                <FilterChip
                  key={m.key}
                  label={m.label}
                  active={method === m.key}
                  onPress={() => setMethod(m.key)}
                />
              ))}
            </FilterChipRow>
            {needsRef && (
              <TextInput
                label="Reference Number"
                mode="outlined"
                value={ref}
                onChangeText={setRef}
                style={styles.input}
                accessibilityLabel="Payment reference number"
              />
            )}
            <TextInput
              label="Note (optional)"
              mode="outlined"
              value={note}
              onChangeText={setNote}
              style={styles.input}
              accessibilityLabel="Top up note"
            />
            {parseFloat(amount || "0") > 0 && (
              <View style={styles.preview}>
                <Text variant="bodySmall" style={styles.previewLabel}>
                  New Balance After Top-Up
                </Text>
                <Text variant="titleMedium" style={styles.previewValue}>
                  {formatCurrency(newBalance)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <Button onPress={handleDismiss} disabled={loading}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              Top Up
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 20 },
  surface: { borderRadius: 16, overflow: "hidden" },
  heading: { padding: 20, fontWeight: "700", color: palette.zinc950 },
  body: { padding: 20, gap: 12 },
  input: { backgroundColor: palette.white },
  preview: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  previewLabel: { color: palette.zinc500 },
  previewValue: { color: palette.green500, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 8,
  },
});
