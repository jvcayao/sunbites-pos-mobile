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
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { palette } from "@/theme";
import type { EnrollmentStatus } from "@/types/student";

const STATUSES: { key: EnrollmentStatus; label: string; color: string }[] = [
  { key: "enrolled", label: "Enrolled", color: palette.green500 },
  { key: "paused", label: "Paused", color: palette.yellow500 },
  { key: "unenrolled", label: "Unenrolled", color: palette.zinc500 },
  { key: "banned", label: "Banned", color: palette.red500 },
  { key: "graduated", label: "Graduated", color: palette.blue500 },
];

const NEEDS_REASON: EnrollmentStatus[] = ["banned", "unenrolled"];

interface StatusPickerSheetProps {
  visible: boolean;
  currentStatus: EnrollmentStatus;
  loading?: boolean;
  onConfirm: (status: EnrollmentStatus, reason?: string) => void;
  onDismiss: () => void;
}

export function StatusPickerSheet({
  visible,
  currentStatus,
  loading = false,
  onConfirm,
  onDismiss,
}: StatusPickerSheetProps) {
  const [selected, setSelected] = useState<EnrollmentStatus>(currentStatus);
  const [reason, setReason] = useState("");

  const handleConfirm = (): void => {
    onConfirm(selected, NEEDS_REASON.includes(selected) ? reason : undefined);
  };

  const canConfirm =
    !NEEDS_REASON.includes(selected) || reason.trim().length > 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Change Enrollment Status
          </Text>
          <Divider />
          {STATUSES.map((s) => (
            <TouchableRipple
              key={s.key}
              onPress={() => setSelected(s.key)}
              style={[styles.option, selected === s.key && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === s.key }}
            >
              <View style={styles.optionRow}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text
                  variant="bodyLarge"
                  style={selected === s.key ? styles.activeText : styles.text}
                >
                  {s.label}
                </Text>
                {selected === s.key && (
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color={palette.orange500}
                  />
                )}
              </View>
            </TouchableRipple>
          ))}
          {NEEDS_REASON.includes(selected) && (
            <View style={styles.reasonContainer}>
              <TextInput
                label="Reason (required)"
                mode="outlined"
                value={reason}
                onChangeText={setReason}
                multiline
                style={styles.input}
                accessibilityLabel="Status change reason"
              />
            </View>
          )}
          <View style={styles.actions}>
            <Button onPress={onDismiss} disabled={loading}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={!canConfirm || loading}
              accessibilityRole="button"
            >
              Update
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
  option: { minHeight: 52, justifyContent: "center" },
  optionActive: { backgroundColor: palette.zinc100 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1, color: palette.zinc900 },
  activeText: { flex: 1, color: palette.zinc900, fontWeight: "700" },
  reasonContainer: { paddingHorizontal: 20, paddingBottom: 12 },
  input: { backgroundColor: palette.white },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 8,
  },
});
