import { useRef } from 'react'
import { Animated } from 'react-native'

export const duration = {
  press:       80,
  micro:       200,
  standard:    250,
  sheetEnter:  320,
  sheetExit:   200,
  toast:       250,
  fade:        150,
} as const

export function usePressScale(toScale = 0.97): {
  scale: Animated.AnimatedInterpolation<number>
  onPressIn: () => void
  onPressOut: () => void
} {
  const anim = useRef(new Animated.Value(0)).current
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, toScale] })

  function onPressIn(): void {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  function onPressOut(): void {
    Animated.spring(anim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  return { scale, onPressIn, onPressOut }
}

export function createSkeletonAnim(): Animated.Value {
  const opacity = new Animated.Value(0.4)
  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
    ])
  ).start()
  return opacity
}
