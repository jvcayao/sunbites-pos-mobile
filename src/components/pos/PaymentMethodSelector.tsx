import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'
import type { OrderPaymentMethod } from '@/types/order'

const METHODS: Array<{ key: OrderPaymentMethod; label: string; icon: string }> = [
  { key: 'cash',         label: 'Cash',         icon: '💵' },
  { key: 'gcash',        label: 'GCash',        icon: '📱' },
  { key: 'wallet',       label: 'Wallet',       icon: '👛' },
  { key: 'subscription', label: 'Subscription', icon: '📋' },
]

interface PaymentMethodSelectorProps {
  selected: OrderPaymentMethod
  onSelect: (method: OrderPaymentMethod) => void
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <View style={styles.row}>
      {METHODS.map((m) => (
        <Pressable
          key={m.key}
          onPress={() => onSelect(m.key)}
          style={[styles.btn, selected === m.key && styles.btnActive]}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === m.key }}
          accessibilityLabel={m.label}
        >
          <Text style={styles.icon}>{m.icon}</Text>
          <Text
            variant="labelSmall"
            style={selected === m.key ? styles.labelActive : styles.label}
          >
            {m.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.zinc200,
    backgroundColor: palette.white,
    minHeight: 60,
    justifyContent: 'center',
  },
  btnActive: {
    borderColor: palette.orange500,
    backgroundColor: palette.orange100,
  },
  icon: { fontSize: 18 },
  label: { color: palette.zinc500, marginTop: 2, textAlign: 'center' },
  labelActive: { color: palette.orange500, marginTop: 2, textAlign: 'center', fontWeight: '700' },
})
