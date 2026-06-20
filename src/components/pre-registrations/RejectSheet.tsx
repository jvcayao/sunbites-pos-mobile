import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";
import { useRejectPreRegistration } from "@/hooks/usePreRegistrations";
import { palette } from "@/theme";

interface Props {
  preRegistrationId: number;
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export function RejectSheet({
  preRegistrationId,
  visible,
  onDismiss,
  onSuccess,
}: Props): React.JSX.Element {
  const [reason, setReason] = useState("");
  const { mutate: reject, isPending } = useRejectPreRegistration();

  const canSubmit = reason.trim().length >= 10;

  const handleConfirm = (): void => {
    reject(
      { id: preRegistrationId, rejection_reason: reason.trim() },
      { onSuccess },
    );
  };

  const handleDismiss = (): void => {
    setReason("");
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.container}
      >
        <Text variant="titleMedium" style={styles.title}>
          Reject Pre-Registration
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          Please provide a reason. The applicant will be notified by email.
        </Text>

        <TextInput
          testID="rejection-reason-input"
          label="Rejection reason"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          style={styles.input}
          accessibilityLabel="Rejection reason"
        />

        <View style={styles.actions}>
          <Button
            testID="cancel-rejection-btn"
            mode="outlined"
            onPress={handleDismiss}
            style={styles.btn}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            testID="confirm-rejection-btn"
            mode="contained"
            buttonColor={palette.red500}
            onPress={handleConfirm}
            disabled={!canSubmit || isPending}
            loading={isPending}
            style={styles.btn}
            accessibilityState={{ disabled: !canSubmit || isPending }}
          >
            Confirm Rejection
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  title: {
    color: palette.zinc900,
    fontWeight: "700",
  },
  description: {
    color: palette.zinc500,
  },
  input: {
    backgroundColor: palette.white,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 4,
  },
  btn: {
    minWidth: 120,
  },
});
