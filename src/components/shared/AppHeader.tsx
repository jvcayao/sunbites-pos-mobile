import { StyleSheet, Text, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { BranchPill } from '@/components/shared/BranchPill'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'

const iconSource = require('../../../assets/icon.png')

interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
  showBranchPill?: boolean
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
  showBranchPill = true,
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
      <View style={styles.logoTitle}>
        <Image
          source={iconSource}
          style={styles.icon}
          contentFit="contain"
          cachePolicy="memory-disk"
          accessibilityRole="image"
          accessibilityLabel="Sunbites"
        />
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle !== undefined && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.rightSlot}>
        {showBranchPill && <BranchPill />}
        {right}
        <NotificationBell />
      </View>
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  logoTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 4,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 15,
    lineHeight: 20,
    color: palette.zinc950,
  },
  subtitle: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 12,
    lineHeight: 16,
    color: palette.zinc500,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
