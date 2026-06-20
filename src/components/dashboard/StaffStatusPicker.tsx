import { StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { palette } from "@/theme";
import type { StaffStatus } from "@/types/dashboard";

const STATUSES: { key: StaffStatus; label: string; color: string }[] = [
  { key: "Working", label: "Working", color: palette.green500 },
  { key: "Off", label: "Off", color: palette.zinc500 },
  { key: "OnLeave", label: "On Leave", color: palette.blue500 },
  { key: "Emergency", label: "Emergency", color: palette.red500 },
  { key: "OnBreak", label: "On Break", color: palette.yellow500 },
];

interface StaffStatusPickerProps {
  visible: boolean;
  staffName: string;
  currentStatus: StaffStatus;
  loading?: boolean;
  onSelect: (status: StaffStatus) => void;
  onDismiss: () => void;
}

export function StaffStatusPicker({
  visible,
  staffName,
  currentStatus,
  loading = false,
  onSelect,
  onDismiss,
}: StaffStatusPickerProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Update Status — {staffName}
          </Text>
          <Divider />
          {STATUSES.map((s) => (
            <TouchableRipple
              key={s.key}
              onPress={() => onSelect(s.key)}
              disabled={loading}
              style={[
                styles.option,
                currentStatus === s.key && styles.optionActive,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: currentStatus === s.key }}
              accessibilityLabel={s.label}
            >
              <View style={styles.optionRow}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text
                  variant="bodyLarge"
                  style={
                    currentStatus === s.key
                      ? styles.activeText
                      : styles.optionText
                  }
                >
                  {s.label}
                </Text>
              </View>
            </TouchableRipple>
          ))}
          <View style={styles.footer}>
            <Button onPress={onDismiss} accessibilityRole="button">
              Cancel
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 24 },
  surface: { borderRadius: 16, overflow: "hidden" },
  heading: {
    padding: 20,
    color: palette.zinc950,
    fontWeight: "600",
  },
  option: {
    minHeight: 52,
    justifyContent: "center",
  },
  optionActive: { backgroundColor: palette.zinc100 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: { color: palette.zinc900 },
  activeText: { color: palette.zinc900, fontWeight: "700" },
  footer: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
