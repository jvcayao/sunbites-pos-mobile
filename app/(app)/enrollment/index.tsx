import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { ActivityIndicator, Appbar, Button, Text, TextInput } from 'react-native-paper'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { useEnrollmentFormData, useEnrollStudent } from '@/hooks/useEnrollment'
import { enrollSchema } from '@/lib/schemas/enrollment'
import type { EnrollFormData } from '@/lib/schemas/enrollment'
import { getApiError } from '@/lib/errors'
import { useToast } from '@/components/shared/ErrorToast'
import { SectionCard } from '@/components/shared/SectionCard'
import { InlineError } from '@/components/shared/InlineError'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { EnrollmentTypeSelector } from '@/components/enrollment/EnrollmentTypeSelector'
import { SubscriptionPeriodForm } from '@/components/enrollment/SubscriptionPeriodForm'
import { ContactForm } from '@/components/enrollment/ContactForm'
import { PermissionsSection } from '@/components/enrollment/PermissionsSection'
import { EnrollmentSuccess } from '@/components/enrollment/EnrollmentSuccess'
import { GRADE_LEVELS } from '@/lib/constants'
import { palette } from '@/theme'
import type { EnrolledStudentResponse } from '@/types/enrollment'

export default function EnrollmentScreen() {
  const { user } = useAuthStore()
  const { data: formData, isLoading: formLoading } = useEnrollmentFormData()
  const { mutate: enroll, isPending } = useEnrollStudent()
  const toast = useToast()
  const [enrolled, setEnrolled] = useState<EnrolledStudentResponse | null>(null)

  const isAdmin = user?.roles.includes('admin') ?? false
  const userBranchId = user?.branches[0]?.id ?? 0

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<EnrollFormData>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      branch_id: isAdmin ? 0 : userBranchId,
      student_type: 'non_subscription',
      first_name: '',
      last_name: '',
      grade_level: '',
      birthday: '',
      contacts: [{
        full_name: '', relationship: 'Mother', phone: '', email: '', address: '', is_primary: true,
      }],
      permission_meals: false as any,
      permission_allergies: false as any,
      signature: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' })
  const studentType = watch('student_type')

  const onSubmit = (data: EnrollFormData): void => {
    enroll(data as any, {
      onSuccess: (result) => setEnrolled(result as EnrolledStudentResponse),
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  if (enrolled !== null) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="Enrollment" />
        </Appbar.Header>
        <EnrollmentSuccess student={enrolled} onEnrollAnother={() => { setEnrolled(null); reset() }} />
      </View>
    )
  }

  if (formLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.orange500} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Student Enrollment" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Branch Selection (admin only) */}
          {isAdmin && (
            <SectionCard>
              <Text variant="titleSmall" style={styles.sectionTitle}>Branch</Text>
              <Controller
                control={control}
                name="branch_id"
                render={({ field: { value, onChange }, fieldState }) => (
                  <>
                    <FilterChipRow>
                      {(formData?.branches ?? user?.branches ?? []).map((b) => (
                        <FilterChip key={b.id} label={b.name} active={value === b.id} onPress={() => onChange(b.id)} />
                      ))}
                    </FilterChipRow>
                    <InlineError message={fieldState.error?.message} />
                  </>
                )}
              />
            </SectionCard>
          )}

          {/* Enrollment Type */}
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>Enrollment Type</Text>
            <Controller
              control={control}
              name="student_type"
              render={({ field: { value, onChange } }) => (
                <EnrollmentTypeSelector value={value} onChange={onChange} />
              )}
            />
          </SectionCard>

          {/* Subscription Period */}
          {studentType === 'subscription' && (
            <SectionCard>
              <Text variant="titleSmall" style={styles.sectionTitle}>Subscription Period</Text>
              <SubscriptionPeriodForm control={control} />
            </SectionCard>
          )}

          {/* Student Information */}
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>Student Information</Text>
            <View style={styles.fieldGroup}>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View style={styles.halfField}>
                    <TextInput label="First Name *" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} error={!!fieldState.error} style={styles.input} accessibilityLabel="First name" />
                    <InlineError message={fieldState.error?.message} />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View style={styles.halfField}>
                    <TextInput label="Last Name *" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} error={!!fieldState.error} style={styles.input} accessibilityLabel="Last name" />
                    <InlineError message={fieldState.error?.message} />
                  </View>
                )}
              />
            </View>

            <Controller
              control={control}
              name="grade_level"
              render={({ field: { value, onChange }, fieldState }) => (
                <View>
                  <Text variant="labelSmall" style={styles.fieldLabel}>Grade Level *</Text>
                  <FilterChipRow>
                    {GRADE_LEVELS.map((g) => (
                      <FilterChip key={g} label={g} active={value === g} onPress={() => onChange(g)} />
                    ))}
                  </FilterChipRow>
                  <InlineError message={fieldState.error?.message} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="birthday"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View>
                  <TextInput label="Birthday * (YYYY-MM-DD)" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" maxLength={10} error={!!fieldState.error} style={styles.input} accessibilityLabel="Birthday" />
                  <InlineError message={fieldState.error?.message} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="allergies"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput label="Allergies (optional)" mode="outlined" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} multiline style={styles.input} accessibilityLabel="Allergies" />
              )}
            />
          </SectionCard>

          {/* Contacts */}
          {fields.map((field, index) => (
            <SectionCard key={field.id}>
              <ContactForm
                index={index}
                control={control}
                canRemove={index > 0}
                onRemove={() => remove(index)}
              />
            </SectionCard>
          ))}

          {fields.length < 3 && (
            <Button
              mode="outlined"
              icon="account-plus"
              onPress={() => append({ full_name: '', relationship: 'Guardian', phone: '', email: '', address: '' })}
              style={styles.addContactBtn}
              accessibilityRole="button"
            >
              Add Another Contact
            </Button>
          )}

          {errors.contacts?.root !== undefined && (
            <InlineError message={errors.contacts.root.message} />
          )}

          {/* Permissions */}
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>Permissions & Acknowledgement</Text>
            <PermissionsSection control={control} />
          </SectionCard>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
            style={styles.submitBtn}
            contentStyle={styles.submitContent}
            accessibilityRole="button"
            accessibilityLabel="Submit enrollment"
          >
            Submit Enrollment
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  flex: { flex: 1 },
  appbar: { backgroundColor: palette.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 16 },
  sectionTitle: { fontWeight: '700', color: palette.zinc950, marginBottom: 12 },
  fieldGroup: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  fieldLabel: { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: palette.white },
  addContactBtn: { marginVertical: 4 },
  submitBtn: { marginTop: 8, marginBottom: 32 },
  submitContent: { paddingVertical: 8 },
})
