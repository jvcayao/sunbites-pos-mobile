import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'
import type { TopItem } from '@/types/dashboard'

interface TopItemRowProps {
  item: TopItem
  rank: number
}

export function TopItemRow({ item, rank }: TopItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rankBg}>
        <Text variant="labelSmall" style={styles.rank}>{rank}</Text>
      </View>
      <Text variant="bodyMedium" style={styles.name}>{item.name}</Text>
      <Text variant="labelMedium" style={styles.qty}>{item.qty_sold} sold</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  rankBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.zinc100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: { color: palette.zinc500, fontWeight: '700' },
  name: { flex: 1, color: palette.zinc950 },
  qty: { color: palette.zinc500 },
})
