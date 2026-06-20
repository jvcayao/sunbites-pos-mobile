import { Redirect, Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from 'react-native-paper'
import { useAuthStore } from '@/store/auth'
import { usePermission } from '@/lib/permissions'

export default function AppLayout() {
  const { colors } = useTheme()
  const token        = useAuthStore((s) => s.token)
  const activeBranch = useAuthStore((s) => s.activeBranch)
  const canDashboard  = usePermission('dashboard')
  const canEnrollment = usePermission('enrollment')
  const canStudents   = usePermission('students')
  const canReports    = usePermission('reports')
  const canReferences = usePermission('references')

  // Guard: redirect any direct deep-link or back-navigation
  // into protected tabs when the session is not valid.
  if (token === null) return <Redirect href="/(auth)/login" />
  if (activeBranch === null) return <Redirect href="/(auth)/branch" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          href: canDashboard ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'POS',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="point-of-sale" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="enrollment"
        options={{
          title: 'Enrollment',
          href: canEnrollment ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-plus" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          href: canStudents ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: canReports ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="references"
        options={{
          title: 'References',
          href: canReferences ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  )
}
