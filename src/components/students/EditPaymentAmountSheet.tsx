import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { palette } from '@/theme'

interface EditPaymentAmountSheetProps {
  visible: boolean
  currentAmount: number
  loading?: boolean
  onConfirm: (amount: number) => void
  onDismiss: () => void
}

export function EditPaymentAmountSheet({ visible, currentAmount, loading = false, onConfirm, onDismiss }: EditPaymentAmountSheetProps) {
  const [amount, setAmount] = useState(String(currentAmount))
  const parsed = parseFloat(amount || '0')
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>Edit Payment Amount</Text>
          <Divider />
          <View style={styles.body}>
            <TextInput label="Amount (₱)" mode="outlined" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Payment amount" />
          </View>
          <View style={styles.actions}>
            <Button onPress={onDismiss} disabled={loading}>Cancel</Button>
            <Button mode="contained" onPress={() => onConfirm(parsed)} loading={loading} disabled={parsed <= 0 || loading} accessibilityRole="button">Save</Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 20 },
  surface: { borderRadius: 16, overflow: 'hidden' },
  heading: { padding: 20, fontWeight: '700', color: palette.zinc950 },
  body: { padding: 20 },
  input: { backgroundColor: palette.white },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
