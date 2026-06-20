import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { palette } from '@/theme'

interface VoidOrderSheetProps {
  visible: boolean
  receiptNumber: string
  loading?: boolean
  onConfirm: (reason: string) => void
  onDismiss: () => void
}

export function VoidOrderSheet({
  visible,
  receiptNumber,
  loading = false,
  onConfirm,
  onDismiss,
}: VoidOrderSheetProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = (): void => {
    onConfirm(reason)
    setReason('')
  }

  const handleDismiss = (): void => {
    setReason('')
    onDismiss()
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Void Order #{receiptNumber}
          </Text>
          <Divider />
          <View style={styles.body}>
            <Text variant="bodyMedium" style={styles.warning}>
              This action cannot be undone. The order will be marked as voided.
            </Text>
            <TextInput
              mode="outlined"
              label="Void reason (required)"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              style={styles.input}
              accessibilityLabel="Void reason"
            />
          </View>
          <View style={styles.actions}>
            <Button onPress={handleDismiss} disabled={loading}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={reason.trim().length === 0 || loading}
              buttonColor={palette.red500}
              accessibilityRole="button"
            >
              Void Order
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
  heading: { padding: 20, fontWeight: '700', color: palette.zinc950 },
  body: { padding: 20, gap: 12 },
  warning: { color: palette.red500 },
  input: { backgroundColor: palette.white },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
