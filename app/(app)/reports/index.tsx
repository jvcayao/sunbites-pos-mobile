import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native'
import { Surface, Text, TouchableRipple } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { AppHeader } from '@/components/shared/AppHeader'
import { palette } from '@/theme'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

interface ReportCard {
  title: string
  desc: string
  icon: IconName
  route: string
  color: string
}

const REPORTS: ReportCard[] = [
  { title: 'Sales',         desc: 'Orders, revenue, payment methods',      icon: 'cash-register',    route: 'sales',         color: palette.green500 },
  { title: 'Students',      desc: 'Enrollment, grades, balances',           icon: 'account-group',    route: 'students',      color: palette.blue500 },
  { title: 'Wallet',        desc: 'Credits, debits, low balances',          icon: 'wallet',           route: 'wallet',        color: palette.orange500 },
  { title: 'Inventory',     desc: 'Stock levels, adjustments, history',     icon: 'package-variant',  route: 'inventory',     color: '#A855F7' },
  { title: 'Billing',       desc: 'Subscription payments, collection rate', icon: 'receipt',          route: 'billing',       color: palette.yellow500 },
  { title: 'Credits',       desc: 'Outstanding credit audit trail',         icon: 'alert-circle',     route: 'credits',       color: palette.red500 },
  { title: 'Activity Log',  desc: 'System-wide activity history',           icon: 'history',          route: 'activity',      color: palette.zinc500 },
  { title: 'Daily Summary', desc: 'End-of-day totals and breakdowns',       icon: 'calendar-today',   route: 'daily-summary', color: palette.blue500 },
]

export default function ReportsIndexScreen() {
  return (
    <View style={styles.screen}>
      <AppHeader title="Reports" />
      <FlatList
        data={REPORTS}
        keyExtractor={(r) => r.route}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Surface style={styles.card} elevation={1}>
            <TouchableRipple
              onPress={() => router.push(`/(app)/reports/${item.route}` as any)}
              borderless
              style={styles.ripple}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} report`}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconBg, { backgroundColor: item.color + '20' }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={item.color} accessibilityElementsHidden />
                </View>
                <Text variant="titleSmall" style={styles.title}>{item.title}</Text>
                <Text variant="bodySmall" style={styles.desc}>{item.desc}</Text>
              </View>
            </TouchableRipple>
          </Surface>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.zinc100 },
  grid: { padding: 16, backgroundColor: palette.zinc100 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: palette.white },
  ripple: { borderRadius: 12 },
  cardContent: { padding: 16, gap: 8, minHeight: 130 },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: palette.zinc950, fontWeight: '700' },
  desc: { color: palette.zinc500 },
})
