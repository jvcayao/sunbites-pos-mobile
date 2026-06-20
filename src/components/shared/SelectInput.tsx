import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text } from 'react-native-paper'
import { palette } from '@/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface SelectInputProps {
  label: string
  value: string
  options: readonly string[] | string[]
  onChange: (value: string) => void
  error?: boolean
  accessibilityLabel?: string
}

export function SelectInput({ label, value, options, onChange, error = false, accessibilityLabel }: SelectInputProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const handleSelect = (option: string): void => {
    onChange(option)
    setOpen(false)
  }

  return (
    <>
      <Pressable
        testID="select-input-trigger"
        onPress={() => setOpen(true)}
        style={[styles.field, error && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        <Text
          variant="bodyMedium"
          style={[styles.valueText, !value && styles.placeholder]}
          numberOfLines={1}
        >
          {value || `Select ${label}`}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={palette.zinc500} accessibilityElementsHidden />
      </Pressable>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={styles.modal}
        >
          <Surface style={styles.surface} elevation={4}>
            <Text variant="titleSmall" style={styles.modalTitle}>{label}</Text>
            <Divider />
            <FlatList
              data={options as string[]}
              keyExtractor={(item) => item}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  testID={`select-option-${item}`}
                  onPress={() => handleSelect(item)}
                  style={[styles.option, item === value && styles.optionActive]}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                  accessibilityState={{ selected: item === value }}
                >
                  <Text
                    variant="bodyMedium"
                    style={[styles.optionText, item === value && styles.optionActiveText]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <MaterialCommunityIcons name="check" size={16} color={palette.orange500} accessibilityElementsHidden />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <Divider />}
            />
            <View style={styles.footer}>
              <Button onPress={() => setOpen(false)} accessibilityRole="button">Cancel</Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.zinc200,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: palette.white,
    minHeight: 56,
  },
  fieldError:       { borderColor: palette.red500, borderWidth: 2 },
  valueText:        { color: palette.zinc950, flex: 1 },
  placeholder:      { color: palette.zinc500 },
  modal:            { marginHorizontal: 40 },
  surface:          { borderRadius: 12, overflow: 'hidden', maxHeight: 400 },
  modalTitle:       { padding: 16, fontWeight: '700', color: palette.zinc950 },
  list:             { flexGrow: 0 },
  option:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, minHeight: 48 },
  optionActive:     { backgroundColor: palette.orange100 },
  optionText:       { color: palette.zinc950, flex: 1 },
  optionActiveText: { color: palette.orange500, fontWeight: '600' },
  footer:           { padding: 12, flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.zinc200 },
})
