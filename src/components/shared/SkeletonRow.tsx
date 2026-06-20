import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { palette } from '@/theme'

interface SkeletonRowProps {
  count?: number
}

function SkeletonRowItem({ opacity }: { opacity: Animated.AnimatedInterpolation<number> }) {
  return (
    <Animated.View style={[styles.row, { opacity }]} accessibilityElementsHidden />
  )
}

export function SkeletonRow({ count = 5 }: SkeletonRowProps) {
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
        <SkeletonRowItem key={i} opacity={opacity} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 1 },
  row: {
    height: 48,
    backgroundColor: palette.zinc200,
  },
})
