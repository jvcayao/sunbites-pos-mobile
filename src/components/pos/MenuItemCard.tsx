import React, { useCallback } from 'react'
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { formatCurrency } from '@/lib/formatters'
import { usePressScale } from '@/lib/animation'
import { MonoText } from '@/components/shared/MonoText'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'
import type { PosMenuItem } from '@/types/menu'

interface MenuItemCardProps {
  item: PosMenuItem
  cartQuantity: number
  onPress: (item: PosMenuItem) => void
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

export const MenuItemCard = function MenuItemCard({ item, cartQuantity, onPress }: MenuItemCardProps): React.JSX.Element {
  const { isDisabled, badge: statusBadge } = getItemState(item)

  const handlePress = useCallback(() => onPress(item), [item, onPress])
  const { scale, onPressIn, onPressOut } = usePressScale(0.97)

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale }] },
      isDisabled && styles.disabled,
    ]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={({ pressed }: { pressed: boolean }) => pressed && !isDisabled && styles.pressed}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${formatCurrency(item.price)}`}
        accessibilityState={{ disabled: isDisabled }}
      >
        <View style={[styles.card, cartQuantity > 0 && styles.cardInCart]}>
          {/* overflow:hidden on card clips the awning to rounded corners.
              Card has NO elevation on Android — elevation + overflow:hidden together
              produces Android's thick Material surface outline artifact. */}
          <View style={styles.awning}>
            <Text style={styles.awningName} numberOfLines={2}>{item.name}</Text>
          </View>
          <View style={styles.body}>
            <MonoText size="lg" weight="bold" color={palette.zinc950}>
              {formatCurrency(item.price)}
            </MonoText>
            {statusBadge === 'out' && (
              <View style={[styles.badge, styles.badgeOut]}>
                <Text style={[styles.badgeText, styles.badgeOutText]}>Out of Stock</Text>
              </View>
            )}
            {statusBadge === 'not_linked' && (
              <View style={[styles.badge, styles.badgeNotLinked]}>
                <Text style={[styles.badgeText, styles.badgeNotLinkedText]}>Not linked</Text>
              </View>
            )}
            {statusBadge === 'low' && (
              <View style={[styles.badge, styles.badgeLow]}>
                <Text style={[styles.badgeText, styles.badgeLowText]}>Low Stock</Text>
              </View>
            )}
            {statusBadge === 'subscription' && (
              <View style={[styles.badge, styles.badgeSub]}>
                <Text style={[styles.badgeText, styles.badgeSubText]}>Subscription</Text>
              </View>
            )}
          </View>
          {cartQuantity > 0 && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{cartQuantity}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0 },
  pressed:   { opacity: 0.85 },
  disabled:  { opacity: 0.35 },

  card: {
    flex: 1,
    minHeight: 108,
    borderRadius: 14,
    backgroundColor: palette.white,
    overflow: 'hidden',
    // Android: no elevation (elevation + overflow:hidden = thick border artifact).
    // Use a hairline border for card separation instead.
    // iOS: keep subtle shadow — overflow:hidden is fine without elevation on iOS.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.10)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
        // Widen border to show shadow on iOS
        borderWidth: 0,
      },
    }),
  },
  cardInCart: {
    borderWidth: 2,
    borderColor: palette.orange500,
  },

  awning: {
    backgroundColor: '#E7000B',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 9,
    // No borderTopRadius needed — parent card's overflow:hidden clips this cleanly.
  },
  awningName: {
    fontFamily: FontFamily.grotesk.semibold,
    fontSize: 13,
    letterSpacing: -0.2,
    lineHeight: 17,
    color: '#FFFFFF',
  },

  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 11,
    gap: 5,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  badgeOut:           { backgroundColor: '#FEE2E2' },
  badgeOutText:       { color: '#991B1B' },
  badgeNotLinked:     { backgroundColor: '#FEF3C7' },
  badgeNotLinkedText: { color: '#92400E' },
  badgeLow:           { backgroundColor: '#FEF3C7' },
  badgeLowText:       { color: '#78350F' },
  badgeSub:           { backgroundColor: '#DBEAFE' },
  badgeSubText:       { color: '#1E40AF' },

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
  quantityText: {
    fontFamily: FontFamily.sans.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
})
