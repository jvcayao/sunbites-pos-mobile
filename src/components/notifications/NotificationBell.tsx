import { Pressable, StyleSheet } from 'react-native'
import { Badge } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useNotificationUnreadCount } from '@/hooks/useNotifications'
import { palette } from '@/theme'

export function NotificationBell(): React.JSX.Element {
  const { data } = useNotificationUnreadCount()
  const count = data?.count ?? 0

  return (
    <Pressable
      testID="notification-bell"
      onPress={() => router.push('/(app)/notifications' as never)}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <MaterialCommunityIcons
        name={count > 0 ? 'bell' : 'bell-outline'}
        size={24}
        color={palette.zinc950}
      />
      {count > 0 && (
        <Badge testID="notification-badge" style={styles.badge} size={16}>
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
})
