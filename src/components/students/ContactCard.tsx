import { StyleSheet, View } from "react-native";
import { Button, Chip, Surface, Text } from "react-native-paper";
import { palette } from "@/theme";
import type { StudentContact } from "@/types/student";

interface ContactCardProps {
  contact: StudentContact;
  canManage: boolean;
  canResend: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onResendActivation: () => void;
}

const PORTAL_STYLE: Record<string, { bg: string; text: string }> = {
  Activated: { bg: palette.green100, text: palette.green500 },
  "Pending Activation": { bg: palette.yellow100, text: palette.yellow500 },
  "No Email": { bg: palette.zinc100, text: palette.zinc500 },
};

export function ContactCard({
  contact,
  canManage,
  canResend,
  onEdit,
  onDelete,
  onResendActivation,
}: ContactCardProps) {
  const portalStyle =
    PORTAL_STYLE[contact.portal_status] ?? PORTAL_STYLE["No Email"];
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="titleSmall" style={styles.name}>
            {contact.full_name}
          </Text>
          {contact.is_primary && (
            <Chip
              compact
              style={styles.primaryChip}
              textStyle={styles.primaryText}
            >
              Primary
            </Chip>
          )}
        </View>
        <View style={[styles.portalBadge, { backgroundColor: portalStyle.bg }]}>
          <Text variant="labelSmall" style={{ color: portalStyle.text }}>
            {contact.portal_status}
          </Text>
        </View>
      </View>
      <Text variant="bodySmall" style={styles.field}>
        📞 {contact.phone}
      </Text>
      {contact.email !== null && (
        <Text variant="bodySmall" style={styles.field}>
          ✉️ {contact.email}
        </Text>
      )}
      <Text variant="bodySmall" style={styles.field}>
        📍 {contact.address}
      </Text>
      {canManage && (
        <View style={styles.actions}>
          <Button
            compact
            mode="outlined"
            onPress={onEdit}
            accessibilityRole="button"
          >
            Edit
          </Button>
          {canResend && contact.portal_status === "Pending Activation" && (
            <Button
              compact
              mode="text"
              onPress={onResendActivation}
              textColor={palette.blue500}
              accessibilityRole="button"
            >
              Resend Activation
            </Button>
          )}
          <Button
            compact
            mode="text"
            onPress={onDelete}
            textColor={palette.red500}
            accessibilityRole="button"
          >
            Delete
          </Button>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: palette.white },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  name: { color: palette.zinc950, fontWeight: "600" },
  primaryChip: { backgroundColor: palette.orange100, height: 24 },
  primaryText: { color: palette.orange500, fontSize: 11 },
  portalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  field: { color: palette.zinc900 ?? palette.zinc900, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
});
