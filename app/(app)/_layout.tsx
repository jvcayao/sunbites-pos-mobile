import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from 'react-native-paper'
import { useAuthStore } from '@/store/auth'
import { usePermission } from '@/lib/permissions'
import { useReminderBellCount } from '@/hooks/useReminders'
import { usePendingCount } from '@/hooks/usePreRegistrations'

export default function AppLayout() {
  const { colors } = useTheme()
  const token        = useAuthStore((s) => s.token)
  const activeBranch = useAuthStore((s) => s.activeBranch)
  const canDashboard         = usePermission('dashboard')
  const canEnrollment        = usePermission('enrollment')
  const canStudents          = usePermission('students')
  const canReports           = usePermission('reports')
  const canReferences        = usePermission('references')
  const canReminders         = usePermission('reminders')
  const canPreRegistrations  = usePermission('pre_registrations')
  const canAnnouncements     = usePermission('announcements')

  const { data: reminderBellData } = useReminderBellCount()
  const reminderBellCount = reminderBellData?.count ?? 0

  const { data: pendingCount = 0 } = usePendingCount()

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
        name="reminders"
        options={{
          title: 'Reminders',
          href: canReminders ? undefined : null,
          tabBarBadge: reminderBellCount > 0 ? reminderBellCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-ring" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="pre-registrations"
        options={{
          title: 'Pre-Reg',
          href: canPreRegistrations ? undefined : null,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-check-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Announce',
          href: canAnnouncements ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bullhorn" size={size} color={color as string} />
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
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" size={size} color={color as string} />
          ),
        }}
      />
      {/* Hidden from tab bar — sub-routes navigated to from their parent tab */}
      <Tabs.Screen name="reminders/[id]" options={{ href: null }} />
      <Tabs.Screen name="announcements/[id]" options={{ href: null }} />
      <Tabs.Screen name="announcements/create" options={{ href: null }} />
      <Tabs.Screen name="pre-registrations/[id]" options={{ href: null }} />
      {/* Hidden from tab bar — navigated to via NotificationBell */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  )
}
