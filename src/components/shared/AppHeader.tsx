import { StyleSheet, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { AppLogo } from './AppLogo'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'

interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
}: AppHeaderProps): React.JSX.Element {
  const router = useRouter()

  function handleBack(): void {
    if (onBack !== undefined) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <Appbar.Header style={styles.header}>
      {showBack && (
        <Appbar.BackAction onPress={handleBack} accessibilityLabel="Go back" />
      )}
      <View style={styles.logoWrap}>
        <AppLogo variant="compact" />
      </View>
      <View style={styles.titleWrap}>
        <Appbar.Content
          title={title}
          subtitle={subtitle}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />
      </View>
      {right !== undefined && <View style={styles.actions}>{right}</View>}
      <NotificationBell />
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  logoWrap: {
    marginRight: 12,
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 15,
    color: palette.zinc950,
  },
  subtitle: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 12,
    color: palette.zinc500,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
