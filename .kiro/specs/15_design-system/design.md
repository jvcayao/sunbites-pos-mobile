# Design — 15 Design System

## File Structure

```
src/
  theme/
    index.ts          ← existing MD3 theme — add fontFamily tokens only
    fonts.ts          ← NEW: font family constants + useFonts() config
  lib/
    constants.ts      ← extend with spacing + radius + animation tokens
    animation.ts      ← NEW: centralised Animated/Reanimated timing helpers
  components/
    shared/
      AppLogo.tsx     ← UPDATE: use sunbites.png via expo-image
      MonoText.tsx    ← NEW: DM Mono financial text wrapper
      StatusBadge.tsx ← NEW: unified status badge (replaces ad-hoc badge logic)
```

---

## Font Loading (`src/theme/fonts.ts`)

```typescript
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  DMMono_400Regular,
  DMMono_700Bold,
} from '@expo-google-fonts/dm-mono'

export const fontAssets = {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  DMMono_400Regular,
  DMMono_700Bold,
}

export const FontFamily = {
  // Space Grotesk — headings, display
  grotesk: {
    regular:  'SpaceGrotesk_400Regular',
    medium:   'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold:     'SpaceGrotesk_700Bold',
  },
  // DM Sans — body, labels
  sans: {
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
    bold:    'DMSans_700Bold',
  },
  // DM Mono — all financial/identifier values
  mono: {
    regular: 'DMMono_400Regular',
    bold:    'DMMono_700Bold',
  },
} as const
```

### Root Layout Integration (`app/_layout.tsx`)

```typescript
import { useFonts } from 'expo-font'
import { fontAssets } from '@/theme/fonts'

// Inside AppBootstrap:
const [fontsLoaded] = useFonts(fontAssets)
if (!fontsLoaded && !ready) return <SplashScreen />
```

---

## MD3 Theme Extension (`src/theme/index.ts`)

Add `fonts` overrides to `lightTheme` after existing palette:

```typescript
import { FontFamily } from './fonts'

export const lightTheme = {
  ...MD3LightTheme,
  colors: { /* existing — unchanged */ },
  fonts: {
    ...MD3LightTheme.fonts,
    // Section headers, page titles → Space Grotesk
    headlineLarge:  { ...MD3LightTheme.fonts.headlineLarge,  fontFamily: FontFamily.grotesk.bold },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: FontFamily.grotesk.semibold },
    headlineSmall:  { ...MD3LightTheme.fonts.headlineSmall,  fontFamily: FontFamily.grotesk.semibold },
    titleLarge:     { ...MD3LightTheme.fonts.titleLarge,     fontFamily: FontFamily.grotesk.bold },
    // Labels, body → DM Sans
    bodyLarge:   { ...MD3LightTheme.fonts.bodyLarge,   fontFamily: FontFamily.sans.regular },
    bodyMedium:  { ...MD3LightTheme.fonts.bodyMedium,  fontFamily: FontFamily.sans.regular },
    bodySmall:   { ...MD3LightTheme.fonts.bodySmall,   fontFamily: FontFamily.sans.regular },
    labelLarge:  { ...MD3LightTheme.fonts.labelLarge,  fontFamily: FontFamily.sans.medium },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: FontFamily.sans.medium },
    labelSmall:  { ...MD3LightTheme.fonts.labelSmall,  fontFamily: FontFamily.sans.medium },
  },
}
```

---

## Spacing & Animation Constants (`src/lib/constants.ts`)

Append to existing constants:

```typescript
// FlatList floating card — applied to every renderItem root View
export const listCardStyle = {
  marginHorizontal: 12,
  marginBottom:     8,
  borderRadius:     10,
  backgroundColor:  '#FFFFFF',
  elevation:        2,
  shadowColor:      '#000000',
  shadowOffset:     { width: 0, height: 1 },
  shadowOpacity:    0.07,
  shadowRadius:     3,
} as const

// 2-column grid variant (use when numColumns={2})
export const listCardStyleGrid = {
  ...listCardStyle,
  marginHorizontal: 6,
} as const

// 4pt spacing grid
export const spacing = {
  space1:  4,
  space2:  8,
  space3:  12,
  space4:  16,
  space5:  20,
  space6:  24,
  space8:  32,
  space10: 40,
  space12: 48,
} as const

export const radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const
```

---

## Animation Helpers (`src/lib/animation.ts`)

```typescript
import { Animated } from 'react-native'

export const duration = {
  press:        80,
  micro:        200,
  standard:     250,
  sheetEnter:   320,
  sheetExit:    200,
  toast:        250,
  fade:         150,
} as const

/** Returns Animated.Value pressed 0→1 and the handlers to spread on Pressable. */
export function usePressScale(toScale = 0.97) {
  const anim = new Animated.Value(0)
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, toScale] })

  function onPressIn() {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }
  function onPressOut() {
    Animated.spring(anim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  return { scale, onPressIn, onPressOut }
}

/** Standard skeleton shimmer — Animated.Value oscillating 0.4 → 0.8 */
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
```

---

## AppLogo Component (`src/components/shared/AppLogo.tsx`)

```typescript
import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

type LogoVariant = 'login' | 'rail' | 'receipt' | 'compact'

interface AppLogoProps {
  variant?: LogoVariant
}

const WIDTHS: Record<LogoVariant, number> = {
  login:   220,
  rail:    140,
  receipt: 120,
  compact: 100,
}
// Wordmark aspect ratio ≈ 3.8:1 (horizontal)
const HEIGHT_RATIO = 1 / 3.8

const wordmarkSource = require('../../../assets/sunbites.png')

export function AppLogo({ variant = 'rail' }: AppLogoProps): React.JSX.Element {
  const w = WIDTHS[variant]
  const h = Math.round(w * HEIGHT_RATIO)

  return (
    <Image
      source={wordmarkSource}
      style={{ width: w, height: h }}
      contentFit="contain"
      cachePolicy="memory-disk"
      accessibilityRole="image"
      accessibilityLabel="Sunbites"
    />
  )
}

// Fallback — shown only if expo-image fails to load the asset
export function AppLogoFallback({ variant = 'rail' }: AppLogoProps): React.JSX.Element {
  const isSmall = variant === 'compact' || variant === 'receipt'
  return (
    <View style={styles.row}>
      <View style={[styles.circle, isSmall && styles.circleSmall]}>
        <Text style={[styles.letter, isSmall && styles.letterSmall]}>S</Text>
      </View>
      <Text style={[styles.name, isSmall && styles.nameSmall]}>Sunbites</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle:      { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.orange500,
                 alignItems: 'center', justifyContent: 'center' },
  circleSmall: { width: 28, height: 28, borderRadius: 14 },
  letter:      { color: '#FFFFFF', fontSize: 18, fontWeight: '900', lineHeight: 22 },
  letterSmall: { fontSize: 13, lineHeight: 16 },
  name:        { color: palette.zinc950, fontSize: 17, fontWeight: '700' },
  nameSmall:   { fontSize: 13 },
})
```

---

## MonoText Component (`src/components/shared/MonoText.tsx`)

```typescript
import { Text, type TextProps } from 'react-native'
import { StyleSheet } from 'react-native'
import { FontFamily } from '@/theme/fonts'
import { palette } from '@/theme'

type MonoSize = 'lg' | 'md' | 'sm'
type MonoWeight = 'regular' | 'bold'

interface MonoTextProps extends Omit<TextProps, 'style'> {
  size?: MonoSize
  weight?: MonoWeight
  color?: string
}

export function MonoText({
  size = 'md',
  weight = 'regular',
  color = palette.zinc950,
  style,
  children,
  ...rest
}: MonoTextProps & { style?: TextProps['style'] }): React.JSX.Element {
  return (
    <Text
      style={[styles[size], styles[weight], { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  lg:      { fontFamily: FontFamily.mono.bold, fontSize: 20, lineHeight: 26 },
  md:      { fontFamily: FontFamily.mono.regular, fontSize: 14, lineHeight: 20 },
  sm:      { fontFamily: FontFamily.mono.regular, fontSize: 12, lineHeight: 16 },
  regular: { fontFamily: FontFamily.mono.regular },
  bold:    { fontFamily: FontFamily.mono.bold },
})
```

---

## StatusBadge Component (`src/components/shared/StatusBadge.tsx`)

```typescript
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { FontFamily } from '@/theme/fonts'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'orange' | 'muted' | 'primary'

interface StatusBadgeProps {
  label: string
  variant: BadgeVariant
  size?: 'sm' | 'md'
}

const COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF9C3', text: '#854D0E' },
  error:   { bg: '#FEE2E2', text: '#991B1B' },
  info:    { bg: '#DBEAFE', text: '#1E40AF' },
  orange:  { bg: '#FFEDD5', text: '#9A3412' },
  muted:   { bg: '#F4F4F5', text: '#52525B' },
  primary: { bg: '#FEE2E2', text: '#B91C1C' },
}

export function StatusBadge({ label, variant, size = 'sm' }: StatusBadgeProps): React.JSX.Element {
  const { bg, text } = COLORS[variant]
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.label, { color: text }, size === 'md' && styles.labelMd]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 5 },
  label:   { fontFamily: FontFamily.sans.medium, fontSize: 11, lineHeight: 14 },
  labelMd: { fontSize: 13, lineHeight: 18 },
})
```

---

## AppHeader Component (`src/components/shared/AppHeader.tsx`)

```typescript
import { StyleSheet, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { AppLogo } from './AppLogo'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'

interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode   // screen-specific actions, rendered LEFT of the bell
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
}: AppHeaderProps): React.JSX.Element {
  const router = useRouter()

  function handleBack() {
    if (onBack !== undefined) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <Appbar.Header style={styles.header}>
      {showBack && (
        <Appbar.BackAction onPress={handleBack} accessibilityLabel="Go back" />
      )}
      <View style={styles.logoWrap}>
        <AppLogo variant="compact" />
      </View>
      <View style={styles.titleWrap}>
        <Appbar.Content
          title={title}
          subtitle={subtitle}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />
      </View>
      {right !== undefined && <View style={styles.actions}>{right}</View>}
      {/* NotificationBell is always rightmost — never moved to `right` prop */}
      <NotificationBell />
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor:  palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  logoWrap: {
    marginRight: 12,
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.sans.semibold,
    fontSize:   15,
    color:      palette.zinc950,
  },
  subtitle: {
    fontFamily: FontFamily.sans.regular,
    fontSize:   12,
    color:      palette.zinc500,
  },
  actions: {
    flexDirection: 'row',
    alignItems:    'center',
  },
})
```

---

## Logo Placement in Existing Screens

| Screen | File | Change |
|---|---|---|
| Login | `app/(auth)/login.tsx` | Replace `<AppLogo>` call → `<AppLogo variant="login" />` |
| Branch select | `app/(auth)/branch.tsx` | Replace `<AppLogo>` call → `<AppLogo variant="compact" />` |
| Receipt modal | `src/components/pos/ReceiptModal.tsx` | `<AppLogo variant="receipt" />` |
| Splash | `src/components/shared/SplashScreen.tsx` | Already uses `splash-icon.png` — no change |
| All app screens | Every file in `app/(app)/` | Logo via `AppHeader` component (see REQ-DS-016) |

---

## Package Installation

```bash
npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono
```

No other new dependencies required — `expo-image` is already installed.
