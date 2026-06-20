import { MD3LightTheme } from 'react-native-paper'
import type { MD3Theme } from 'react-native-paper'

/**
 * Color palette — Sunbites brand colors.
 *
 * Primary brand color: #E7000B (Sunbites red)
 * All other tokens inherited from ~/sunbites-pos globals.css (OKLch → hex).
 *
 * Web token                → Hex         → MD3 role
 * --color-primary          → #E7000B     → primary (brand red)
 * --color-background       → #FFFFFF     → background
 * --color-foreground       → #09090B     → onSurface (zinc-950)
 * --color-muted            → #F4F4F5     → surfaceVariant (zinc-100)
 * --color-muted-foreground → #71717A     → onSurfaceVariant (zinc-500)
 * --color-border           → #E4E4E7     → outline (zinc-200)
 * --color-sidebar          → #FAFAFA     → surface (zinc-50)
 * --color-destructive      → #EF4444     → error (red-500)
 */
export const palette = {
  // Brand primary — Sunbites red
  orange500: '#E7000B',
  orange100: '#FFE4E4',
  orange900: '#8B0007',
  // Neutral grays
  zinc950:   '#09090B',
  zinc900:   '#18181B',
  zinc500:   '#71717A',
  zinc200:   '#E4E4E7',
  zinc100:   '#F4F4F5',
  zinc50:    '#FAFAFA',
  white:     '#FFFFFF',
  // Semantic
  red500:    '#EF4444',
  red50:     '#FEF2F2',
  green500:  '#22C55E',
  green100:  '#DCFCE7',
  yellow500: '#EAB308',
  yellow100: '#FEF9C3',
  blue500:   '#3B82F6',
  blue100:   '#DBEAFE',
}

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary — Sunbites brand red #E7000B
    primary:            palette.orange500,
    onPrimary:          palette.white,
    primaryContainer:   palette.orange100,
    onPrimaryContainer: palette.orange900,
    // Secondary — muted gray
    secondary:            palette.zinc100,
    onSecondary:          palette.zinc900,
    secondaryContainer:   palette.zinc100,
    onSecondaryContainer: palette.zinc900,
    // Surface & background
    background:         palette.white,
    onBackground:       palette.zinc950,
    surface:            palette.white,
    onSurface:          palette.zinc950,
    surfaceVariant:     palette.zinc100,
    onSurfaceVariant:   palette.zinc500,
    // Outline
    outline:            palette.zinc200,
    outlineVariant:     palette.zinc200,
    // Error
    error:              palette.red500,
    onError:            palette.white,
    errorContainer:     palette.red50,
    onErrorContainer:   '#7F1D1D',
    // Inverse
    inverseSurface:     palette.zinc950,
    inverseOnSurface:   palette.white,
    inversePrimary:     palette.orange100,
    // Scrim & shadow
    scrim:              '#000000',
    shadow:             '#000000',
    // Elevation surfaces
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: palette.zinc50,
      level2: palette.zinc100,
      level3: palette.zinc100,
      level4: palette.zinc100,
      level5: palette.zinc100,
    },
  },
}
