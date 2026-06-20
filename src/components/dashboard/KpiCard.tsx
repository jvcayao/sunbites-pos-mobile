import { StyleSheet, View } from 'react-native'
import { Surface, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MonoText } from '@/components/shared/MonoText'
import { palette } from '@/theme'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

interface KpiCardProps {
  label: string
  value: string | number
  icon?: IconName
  iconColor?: string
}

export function KpiCard({ label, value, icon, iconColor = palette.orange500 }: KpiCardProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text variant="labelSmall" style={styles.label}>{label}</Text>
          <MonoText size="lg" weight="bold" color={palette.zinc950}>{String(value)}</MonoText>
        </View>
        {icon !== undefined && (
          <View style={[styles.iconBg, { backgroundColor: iconColor + '20' }]}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={iconColor}
              accessibilityElementsHidden
            />
          </View>
        )}
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    backgroundColor: palette.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { flex: 1 },
  label: {
    color: palette.zinc500,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
