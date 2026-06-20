import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { formatDate } from "@/lib/formatters";
import { palette } from "@/theme";

interface AlreadySentParent {
  id: number;
  full_name: string;
  last_sent_at: string;
}

interface Props {
  visible: boolean;
  alreadySentParents: AlreadySentParent[];
  onConfirm: () => void;
  onDismiss: () => void;
}

export function DuplicateWarningSheet({
  visible,
  alreadySentParents,
  onConfirm,
  onDismiss,
}: Props): React.JSX.Element | null {
  if (!visible) return null;

  return (
    <Portal>
      <Dialog
        testID="duplicate-sheet"
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
      >
        <Dialog.Title>Send Again?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.subtitle}>
            These parents already received a reminder this month:
          </Text>
          {alreadySentParents.map((p) => (
            <View key={p.id} style={styles.row}>
              <Text variant="labelMedium">{p.full_name}</Text>
              <Text variant="bodySmall" style={styles.sentDate}>
                Sent: {formatDate(p.last_sent_at, "MMM d, yyyy")}
              </Text>
            </View>
          ))}
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            testID="duplicate-cancel-btn"
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Cancel force send"
          >
            Cancel
          </Button>
          <Button
            testID="duplicate-confirm-btn"
            mode="contained"
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm force send"
          >
            Send Anyway
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { backgroundColor: palette.white },
  subtitle: { color: palette.zinc500, marginBottom: 8 },
  row: { marginBottom: 6 },
  sentDate: { color: palette.zinc500 },
});
