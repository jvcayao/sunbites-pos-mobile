import { StyleSheet, View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { format } from 'date-fns'
import { InlineError } from '@/components/shared/InlineError'
import { palette } from '@/theme'
import type { EnrollFormData } from '@/lib/schemas/enrollment'

interface PermissionsSectionProps {
  control: Control<EnrollFormData>
}

function CheckItem({
  checked,
  onToggle,
  label,
  accessLabel,
}: {
  checked: boolean
  onToggle: () => void
  label: string
  accessLabel: string
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessLabel}
    >
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={checked ? palette.orange500 : palette.zinc500}
        accessibilityElementsHidden
      />
      <Text variant="bodySmall" style={styles.checkText}>{label}</Text>
    </Pressable>
  )
}

export function PermissionsSection({ control }: PermissionsSectionProps) {
  const today = format(new Date(), 'MMMM d, yyyy')

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="permission_meals"
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <CheckItem
              checked={value === true}
              onToggle={() => onChange(value === true ? (false as any) : true)}
              label="I give permission for my child to receive meals provided by Sunbites."
              accessLabel="Permission for meals"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="permission_allergies"
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <CheckItem
              checked={value === true}
              onToggle={() => onChange(value === true ? (false as any) : true)}
              label="I acknowledge that Sunbites will be informed of my child's dietary restrictions and allergies."
              accessLabel="Permission for allergy information"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="signature"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <TextInput
              label="Digital Signature (type your full name)"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!fieldState.error}
              style={styles.input}
              accessibilityLabel="Digital signature"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Text variant="bodySmall" style={styles.date}>Date: {today}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    minHeight: 44,
    paddingVertical: 4,
  },
  checkText: { flex: 1, color: palette.zinc900, marginTop: 2 },
  input: { backgroundColor: palette.white },
  date: { color: palette.zinc500, marginTop: 4 },
})
