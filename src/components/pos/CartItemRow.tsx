import { StyleSheet, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { formatCurrency } from '@/lib/formatters'
import { MonoText } from '@/components/shared/MonoText'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { CartItem } from '@/store/cart'

const cartItemCardStyle = {
  ...listCardStyle,
  marginHorizontal: 8,
  marginBottom: 4,
  borderRadius: 8,
  elevation: 1,
  shadowOpacity: 0.05,
  shadowRadius: 2,
} as const

interface CartItemRowProps {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}

export function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  const total = item.menuItem.price * item.quantity
  return (
    <View style={[cartItemCardStyle, styles.row]}>
      <View style={styles.info}>
        <Text variant="bodyMedium" style={styles.name}>{item.menuItem.name}</Text>
        <MonoText size="sm" color={palette.zinc500}>
          {formatCurrency(item.menuItem.price)} each
        </MonoText>
      </View>
      <View style={styles.controls}>
        <IconButton
          icon="minus"
          size={16}
          onPress={onDecrement}
          style={styles.controlBtn}
          accessibilityLabel={`Decrease ${item.menuItem.name}`}
          accessibilityRole="button"
        />
        <Text variant="titleSmall" style={styles.qty}>{item.quantity}</Text>
        <IconButton
          icon="plus"
          size={16}
          onPress={onIncrement}
          style={styles.controlBtn}
          accessibilityLabel={`Increase ${item.menuItem.name}`}
          accessibilityRole="button"
        />
      </View>
      <MonoText size="md" color={palette.zinc950} style={styles.total}>{formatCurrency(total)}</MonoText>
      <IconButton
        icon="close"
        size={16}
        onPress={onRemove}
        iconColor={palette.zinc500}
        accessibilityLabel={`Remove ${item.menuItem.name}`}
        accessibilityRole="button"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  info: { flex: 1 },
  name: { color: palette.zinc950 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  controlBtn: {
    margin: 0,
    width: 32,
    height: 32,
  },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    color: palette.zinc950,
  },
  total: {
    minWidth: 72,
    textAlign: 'right',
  },
})
