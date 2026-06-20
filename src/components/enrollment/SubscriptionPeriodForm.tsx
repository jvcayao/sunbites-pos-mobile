import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { InlineError } from '@/components/shared/InlineError'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { palette } from '@/theme'
import type { EnrollFormData } from '@/lib/schemas/enrollment'

const MONTHS = SCHOOL_MONTHS.map((m) => ({
  key: m,
  label: m.charAt(0).toUpperCase() + m.slice(1, 3),
}))

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 1)

interface SubscriptionPeriodFormProps {
  control: Control<EnrollFormData>
}

export function SubscriptionPeriodForm({ control }: SubscriptionPeriodFormProps) {
  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>Start</Text>
      <Controller
        control={control}
        name="subscription_start_month"
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <FilterChipRow>
              {MONTHS.map((m) => (
                <FilterChip key={m.key} label={m.label} active={value === m.key} onPress={() => onChange(m.key)} />
              ))}
            </FilterChipRow>
            <InlineError message={fieldState.error?.message} />
          </>
        )}
      />
      <Controller
        control={control}
        name="subscription_start_year"
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <FilterChipRow>
              {YEARS.map((y) => (
                <FilterChip key={y} label={String(y)} active={value === y} onPress={() => onChange(y)} />
              ))}
            </FilterChipRow>
            <InlineError message={fieldState.error?.message} />
          </>
        )}
      />

      <Text variant="labelMedium" style={[styles.label, styles.labelEnd]}>End</Text>
      <Controller
        control={control}
        name="subscription_end_month"
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <FilterChipRow>
              {MONTHS.map((m) => (
                <FilterChip key={m.key} label={m.label} active={value === m.key} onPress={() => onChange(m.key)} />
              ))}
            </FilterChipRow>
            <InlineError message={fieldState.error?.message} />
          </>
        )}
      />
      <Controller
        control={control}
        name="subscription_end_year"
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <FilterChipRow>
              {YEARS.map((y) => (
                <FilterChip key={y} label={String(y)} active={value === y} onPress={() => onChange(y)} />
              ))}
            </FilterChipRow>
            <InlineError message={fieldState.error?.message} />
          </>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { color: palette.zinc500, textTransform: 'uppercase', marginTop: 8 },
  labelEnd: { marginTop: 16 },
})
