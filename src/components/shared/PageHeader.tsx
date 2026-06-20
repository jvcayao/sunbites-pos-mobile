import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {right !== undefined && <View style={styles.right}>{right}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  text: { flex: 1 },
  title: {
    color: palette.zinc950,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.zinc500,
    marginTop: 2,
  },
  right: {
    marginLeft: 8,
  },
})
