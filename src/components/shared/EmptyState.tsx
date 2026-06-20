import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { FontFamily } from '@/theme/fonts'
import { palette } from '@/theme'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

interface EmptyStateProps {
  icon?: IconName
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={56}
        color={palette.zinc500}
        accessibilityElementsHidden
      />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {subtitle !== undefined && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {actionLabel !== undefined && onAction !== undefined && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    color: palette.zinc900,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: FontFamily.grotesk.semibold,
  },
  subtitle: {
    color: palette.zinc500,
    textAlign: 'center',
    fontFamily: FontFamily.sans.regular,
  },
  button: {
    marginTop: 16,
    minWidth: 160,
  },
})
