import { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, Text, View } from 'react-native'
import { palette } from '@/theme'

// Drop assets/sunbites.png to show the branded logo.
// Falls back to a plain spinner if the file isn't present yet.
let logoSource: number | null = null
try {
  logoSource = require('../../../assets/sunbites.png')
} catch {
  logoSource = null
}

export function SplashScreen() {
  // ── entrance ────────────────────────────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.75)).current

  // ── pulse loop ───────────────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // 1. Fade + scale in over 500 ms
    const entrance = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue:         1,
        duration:        500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue:         1,
        friction:        5,
        tension:         60,
        useNativeDriver: true,
      }),
    ])

    // 2. Gentle pulse that loops forever after the entrance
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue:         1.07,
          duration:        700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue:         1,
          duration:        700,
          useNativeDriver: true,
        }),
      ]),
    )

    Animated.sequence([entrance, pulse]).start()

    return () => {
      fadeAnim.stopAnimation()
      scaleAnim.stopAnimation()
      pulseAnim.stopAnimation()
    }
  }, [fadeAnim, scaleAnim, pulseAnim])

  return (
    <View style={styles.container}>
      {logoSource !== null ? (
        <Animated.View
          style={{
            opacity:   fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
          }}
        >
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Sunbites logo"
          />
          <Text style={styles.tagline}>Your Healthy Kitchen</Text>
        </Animated.View>
      ) : (
        // Fallback: animated dots while waiting for the logo asset
        <FallbackDots />
      )}
    </View>
  )
}

// ── Fallback when sunbites.png isn't in assets yet ────────────────────────────

function FallbackDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current
  const dot2 = useRef(new Animated.Value(0.3)).current
  const dot3 = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const makeDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1,   duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          Animated.delay(700 - delay),
        ]),
      )

    const a1 = makeDot(dot1, 0)
    const a2 = makeDot(dot2, 200)
    const a3 = makeDot(dot3, 400)
    a1.start(); a2.start(); a3.start()
    return () => { a1.stop(); a2.stop(); a3.stop() }
  }, [dot1, dot2, dot3])

  return (
    <View style={styles.dots}>
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logo: {
    width:  260,
    height: 130,
  },
  tagline: {
    textAlign:   'center',
    marginTop:   8,
    fontSize:    14,
    letterSpacing: 1.5,
    color:       palette.zinc950,
    fontWeight:  '500',
  },
  dots: {
    flexDirection: 'row',
    gap:           12,
  },
  dot: {
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: palette.orange500,
  },
})
