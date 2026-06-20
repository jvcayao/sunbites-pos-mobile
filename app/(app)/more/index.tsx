import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth'
import { performLogout } from '@/lib/logout'
import { useLayout } from '@/hooks/useLayout'
import { AppHeader } from '@/components/shared/AppHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface PlaceholderRowProps {
  testID: string
  label: string
  icon: string
}

function PlaceholderRow({ testID, label, icon }: PlaceholderRowProps): React.JSX.Element {
  return (
    <View testID={testID} style={styles.menuRow}>
      <MaterialCommunityIcons name={icon as any} size={20} color={palette.zinc200} />
      <Text style={styles.menuLabelDisabled}>{label}</Text>
      <Text style={styles.soonLabel}>(soon)</Text>
    </View>
  )
}

export default function MoreScreen(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const activeBranch = useAuthStore((s) => s.activeBranch)
  const { isTablet } = useLayout()

  if (user === null) {
    return (
      <View style={styles.container}>
        <AppHeader title="More" showBranchPill={false} />
        <EmptyState title="Session expired" />
      </View>
    )
  }

  const initials = (user.first_name[0] + user.last_name[0]).toUpperCase()
  const role = capitalize(user.roles[0])

  const leftWidth = isTablet ? '35%' : '100%'
  const rightWidth = isTablet ? '65%' : '100%'

  return (
    <View style={styles.container}>
      <AppHeader title="More" showBranchPill={false} />
      <View style={styles.content}>
        <View style={[styles.leftCol, { width: leftWidth }]}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
          {activeBranch !== null && (
            <View style={styles.branchRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={palette.zinc500} />
              <Text style={styles.branchName}>{activeBranch.name}</Text>
            </View>
          )}
        </View>

        <View style={[styles.rightCol, { width: rightWidth }]}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <PlaceholderRow testID="placeholder-profile-settings" label="Profile Settings" icon="account-edit" />
          <PlaceholderRow testID="placeholder-appearance" label="Appearance" icon="palette" />
          <PlaceholderRow testID="placeholder-notifications" label="Notification Preferences" icon="bell-outline" />

          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>SESSION</Text>
          <Pressable
            testID="sign-out-row"
            style={styles.menuRow}
            onPress={() => { void performLogout() }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <MaterialCommunityIcons name="logout" size={20} color={palette.red500} />
            <Text style={styles.signOutLabel}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftCol: {
    padding: 24,
    alignItems: 'flex-start',
    gap: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: palette.zinc200,
  },
  rightCol: {
    padding: 24,
    gap: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.zinc100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initials: {
    fontFamily: FontFamily.sans.bold,
    fontSize: 22,
    color: palette.orange500,
  },
  fullName: {
    fontFamily: FontFamily.sans.bold,
    fontSize: 18,
    color: palette.zinc950,
  },
  email: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 13,
    color: palette.zinc500,
  },
  roleBadge: {
    backgroundColor: palette.zinc100,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 11,
    color: '#3F3F46',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  branchName: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 13,
    color: palette.zinc500,
  },
  sectionHeader: {
    fontFamily: FontFamily.sans.bold,
    fontSize: 11,
    color: palette.zinc500,
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 8,
  },
  sectionHeaderSpaced: {
    marginTop: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuLabelDisabled: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 14,
    color: palette.zinc200,
    flex: 1,
  },
  soonLabel: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 11,
    color: palette.zinc200,
  },
  signOutLabel: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 14,
    color: palette.red500,
  },
})
