import { ScrollView, StyleSheet, View } from 'react-native'
import { Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

interface FilterChipProps {
  label: string
  active: boolean
  onPress: () => void
  accessibilityLabel?: string
}

export function FilterChip({ label, active, onPress, accessibilityLabel }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
    >
      <Text
        variant="labelMedium"
        style={active ? styles.labelActive : styles.labelInactive}
      >
        {label}
      </Text>
    </Pressable>
  )
}

interface FilterChipRowProps {
  children: React.ReactNode
}

export function FilterChipRow({ children }: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <View style={styles.rowInner}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  chipActive: {
    backgroundColor: palette.orange500,
  },
  chipInactive: {
    backgroundColor: palette.zinc100,
  },
  chipPressed: {
    opacity: 0.75,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: palette.zinc900,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rowInner: {
    flexDirection: 'row',
    gap: 8,
  },
})
