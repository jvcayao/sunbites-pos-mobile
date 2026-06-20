import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { palette } from '@/theme'
import type { UpdatePreRegistrationDto } from '@/types/pre-registration'

interface Props {
  data: UpdatePreRegistrationDto
  onChange: (update: Partial<UpdatePreRegistrationDto>) => void
}

export function PreRegistrationForm({ data, onChange }: Props): React.JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="labelMedium" style={styles.sectionLabel}>
        Student Information
      </Text>

      <View style={styles.row}>
        <TextInput
          label="First name"
          value={data.first_name ?? ''}
          onChangeText={(v) => onChange({ first_name: v })}
          style={styles.inputHalf}
          mode="outlined"
          accessibilityLabel="First name"
        />
        <TextInput
          label="Last name"
          value={data.last_name ?? ''}
          onChangeText={(v) => onChange({ last_name: v })}
          style={styles.inputHalf}
          mode="outlined"
          accessibilityLabel="Last name"
        />
      </View>

      <TextInput
        label="Student number"
        value={data.student_number ?? ''}
        onChangeText={(v) => onChange({ student_number: v })}
        style={styles.input}
        mode="outlined"
        accessibilityLabel="Student number"
      />

      <View style={styles.row}>
        <TextInput
          label="Grade level"
          value={data.grade_level ?? ''}
          onChangeText={(v) => onChange({ grade_level: v })}
          style={styles.inputHalf}
          mode="outlined"
          accessibilityLabel="Grade level"
        />
        <TextInput
          label="Section"
          value={data.section ?? ''}
          onChangeText={(v) => onChange({ section: v })}
          style={styles.inputHalf}
          mode="outlined"
          accessibilityLabel="Section"
        />
      </View>

      <TextInput
        label="Birthday (YYYY-MM-DD)"
        value={data.birthday ?? ''}
        onChangeText={(v) => onChange({ birthday: v })}
        style={styles.input}
        mode="outlined"
        accessibilityLabel="Birthday"
      />

      <TextInput
        label="Allergies"
        value={data.allergies ?? ''}
        onChangeText={(v) => onChange({ allergies: v })}
        style={styles.input}
        mode="outlined"
        multiline
        accessibilityLabel="Allergies"
      />

      <TextInput
        label="Notes"
        value={data.notes ?? ''}
        onChangeText={(v) => onChange({ notes: v })}
        style={styles.input}
        mode="outlined"
        multiline
        accessibilityLabel="Notes"
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    color: palette.zinc500,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: palette.white,
  },
  inputHalf: {
    flex: 1,
    backgroundColor: palette.white,
  },
})
