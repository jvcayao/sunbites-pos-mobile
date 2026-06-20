import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { usePressScale } from "@/lib/animation";
import { palette } from "@/theme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function FilterChip({
  label,
  active,
  onPress,
  accessibilityLabel,
}: FilterChipProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected: active }}
      >
        <Text
          variant="labelMedium"
          style={active ? styles.labelActive : styles.labelInactive}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface FilterChipRowProps {
  children: React.ReactNode;
}

export function FilterChipRow({ children }: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.rowScroll}
    >
      <View style={styles.rowInner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  chipActive: {
    backgroundColor: palette.orange500,
  },
  chipInactive: {
    backgroundColor: palette.zinc100,
  },
  labelActive: {
    color: "#FFFFFF",
  },
  labelInactive: {
    color: palette.zinc900,
  },
  rowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rowInner: {
    flexDirection: "row",
    gap: 8,
  },
});
