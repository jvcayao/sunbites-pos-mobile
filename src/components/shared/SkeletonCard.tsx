import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { palette } from '@/theme'

interface SkeletonCardProps {
  count?: number
}

function SkeletonCardItem({ opacity }: { opacity: Animated.AnimatedInterpolation<number> }) {
  return (
    <Animated.View style={[styles.card, { opacity }]} accessibilityElementsHidden />
  )
}

export function SkeletonCard({ count = 5 }: SkeletonCardProps) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [shimmer])

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  })

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardItem key={i} opacity={opacity} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  card: {
    height: 80,
    borderRadius: 12,
    backgroundColor: palette.zinc200,
  },
})
