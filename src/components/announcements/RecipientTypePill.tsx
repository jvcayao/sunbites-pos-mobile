import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { palette } from "@/theme";
import type { RecipientType } from "@/types/announcement";

interface RecipientTypePillProps {
  value: RecipientType;
  onChange: (type: RecipientType) => void;
}

const OPTIONS: { value: RecipientType; label: string }[] = [
  { value: "parents", label: "Parents" },
  { value: "staff", label: "Staff" },
];

export function RecipientTypePill({
  value,
  onChange,
}: RecipientTypePillProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            testID={`pill-${opt.value}`}
            onPress={() => {
              if (!isSelected) onChange(opt.value);
            }}
            style={[styles.pill, isSelected && styles.pillSelected]}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              variant="labelMedium"
              style={[styles.label, isSelected && styles.labelSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 0,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.zinc200,
    alignSelf: "flex-start",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: palette.white,
  },
  pillSelected: { backgroundColor: palette.orange500 },
  label: { color: palette.zinc500 },
  labelSelected: { color: palette.white, fontWeight: "600" },
});
