import { StyleSheet, View } from 'react-native'
import { Pressable, Text } from 'react-native'
import { palette } from '@/theme'
import type { StudentType } from '@/types/student'

interface EnrollmentTypeSelectorProps {
  value: StudentType
  onChange: (type: StudentType) => void
}

const OPTIONS: Array<{ key: StudentType; label: string; desc: string }> = [
  { key: 'subscription',     label: 'Subscription',     desc: 'Monthly billing student' },
  { key: 'non_subscription', label: 'Non-Subscription', desc: 'Wallet / walk-in student' },
]

export function EnrollmentTypeSelector({ value, onChange }: EnrollmentTypeSelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[styles.option, value === o.key && styles.optionActive]}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o.key }}
          accessibilityLabel={o.label}
        >
          <Text style={[styles.label, value === o.key && styles.labelActive]}>{o.label}</Text>
          <Text style={styles.desc}>{o.desc}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.zinc200,
    backgroundColor: palette.white,
    minHeight: 60,
    justifyContent: 'center',
  },
  optionActive: {
    borderColor: palette.orange500,
    backgroundColor: palette.orange100,
  },
  label: { fontWeight: '600', color: palette.zinc950, fontSize: 14 },
  labelActive: { color: palette.orange500 },
  desc: { color: palette.zinc500, fontSize: 12, marginTop: 2 },
})
