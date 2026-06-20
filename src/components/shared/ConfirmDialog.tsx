import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { palette } from "@/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  confirmColor?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  confirmColor = palette.red500,
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        {message !== undefined && (
          <Dialog.Content>
            <Text variant="bodyMedium">{message}</Text>
          </Dialog.Content>
        )}
        <Dialog.Actions>
          <Button
            onPress={onDismiss}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            textColor={confirmColor}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
  },
});
