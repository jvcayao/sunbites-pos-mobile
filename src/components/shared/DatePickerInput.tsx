import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { format, isValid, parseISO } from 'date-fns'
import { palette } from '@/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface DatePickerInputProps {
  label: string
  value: string       // YYYY-MM-DD or ''
  onChange: (value: string) => void
  error?: boolean
  accessibilityLabel?: string
}

function formatDisplay(isoDate: string): string {
  if (!isoDate) return ''
  const parsed = parseISO(isoDate)
  if (!isValid(parsed)) return isoDate
  return format(parsed, 'MMM dd, yyyy')
}

function toIso(year: string, month: number, day: string): string {
  const yy = year.padStart(4, '0')
  const mm = String(month).padStart(2, '0')
  const dd = day.padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function DatePickerInput({ label, value, onChange, error = false, accessibilityLabel }: DatePickerInputProps): React.JSX.Element {
  const [open, setOpen]               = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(1)
  const [dayInput, setDayInput]           = useState<string>('1')
  const [yearInput, setYearInput]         = useState<string>('')

  const handleOpen = (): void => {
    if (value) {
      const parsed = parseISO(value)
      if (isValid(parsed)) {
        setSelectedMonth(parsed.getMonth() + 1)
        setDayInput(String(parsed.getDate()))
        setYearInput(String(parsed.getFullYear()))
      }
    }
    setOpen(true)
  }

  const handleConfirm = (): void => {
    const day  = parseInt(dayInput, 10)
    const year = parseInt(yearInput, 10)
    if (!day || !year || year < 1900 || year > 2099) return
    onChange(toIso(yearInput, selectedMonth, dayInput))
    setOpen(false)
  }

  const displayValue = formatDisplay(value)

  return (
    <>
      <Pressable
        testID="date-picker-trigger"
        onPress={handleOpen}
        style={[styles.field, error && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        <Text
          variant="bodyMedium"
          style={[styles.valueText, !displayValue && styles.placeholder]}
          numberOfLines={1}
        >
          {displayValue || `Select ${label}`}
        </Text>
        <MaterialCommunityIcons name="calendar" size={20} color={palette.zinc500} accessibilityElementsHidden />
      </Pressable>

      <Portal>
        <Modal
          testID="date-picker-modal"
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={styles.modal}
        >
          <Surface style={styles.surface} elevation={4}>
            <Text variant="titleSmall" style={styles.modalTitle}>{label}</Text>
            <Divider />

            <View style={styles.body}>
              {/* Month selector */}
              <View style={styles.monthSection}>
                <Text variant="labelSmall" style={styles.colLabel}>Month</Text>
                <ScrollView style={styles.monthScroll} showsVerticalScrollIndicator>
                  {MONTHS.map((m, idx) => (
                    <Pressable
                      key={m}
                      onPress={() => setSelectedMonth(idx + 1)}
                      style={[styles.monthRow, selectedMonth === idx + 1 && styles.monthRowActive]}
                      accessibilityRole="button"
                      accessibilityLabel={m}
                      accessibilityState={{ selected: selectedMonth === idx + 1 }}
                    >
                      <Text
                        variant="bodyMedium"
                        style={selectedMonth === idx + 1 ? styles.monthTextActive : styles.monthText}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Day + Year inputs */}
              <View style={styles.numericSection}>
                <Text variant="labelSmall" style={styles.colLabel}>Day</Text>
                <TextInput
                  mode="outlined"
                  value={dayInput}
                  onChangeText={setDayInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.numInput}
                  accessibilityLabel="Day"
                />
                <Text variant="labelSmall" style={[styles.colLabel, styles.yearLabel]}>Year</Text>
                <TextInput
                  mode="outlined"
                  value={yearInput}
                  onChangeText={setYearInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.numInput}
                  accessibilityLabel="Year"
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Button onPress={() => setOpen(false)} accessibilityRole="button">Cancel</Button>
              <Button
                testID="date-picker-confirm"
                mode="contained"
                onPress={handleConfirm}
                accessibilityRole="button"
              >
                Confirm
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  )
}

const styles = StyleSheet.create({
  field:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: palette.zinc200, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: palette.white, minHeight: 56 },
  fieldError:      { borderColor: palette.red500, borderWidth: 2 },
  valueText:       { color: palette.zinc950, flex: 1 },
  placeholder:     { color: palette.zinc500 },
  modal:           { marginHorizontal: 24 },
  surface:         { borderRadius: 12, overflow: 'hidden' },
  modalTitle:      { padding: 16, fontWeight: '700', color: palette.zinc950 },
  body:            { flexDirection: 'row', padding: 12, gap: 12 },
  monthSection:    { flex: 2 },
  monthScroll:     { maxHeight: 240 },
  colLabel:        { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 6 },
  monthRow:        { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6 },
  monthRowActive:  { backgroundColor: palette.orange100 },
  monthText:       { color: palette.zinc950 },
  monthTextActive: { color: palette.orange500, fontWeight: '600' },
  numericSection:  { flex: 1, gap: 4 },
  yearLabel:       { marginTop: 12 },
  numInput:        { backgroundColor: palette.white },
  footer:          { padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.zinc200 },
})
