import { StyleSheet } from 'react-native'
import { Pressable, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { palette } from '@/theme'

type AlertVariant = 'stock' | 'credit'

interface AlertRowProps {
  label: string
  value: string
  sub?: string
  variant: AlertVariant
  onPress?: () => void
}

export function AlertRow({ label, value, sub, variant, onPress }: AlertRowProps) {
  const iconColor = variant === 'credit' ? palette.red500 : palette.yellow500
  const icon = variant === 'credit' ? 'alert-circle' : 'package-variant-remove'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      disabled={onPress === undefined}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={iconColor}
        style={styles.icon}
        accessibilityElementsHidden
      />
      <Text style={styles.label}>{label}</Text>
      {sub !== undefined && <Text style={styles.sub}>{sub}</Text>}
      <Text style={[styles.value, variant === 'credit' && styles.creditValue]}>
        {value}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
    gap: 8,
  },
  pressed: { backgroundColor: palette.zinc100 },
  icon: { width: 24 },
  label: {
    flex: 1,
    fontSize: 14,
    color: palette.zinc950,
  },
  sub: {
    fontSize: 12,
    color: palette.zinc500,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.yellow500,
  },
  creditValue: {
    color: palette.red500,
  },
})
