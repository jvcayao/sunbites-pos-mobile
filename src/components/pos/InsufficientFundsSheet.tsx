import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text } from 'react-native-paper'
import { formatCurrency } from '@/lib/formatters'
import { palette } from '@/theme'

interface InsufficientFundsSheetProps {
  visible: boolean
  walletBalance: number
  total: number
  onReload: () => void
  onUseCredit: () => void
  onDismiss: () => void
}

export function InsufficientFundsSheet({
  visible,
  walletBalance,
  total,
  onReload,
  onUseCredit,
  onDismiss,
}: InsufficientFundsSheetProps) {
  const shortfall = total - walletBalance

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>Insufficient Wallet Balance</Text>
          <Divider />
          <View style={styles.body}>
            <Text variant="bodyMedium" style={styles.text}>
              Wallet balance ({formatCurrency(walletBalance)}) is not enough for this order ({formatCurrency(total)}).
            </Text>
            <Text variant="bodyMedium" style={styles.shortfall}>
              Short by {formatCurrency(shortfall)}
            </Text>
          </View>
          <Divider />
          <View style={styles.actions}>
            <Button onPress={onDismiss} accessibilityRole="button">Cancel</Button>
            <Button onPress={onUseCredit} textColor={palette.orange500} accessibilityRole="button">
              Use Credit
            </Button>
            <Button mode="contained" onPress={onReload} accessibilityRole="button">
              Reload
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
  heading: { padding: 20, fontWeight: '700', color: palette.red500 },
  body: { padding: 20, gap: 8 },
  text: { color: palette.zinc900 },
  shortfall: { color: palette.red500, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
