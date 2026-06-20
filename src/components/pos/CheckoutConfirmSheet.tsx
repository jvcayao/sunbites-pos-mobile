import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text } from 'react-native-paper'
import { formatCurrency } from '@/lib/formatters'
import { palette } from '@/theme'
import type { CartItem } from '@/store/cart'
import type { OrderPaymentMethod } from '@/types/order'
import type { PosStudent } from '@/types/student'

interface CheckoutConfirmSheetProps {
  visible: boolean
  student: PosStudent | null
  isWalkIn: boolean
  items: CartItem[]
  subtotal: number
  discountAmount: number
  total: number
  paymentMethod: OrderPaymentMethod
  amountTendered?: number
  loading?: boolean
  onConfirm: () => void
  onDismiss: () => void
}

export function CheckoutConfirmSheet({
  visible,
  student,
  isWalkIn,
  items,
  subtotal,
  discountAmount,
  total,
  paymentMethod,
  amountTendered,
  loading = false,
  onConfirm,
  onDismiss,
}: CheckoutConfirmSheetProps) {
  const change = amountTendered !== undefined ? amountTendered - total : undefined

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>Confirm Order</Text>
          <Divider />
          <View style={styles.body}>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.key}>Customer</Text>
              <Text variant="bodyMedium" style={styles.val}>
                {student?.full_name ?? (isWalkIn ? 'Walk-in' : '—')}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.key}>Items</Text>
              <Text variant="bodyMedium" style={styles.val}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.row}>
                <Text variant="bodyMedium" style={styles.key}>Subtotal</Text>
                <Text variant="bodyMedium" style={styles.val}>{formatCurrency(subtotal)}</Text>
              </View>
            )}
            {discountAmount > 0 && (
              <View style={styles.row}>
                <Text variant="bodyMedium" style={styles.key}>Discount</Text>
                <Text variant="bodyMedium" style={[styles.val, styles.discount]}>
                  −{formatCurrency(discountAmount)}
                </Text>
              </View>
            )}
            <View style={[styles.row, styles.totalRow]}>
              <Text variant="titleMedium" style={styles.totalKey}>Total</Text>
              <Text variant="titleMedium" style={styles.totalVal}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.key}>Payment</Text>
              <Text variant="bodyMedium" style={[styles.val, styles.method]}>{paymentMethod}</Text>
            </View>
            {change !== undefined && change >= 0 && (
              <View style={styles.row}>
                <Text variant="bodyMedium" style={styles.key}>Change</Text>
                <Text variant="bodyMedium" style={[styles.val, styles.change]}>
                  {formatCurrency(change)}
                </Text>
              </View>
            )}
          </View>
          <Divider />
          <View style={styles.actions}>
            <Button onPress={onDismiss} disabled={loading} accessibilityRole="button">Cancel</Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Confirm and process payment"
            >
              Confirm & Pay
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  key: { color: palette.zinc500 },
  val: { color: palette.zinc950 },
  discount: { color: palette.orange500 },
  method: { textTransform: 'capitalize', fontWeight: '600', color: palette.zinc950 },
  change: { color: palette.green500, fontWeight: '600' },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.zinc200, paddingTop: 12 },
  totalKey: { color: palette.zinc950, fontWeight: '700' },
  totalVal: { color: palette.orange500, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
