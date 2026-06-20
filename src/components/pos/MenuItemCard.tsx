import { useCallback } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import { Surface, Text } from 'react-native-paper'
import { formatCurrency } from '@/lib/formatters'
import { usePressScale } from '@/lib/animation'
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

// Badge priority (highest wins, each is mutually exclusive for disabled state):
// 1. is_subscription_item === null → greyed, unselectable (no badge shown)
// 2. inventory_status === 'OUT'    → greyed, unselectable, red badge
// 3. !has_inventory_mapping        → greyed, unselectable, orange "Not linked" badge
// 4. inventory_status === 'LOW'    → selectable, yellow badge
// 5. is_subscription_item === true → selectable, blue badge
function getItemState(item: PosMenuItem): {
  isDisabled: boolean
  badge: 'none' | 'out' | 'not_linked' | 'low' | 'subscription'
} {
  if (!item.is_available)                   return { isDisabled: true,  badge: 'none' }
  if (item.is_subscription_item === null)   return { isDisabled: true,  badge: 'none' }
  if (item.inventory_status === 'OUT')      return { isDisabled: true,  badge: 'out' }
  if (!item.has_inventory_mapping)          return { isDisabled: true,  badge: 'not_linked' }
  if (item.inventory_status === 'LOW')      return { isDisabled: false, badge: 'low' }
  if (item.is_subscription_item === true)   return { isDisabled: false, badge: 'subscription' }
  return { isDisabled: false, badge: 'none' }
}

export const MenuItemCard = function MenuItemCard({ item, cartQuantity, onPress }: MenuItemCardProps) {
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE['extra']
  const { isDisabled, badge: statusBadge } = getItemState(item)

  const handlePress = useCallback(() => onPress(item), [item, onPress])
  const { scale, onPressIn, onPressOut } = usePressScale(0.97)

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      style={({ pressed }: { pressed: boolean }) => [
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

        {statusBadge === 'out' && (
          <View style={styles.statusBadge}>
            <Text variant="labelSmall" style={styles.outText}>Out of Stock</Text>
          </View>
        )}
        {statusBadge === 'not_linked' && (
          <View style={[styles.statusBadge, styles.unmappedBadge]}>
            <Text variant="labelSmall" style={styles.unmappedText}>Not linked</Text>
          </View>
        )}
        {statusBadge === 'low' && (
          <View style={[styles.statusBadge, styles.lowBadge]}>
            <Text variant="labelSmall" style={styles.lowText}>Low Stock</Text>
          </View>
        )}
        {statusBadge === 'subscription' && (
          <View style={[styles.statusBadge, styles.subscriptionBadge]}>
            <Text variant="labelSmall" style={styles.subscriptionText}>Subscription</Text>
          </View>
        )}
      </Surface>
    </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0 },
  pressed:   { opacity: 0.85 },
  disabled:  { opacity: 0.4 },
  card: {
    flex: 1,
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
  quantityText:   { color: '#FFF', fontWeight: '700' },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  name:  { color: palette.zinc950, marginTop: 4 },
  price: { color: palette.orange500, fontWeight: '700' },
  statusBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  lowBadge:          { backgroundColor: palette.yellow100 },
  unmappedBadge:     { backgroundColor: palette.orange100 },
  subscriptionBadge: { backgroundColor: palette.blue100 },
  outText:           { color: palette.red500 },
  lowText:           { color: palette.yellow500 },
  unmappedText:      { color: palette.orange500 },
  subscriptionText:  { color: palette.blue500 },
})
