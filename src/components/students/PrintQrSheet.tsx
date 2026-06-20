import { Share, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
} from "react-native-paper";
import { QrCodeSvg } from "react-native-qr-svg";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { palette } from "@/theme";
import { useState } from "react";

interface PrintQrSheetProps {
  visible: boolean;
  studentName: string;
  qrCode: string;
  onDismiss: () => void;
}

export function PrintQrSheet({
  visible,
  studentName,
  qrCode,
  onDismiss,
}: PrintQrSheetProps) {
  const [cardsPerRow, setCardsPerRow] = useState(2);

  const handleShare = async (): Promise<void> => {
    await Share.share({
      message: `${studentName}\nStudent QR: ${qrCode}`,
      title: `${studentName} QR Code`,
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            QR Code — {studentName}
          </Text>
          <Divider />
          <View style={styles.body}>
            <View style={styles.qrContainer}>
              <QrCodeSvg value={qrCode} frameSize={160} />
              <Text variant="labelSmall" style={styles.qrLabel}>
                {qrCode}
              </Text>
            </View>
            <Text variant="labelSmall" style={styles.perRowLabel}>
              Cards per row
            </Text>
            <FilterChipRow>
              {[2, 4].map((n) => (
                <FilterChip
                  key={n}
                  label={String(n)}
                  active={cardsPerRow === n}
                  onPress={() => setCardsPerRow(n)}
                />
              ))}
            </FilterChipRow>
          </View>
          <View style={styles.actions}>
            <Button onPress={onDismiss} accessibilityRole="button">
              Close
            </Button>
            <Button
              mode="contained"
              icon="share-variant"
              onPress={handleShare}
              accessibilityRole="button"
            >
              Share
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
  body: { padding: 20, alignItems: "center", gap: 16 },
  qrContainer: { alignItems: "center", gap: 8 },
  qrLabel: { color: palette.zinc500, fontFamily: "monospace" },
  perRowLabel: {
    color: palette.zinc500,
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 8,
  },
});
