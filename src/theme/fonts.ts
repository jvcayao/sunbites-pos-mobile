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
  // DM Mono ships only Light/Regular/Medium weights — there is no 700 Bold.
  // Use 500 Medium as the heaviest available weight for the "bold" role.
  DMMono_500Medium,
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
  DMMono_500Medium,
}

export const FontFamily = {
  grotesk: {
    regular:  'SpaceGrotesk_400Regular',
    medium:   'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold:     'SpaceGrotesk_700Bold',
  },
  sans: {
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
    bold:    'DMSans_700Bold',
  },
  mono: {
    regular: 'DMMono_400Regular',
    bold:    'DMMono_500Medium',
  },
} as const
