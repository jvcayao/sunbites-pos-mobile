import { useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { createSkeletonAnim } from '@/lib/animation'
import { palette } from '@/theme'

interface SkeletonRowProps {
  count?: number
}

function SkeletonRowItem({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[styles.row, { opacity }]} accessibilityElementsHidden />
  )
}

export function SkeletonRow({ count = 5 }: SkeletonRowProps) {
  const opacity = useRef(createSkeletonAnim()).current

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
