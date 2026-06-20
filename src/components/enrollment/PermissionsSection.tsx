import { StyleSheet, View, Pressable } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { format } from "date-fns";
import { InlineError } from "@/components/shared/InlineError";
import { palette } from "@/theme";
import type { EnrollFormData } from "@/lib/schemas/enrollment";

interface PermissionsSectionProps {
  control: Control<EnrollFormData>;
}

function CheckItem({
  checked,
  onToggle,
  label,
  accessLabel,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  accessLabel: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessLabel}
    >
      <MaterialCommunityIcons
        name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
        size={24}
        color={checked ? palette.orange500 : palette.zinc500}
        accessibilityElementsHidden
      />
      <Text variant="bodySmall" style={styles.checkText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PermissionsSection({ control }: PermissionsSectionProps) {
  const today = format(new Date(), "MMMM d, yyyy");

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="permission_meals"
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <CheckItem
              checked={value === true}
              onToggle={() => onChange(value === true ? (false as any) : true)}
              label="I agree — The monthly subscription fee based on the school days will remain payable in full regardless of student absences, late arrivals, and in the event of class suspensions, weather-related announcements, or other circumstances beyond the control of Sunbites Kitchen."
              accessLabel="I agree to the subscription fee terms"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="permission_allergies"
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <CheckItem
              checked={value === true}
              onToggle={() => onChange(value === true ? (false as any) : true)}
              label="I agree — Sunbites Kitchen will continue to make every reasonable effort to provide nutritious and quality meals throughout the subscription period. By checking this box and submitting this registration form, I confirm that I have read, understood, and agree to the terms of the Monthly Meal Subscription Program."
              accessLabel="I agree to the meal program terms"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <View style={styles.signatureRow}>
        <Controller
          control={control}
          name="signature"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <View style={styles.signatureField}>
              <TextInput
                label="Put your full name as your signature *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!fieldState.error}
                placeholder="Type your full name as signature"
                style={styles.input}
                accessibilityLabel="Digital signature"
              />
              <InlineError message={fieldState.error?.message} />
            </View>
          )}
        />

        <View style={styles.dateField}>
          <TextInput
            label="Date"
            mode="outlined"
            value={today}
            editable={false}
            style={styles.input}
            accessibilityLabel="Date"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    minHeight: 44,
    paddingVertical: 4,
  },
  checkText: { flex: 1, color: palette.zinc900, marginTop: 2 },
  signatureRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  signatureField: { flex: 3 },
  dateField: { flex: 2 },
  input: { backgroundColor: palette.white },
});
