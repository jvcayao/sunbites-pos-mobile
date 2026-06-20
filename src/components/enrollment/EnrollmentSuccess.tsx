import { Share, StyleSheet, View } from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { QrCodeSvg as QRCode } from "react-native-qr-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDate } from "@/lib/formatters";
import { palette } from "@/theme";
import type { EnrolledStudentResponse } from "@/types/enrollment";

interface EnrollmentSuccessProps {
  student: EnrolledStudentResponse;
  onEnrollAnother: () => void;
}

export function EnrollmentSuccess({
  student,
  onEnrollAnother,
}: EnrollmentSuccessProps) {
  const handleShare = async (): Promise<void> => {
    await Share.share({
      message: `Student QR Code\nName: ${student.full_name}\nNumber: ${student.student_number}\nID: ${student.qr_code}`,
      title: `${student.full_name} QR Code`,
    });
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="check-circle"
        size={72}
        color={palette.green500}
        accessibilityElementsHidden
      />
      <Text variant="headlineSmall" style={styles.heading}>
        Enrollment Successful!
      </Text>

      <Surface style={styles.card} elevation={1}>
        <View style={styles.row}>
          <Text variant="labelSmall" style={styles.key}>
            Full Name
          </Text>
          <Text variant="bodyMedium" style={styles.val}>
            {student.full_name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant="labelSmall" style={styles.key}>
            Student #
          </Text>
          <Text variant="bodyMedium" style={styles.val}>
            {student.student_number}
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant="labelSmall" style={styles.key}>
            Type
          </Text>
          <Text variant="bodyMedium" style={styles.val}>
            {student.student_type === "subscription"
              ? "Subscription"
              : "Non-Subscription"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant="labelSmall" style={styles.key}>
            Enrolled
          </Text>
          <Text variant="bodyMedium" style={styles.val}>
            {formatDate(student.enrollment_date)}
          </Text>
        </View>
      </Surface>

      <View style={styles.qrContainer}>
        <QRCode value={student.qr_code} frameSize={180} />
        <Text variant="labelSmall" style={styles.qrLabel}>
          {student.qr_code}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={handleShare}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Share QR code"
        >
          Share QR
        </Button>
        <Button
          mode="contained"
          onPress={onEnrollAnother}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Enroll another student"
        >
          Enroll Another
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  heading: { color: palette.green500, fontWeight: "700" },
  card: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    backgroundColor: palette.white,
    gap: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  key: { color: palette.zinc500, textTransform: "uppercase" },
  val: { color: palette.zinc950, fontWeight: "500" },
  qrContainer: { alignItems: "center", gap: 8 },
  qrLabel: { color: palette.zinc500, fontFamily: "monospace" },
  actions: { flexDirection: "row", gap: 12, width: "100%" },
  btn: { flex: 1 },
});
