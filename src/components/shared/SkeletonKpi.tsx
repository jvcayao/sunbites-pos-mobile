import { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { createSkeletonAnim } from "@/lib/animation";
import { palette } from "@/theme";

interface SkeletonKpiProps {
  count?: number;
  columns?: number;
}

function SkeletonKpiItem({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View
      style={[styles.card, { opacity }]}
      accessibilityElementsHidden
    />
  );
}

export function SkeletonKpi({ count = 6, columns = 2 }: SkeletonKpiProps) {
  const opacity = useMemo(() => createSkeletonAnim(), []);

  return (
    <View style={[styles.grid, { gap: 12 }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1 / columns, minWidth: 0 }}>
          <SkeletonKpiItem opacity={opacity} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
  },
  card: {
    height: 88,
    borderRadius: 12,
    backgroundColor: palette.zinc200,
  },
});
