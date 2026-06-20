import { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Surface, Text } from 'react-native-paper'
import { formatCurrency } from '@/lib/formatters'
import { palette } from '@/theme'
import type { PosMenuItem } from '@/types/menu'

interface MenuItemCardProps {
  item: PosMenuItem
  cartQuantity: number
  onPress: (item: PosMenuItem) => void
}

const CATEGORY_BADGE: Record<string, { bg: string; text: string }> = {
  meal:  { bg: palette.orange100, text: palette.orange500 },
  snack: { bg: '#FEF9C3',         text: '#854D0E' },
  drink: { bg: palette.blue100,   text: palette.blue500 },
  extra: { bg: palette.zinc100,   text: palette.zinc500 },
}

export const MenuItemCard = function MenuItemCard({ item, cartQuantity, onPress }: MenuItemCardProps) {
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE['extra']
  const isDisabled = !item.is_available || item.inventory_status === 'OUT'

  const handlePress = useCallback(() => onPress(item), [item, onPress])

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatCurrency(item.price)}`}
      accessibilityState={{ disabled: isDisabled }}
    >
      <Surface
        style={[styles.card, cartQuantity > 0 && styles.cardInCart]}
        elevation={1}
      >
        {cartQuantity > 0 && (
          <View style={styles.quantityBadge}>
            <Text variant="labelSmall" style={styles.quantityText}>{cartQuantity}</Text>
          </View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: badge.bg }]}>
          <Text variant="labelSmall" numberOfLines={1} style={{ color: badge.text }}>
            {item.category}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text variant="titleSmall" style={styles.price}>{formatCurrency(item.price)}</Text>
        {item.inventory_status === 'OUT' && (
          <View style={styles.statusBadge}>
            <Text variant="labelSmall" style={styles.outText}>Out of Stock</Text>
          </View>
        )}
        {item.inventory_status === 'LOW' && (
          <View style={[styles.statusBadge, styles.lowBadge]}>
            <Text variant="labelSmall" style={styles.lowText}>Low Stock</Text>
          </View>
        )}
        {!item.has_inventory_mapping && item.inventory_status === null && (
          <View style={[styles.statusBadge, styles.unmappedBadge]}>
            <Text variant="labelSmall" style={styles.unmappedText}>Not Linked</Text>
          </View>
        )}
      </Surface>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  // flex: 1 on both container and card ensures all cards in a row
  // stretch to the same height as the tallest card in that row.
  container: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  card: {
    flex: 1,           // ← fills the Pressable's stretched height
    borderRadius: 12,
    padding: 12,
    backgroundColor: palette.white,
    minHeight: 100,
    gap: 4,
  },
  cardInCart: {
    borderWidth: 2,
    borderColor: palette.orange500,
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: palette.orange500,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  quantityText: { color: '#FFF', fontWeight: '700' },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexShrink: 0,          // never compress — badge must always fit on one line
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  name: { color: palette.zinc950, marginTop: 4 },
  price: { color: palette.orange500, fontWeight: '700' },
  statusBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  lowBadge: { backgroundColor: palette.yellow100 },
  unmappedBadge: { backgroundColor: palette.orange100 },
  outText: { color: palette.red500 },
  lowText: { color: palette.yellow500 },
  unmappedText: { color: palette.orange500 },
})
