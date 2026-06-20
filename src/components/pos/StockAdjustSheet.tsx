import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { palette } from '@/theme'
import type { StockAdjustDto } from '@/types/pos'

type AdjustType = StockAdjustDto['type']

const TYPES: Array<{ key: AdjustType; label: string }> = [
  { key: 'restock', label: 'Restock' },
  { key: 'waste',   label: 'Waste' },
  { key: 'manual',  label: 'Manual' },
]

interface StockAdjustSheetProps {
  visible: boolean
  itemName: string
  currentQuantity: number
  loading?: boolean
  onConfirm: (data: StockAdjustDto) => void
  onDismiss: () => void
}

export function StockAdjustSheet({
  visible,
  itemName,
  currentQuantity,
  loading = false,
  onConfirm,
  onDismiss,
}: StockAdjustSheetProps) {
  const [type, setType] = useState<AdjustType>('restock')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const handleConfirm = (): void => {
    onConfirm({ type, quantity: parseInt(quantity, 10), notes: notes || undefined })
    setQuantity('')
    setNotes('')
  }

  const handleDismiss = (): void => {
    setQuantity('')
    setNotes('')
    onDismiss()
  }

  const qty = parseInt(quantity || '0', 10)
  const canSubmit = qty > 0 && !loading

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>Adjust Stock — {itemName}</Text>
          <Text variant="bodySmall" style={styles.current}>Current: {currentQuantity}</Text>
          <Divider />
          <View style={styles.body}>
            <FilterChipRow>
              {TYPES.map((t) => (
                <FilterChip
                  key={t.key}
                  label={t.label}
                  active={type === t.key}
                  onPress={() => setType(t.key)}
                />
              ))}
            </FilterChipRow>
            <TextInput
              mode="outlined"
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              style={styles.input}
              accessibilityLabel="Adjustment quantity"
            />
            <TextInput
              mode="outlined"
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              accessibilityLabel="Adjustment notes"
            />
          </View>
          <View style={styles.actions}>
            <Button onPress={handleDismiss} disabled={loading}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              Apply
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 20 },
  surface: { borderRadius: 16, overflow: 'hidden' },
  heading: { paddingHorizontal: 20, paddingTop: 20, fontWeight: '700', color: palette.zinc950 },
  current: { paddingHorizontal: 20, paddingBottom: 12, color: palette.zinc500 },
  body: { padding: 20, gap: 12 },
  input: { backgroundColor: palette.white },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
