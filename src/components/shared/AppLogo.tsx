import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

interface AppLogoProps {
  /** 'full' shows circle + name + tagline. 'icon' shows only the circle. */
  variant?: 'full' | 'icon'
}

export function AppLogo({ variant = 'full' }: AppLogoProps) {
  return (
    <View style={styles.row}>
      {/* Red circle "S" — matches web app sidebar */}
      <View style={styles.circle}>
        <Text style={styles.letter}>S</Text>
      </View>

      {variant === 'full' && (
        <View style={styles.text}>
          <Text style={styles.name}>Sunbites</Text>
          <Text style={styles.tagline}>Your Healthy Kitchen</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  circle: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: palette.orange500,
    alignItems:      'center',
    justifyContent:  'center',
  },
  letter: {
    color:      '#FFFFFF',
    fontSize:   18,
    fontWeight: '900',
    lineHeight: 22,
  },
  text: {
    flexDirection: 'column',
  },
  name: {
    color:      palette.zinc950,
    fontSize:   15,
    fontWeight: '700',
    lineHeight: 18,
  },
  tagline: {
    color:      palette.zinc500,
    fontSize:   11,
    fontWeight: '500',
    lineHeight: 14,
  },
})
