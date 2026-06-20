import { Button, Dialog, Portal, Text } from "react-native-paper";

interface StudentNotFoundDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export function StudentNotFoundDialog({
  visible,
  onDismiss,
}: StudentNotFoundDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Student Not Found</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            No student matched this QR code. Please try scanning again or search
            by name.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} accessibilityRole="button">
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
