import { StyleSheet, View } from "react-native";
import { Button, Dialog, Divider, Portal, Text } from "react-native-paper";
import { palette } from "@/theme";
import type { PosStudent } from "@/types/student";

interface ChangeStudentDialogProps {
  visible: boolean;
  current: PosStudent;
  incoming: PosStudent;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ChangeStudentDialog({
  visible,
  current,
  incoming,
  onConfirm,
  onDismiss,
}: ChangeStudentDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Switch Student?</Dialog.Title>
        <Dialog.Content>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text variant="labelSmall" style={styles.label}>
                Current
              </Text>
              <Text variant="bodyMedium">{current.full_name}</Text>
              <Text variant="bodySmall" style={styles.sub}>
                {current.grade_level}
              </Text>
            </View>
            <Text variant="headlineSmall" style={styles.arrow}>
              →
            </Text>
            <View style={styles.col}>
              <Text variant="labelSmall" style={styles.label}>
                New
              </Text>
              <Text variant="bodyMedium" style={styles.incoming}>
                {incoming.full_name}
              </Text>
              <Text variant="bodySmall" style={styles.sub}>
                {incoming.grade_level}
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <Text variant="bodySmall" style={styles.warning}>
            The current cart will be kept. Only the student will change.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} accessibilityRole="button">
            Keep Current
          </Button>
          <Button
            onPress={onConfirm}
            textColor={palette.orange500}
            accessibilityRole="button"
          >
            Switch
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  col: { flex: 1 },
  label: {
    color: palette.zinc500,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  sub: { color: palette.zinc500 },
  incoming: { color: palette.orange500, fontWeight: "600" },
  arrow: { color: palette.zinc500 },
  divider: { marginVertical: 8 },
  warning: { color: palette.zinc500 },
});
