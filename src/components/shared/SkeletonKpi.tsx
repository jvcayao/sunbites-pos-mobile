import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { palette } from '@/theme'

interface SkeletonKpiProps {
  count?: number
  columns?: number
}

function SkeletonKpiItem({ opacity }: { opacity: Animated.AnimatedInterpolation<number> }) {
  return (
    <Animated.View style={[styles.card, { opacity }]} accessibilityElementsHidden />
  )
}

export function SkeletonKpi({ count = 6, columns = 2 }: SkeletonKpiProps) {
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
    <View style={[styles.grid, { gap: 12 }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1 / columns, minWidth: 0 }}>
          <SkeletonKpiItem opacity={opacity} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  card: {
    height: 88,
    borderRadius: 12,
    backgroundColor: palette.zinc200,
  },
})
