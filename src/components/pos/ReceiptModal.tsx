import { Share, StyleSheet, View } from 'react-native'
import { Appbar, Button, DataTable, Divider, Surface, Text } from 'react-native-paper'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { AppLogo } from '@/components/shared/AppLogo'
import { MonoText } from '@/components/shared/MonoText'
import { palette } from '@/theme'
import type { Order } from '@/types/order'

interface ReceiptModalProps {
  order: Order
  onNewOrder: () => void
}

export function ReceiptModal({ order, onNewOrder }: ReceiptModalProps) {
  const handleShare = async (): Promise<void> => {
    const lines = [
      '=== SUNBITES POS RECEIPT ===',
      `Receipt #: ${order.receipt_number}`,
      `Date: ${formatDate(order.created_at, 'MMM d, yyyy h:mm a')}`,
      `Cashier: ${order.cashier.name}`,
      order.student !== null ? `Student: ${order.student.full_name}` : 'Customer: Walk-in',
      '',
      '--- ITEMS ---',
      ...order.items.map((i) => `${i.name} x${i.quantity}  ${formatCurrency(i.price * i.quantity)}`),
      '',
      parseFloat(order.discount_amount) > 0 ? `Subtotal:  ${formatCurrency(order.subtotal)}` : '',
      parseFloat(order.discount_amount) > 0 ? `Discount:  -${formatCurrency(order.discount_amount)}` : '',
      `TOTAL:     ${formatCurrency(order.total)}`,
      `Payment:   ${order.payment_method?.toUpperCase() ?? '—'}`,
      order.amount_tendered !== null
        ? `Tendered:  ${formatCurrency(order.amount_tendered)}`
        : '',
      order.change_amount !== null && parseFloat(order.change_amount) > 0
        ? `Change:    ${formatCurrency(order.change_amount)}`
        : '',
      '',
      'Thank you!',
    ].filter(Boolean).join('\n')

    await Share.share({ message: lines, title: `Receipt ${order.receipt_number}` })
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Receipt" />
        <Appbar.Action icon="share-variant" onPress={handleShare} accessibilityLabel="Share receipt" />
      </Appbar.Header>

      <Surface style={styles.receipt} elevation={1}>
        <View style={styles.logo}>
          <AppLogo variant="receipt" />
        </View>
        <Text variant="headlineSmall" style={styles.brand}>Sunbites POS</Text>
        <MonoText size="sm" color={palette.zinc500} style={styles.meta}>
          {formatDate(order.created_at, 'MMM d, yyyy  h:mm a')}
        </MonoText>
        <MonoText size="sm" color={palette.zinc500} style={styles.meta}>#{order.receipt_number}</MonoText>
        <Divider style={styles.divider} />

        <DataTable>
          {order.items.map((item) => (
            <DataTable.Row key={item.pos_menu_item_id}>
              <DataTable.Cell>{item.name} ×{item.quantity}</DataTable.Cell>
              <DataTable.Cell numeric>{formatCurrency(item.price * item.quantity)}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        <Divider style={styles.divider} />

        {parseFloat(order.discount_amount) > 0 && (
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <MonoText size="md">{formatCurrency(order.subtotal)}</MonoText>
          </View>
        )}
        {parseFloat(order.discount_amount) > 0 && (
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.discountLabel}>Discount</Text>
            <MonoText size="md" color={palette.orange500}>
              −{formatCurrency(order.discount_amount)}
            </MonoText>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text variant="titleMedium" style={styles.totalLabel}>Total</Text>
          <MonoText size="lg" weight="bold" color={palette.orange500}>{formatCurrency(order.total)}</MonoText>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium" style={styles.method}>{order.payment_method?.toUpperCase() ?? '—'}</Text>
          {order.amount_tendered !== null && (
            <MonoText size="sm" color={palette.zinc500}>
              Tendered {formatCurrency(order.amount_tendered)}
            </MonoText>
          )}
        </View>
        {order.change_amount !== null && parseFloat(order.change_amount) > 0 && (
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Change</Text>
            <MonoText size="md" color={palette.green500}>{formatCurrency(order.change_amount)}</MonoText>
          </View>
        )}
      </Surface>

      <Button
        mode="contained"
        onPress={onNewOrder}
        style={styles.newOrderBtn}
        contentStyle={styles.newOrderContent}
        accessibilityRole="button"
        accessibilityLabel="Start new order"
      >
        New Order
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  receipt: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: palette.white,
  },
  logo: { alignItems: 'center', marginBottom: 8 },
  brand: { textAlign: 'center', fontWeight: '700', color: palette.orange500, marginBottom: 4 },
  meta: { textAlign: 'center', color: palette.zinc500 },
  divider: { marginVertical: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  discountLabel: { color: palette.orange500 },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontWeight: '700', color: palette.zinc950 },
  method: { color: palette.zinc500, textTransform: 'uppercase' },
  newOrderBtn: { margin: 16 },
  newOrderContent: { paddingVertical: 8 },
})
