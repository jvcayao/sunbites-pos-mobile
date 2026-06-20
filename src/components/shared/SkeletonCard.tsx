import { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { createSkeletonAnim } from "@/lib/animation";
import { palette } from "@/theme";

interface SkeletonCardProps {
  count?: number;
}

function SkeletonCardItem({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View
      style={[styles.card, { opacity }]}
      accessibilityElementsHidden
    />
  );
}

export function SkeletonCard({ count = 5 }: SkeletonCardProps) {
  const opacity = useMemo(() => createSkeletonAnim(), []);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardItem key={i} opacity={opacity} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  card: {
    height: 80,
    borderRadius: 12,
    backgroundColor: palette.zinc200,
  },
});
