import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import {
  useApprovePreRegistration,
  useReactivatePreRegistration,
} from "@/hooks/usePreRegistrations";
import { palette } from "@/theme";
import type { PreRegistrationStatus } from "@/types/pre-registration";

interface Props {
  preRegistrationId: number;
  status: PreRegistrationStatus;
  onRejectPress: () => void;
  onReactivatePress: () => void;
  onApproveSuccess: () => void;
}

export function PreRegistrationActions({
  preRegistrationId,
  status,
  onRejectPress,
  onReactivatePress,
  onApproveSuccess,
}: Props): React.JSX.Element | null {
  const { mutate: approve, isPending: isApproving } =
    useApprovePreRegistration();
  const { mutate: reactivate, isPending: isReactivating } =
    useReactivatePreRegistration();

  if (status === "pending") {
    return (
      <View style={styles.container}>
        <Button
          testID="reject-btn"
          mode="outlined"
          onPress={onRejectPress}
          disabled={isApproving}
          style={styles.btn}
          textColor={palette.red500}
        >
          Reject
        </Button>
        <Button
          testID="approve-btn"
          mode="contained"
          onPress={() =>
            approve(preRegistrationId, { onSuccess: onApproveSuccess })
          }
          disabled={isApproving}
          loading={isApproving}
          style={styles.btn}
        >
          Approve &amp; Enroll
        </Button>
      </View>
    );
  }

  if (status === "expired") {
    return (
      <View style={styles.container}>
        <Button
          testID="reactivate-btn"
          mode="contained"
          onPress={() =>
            reactivate(preRegistrationId, { onSuccess: onReactivatePress })
          }
          disabled={isReactivating}
          loading={isReactivating}
          style={styles.btn}
        >
          Reactivate
        </Button>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
  },
  btn: {
    minWidth: 120,
  },
});
