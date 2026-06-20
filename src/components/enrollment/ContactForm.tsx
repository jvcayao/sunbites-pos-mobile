import { StyleSheet, View } from 'react-native'
import { Button, Divider, Text } from 'react-native-paper'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { TextInput } from 'react-native-paper'
import { InlineError } from '@/components/shared/InlineError'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { palette } from '@/theme'
import type { EnrollFormData } from '@/lib/schemas/enrollment'

const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Other'] as const

interface ContactFormProps {
  index: number
  control: Control<EnrollFormData>
  canRemove: boolean
  onRemove: () => void
}

export function ContactForm({ index, control, canRemove, onRemove }: ContactFormProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="labelLarge" style={styles.title}>
          {index === 0 ? 'Primary Contact' : `Contact ${index + 1}`}
        </Text>
        {canRemove && (
          <Button
            mode="text"
            onPress={onRemove}
            textColor={palette.red500}
            compact
            accessibilityRole="button"
            accessibilityLabel={`Remove contact ${index + 1}`}
          >
            Remove
          </Button>
        )}
      </View>
      <Divider style={styles.divider} />

      <Controller
        control={control}
        name={`contacts.${index}.full_name`}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <TextInput
              label="Full Name *"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!fieldState.error}
              style={styles.input}
              accessibilityLabel="Contact full name"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name={`contacts.${index}.relationship`}
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <Text variant="labelSmall" style={styles.fieldLabel}>Relationship *</Text>
            <FilterChipRow>
              {RELATIONSHIPS.map((r) => (
                <FilterChip key={r} label={r} active={value === r} onPress={() => onChange(r)} />
              ))}
            </FilterChipRow>
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name={`contacts.${index}.phone`}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <TextInput
              label="Phone * (09XXXXXXXXX)"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              error={!!fieldState.error}
              style={styles.input}
              accessibilityLabel="Contact phone number"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name={`contacts.${index}.email`}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <TextInput
              label="Email (optional)"
              mode="outlined"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!fieldState.error}
              style={styles.input}
              accessibilityLabel="Contact email address"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name={`contacts.${index}.address`}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <TextInput
              label="Address *"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              error={!!fieldState.error}
              style={styles.input}
              accessibilityLabel="Contact address"
            />
            <InlineError message={fieldState.error?.message} />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: palette.zinc950, fontWeight: '700' },
  divider: { marginBottom: 4 },
  fieldLabel: { color: palette.zinc500, marginBottom: 4, textTransform: 'uppercase' },
  input: { backgroundColor: palette.white },
})
