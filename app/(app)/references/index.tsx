import { StyleSheet } from 'react-native'
import { FlatList, View } from 'react-native'
import { Surface, Text, TouchableRipple } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { usePermission } from '@/lib/permissions'
import { palette } from '@/theme'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

interface Section { title: string; desc: string; icon: IconName; route: string; visible: boolean }

export default function ReferencesIndexScreen() {
  const canBranches = usePermission('references_branches')
  const canUsers    = usePermission('references_users')

  const SECTIONS: Section[] = ([
    { title: 'Inventory',          desc: 'Stock items, adjustments, history',    icon: 'package-variant' as IconName,  route: 'inventory',          visible: true },
    { title: 'Meal Planner',       desc: 'Weekly menu by month',                 icon: 'food' as IconName,             route: 'meal-planner',       visible: true },
    { title: 'Users',              desc: 'Staff accounts and roles',              icon: 'account-multiple' as IconName, route: 'users',              visible: canUsers },
    { title: 'Branches',           desc: 'Branch settings and toggles',           icon: 'store' as IconName,            route: 'branches',           visible: canBranches },
    { title: 'Subscription Config',desc: 'Monthly billing by branch',             icon: 'calendar-clock' as IconName,   route: 'subscription-config',visible: true },
    { title: 'Parents',            desc: 'Parent contacts and portal',            icon: 'account-heart' as IconName,    route: 'parents',            visible: true },
    { title: 'Feedback',           desc: 'Student and parent feedback',           icon: 'message-text' as IconName,     route: 'feedback',           visible: true },
    { title: 'System Settings',    desc: 'Global configuration values',           icon: 'cog' as IconName,              route: 'system-settings',    visible: canBranches },
  ] as Section[]).filter((s) => s.visible)

  return (
    <FlatList
      data={SECTIONS}
      keyExtractor={(s) => s.route}
      numColumns={2}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Surface style={styles.card} elevation={1}>
          <TouchableRipple
            onPress={() => router.push(`/(app)/references/${item.route}` as any)}
            borderless
            style={styles.ripple}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconBg}>
                <MaterialCommunityIcons name={item.icon} size={28} color={palette.orange500} accessibilityElementsHidden />
              </View>
              <Text variant="titleSmall" style={styles.title}>{item.title}</Text>
              <Text variant="bodySmall" style={styles.desc}>{item.desc}</Text>
            </View>
          </TouchableRipple>
        </Surface>
      )}
    />
  )
}

const styles = StyleSheet.create({
  grid: { padding: 16, backgroundColor: palette.zinc100 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: palette.white },
  ripple: { borderRadius: 12 },
  cardContent: { padding: 16, gap: 8, minHeight: 120 },
  iconBg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: palette.orange100,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: palette.zinc950, fontWeight: '700' },
  desc: { color: palette.zinc500 },
})
