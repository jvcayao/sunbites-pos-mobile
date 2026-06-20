import { Pressable, StyleSheet, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { palette } from '@/theme'
import { FontFamily } from '@/theme/fonts'

const MAX_LENGTH = 18

function truncate(name: string): string {
  if (name.length <= MAX_LENGTH) return name
  return name.slice(0, MAX_LENGTH) + '…'
}

export function BranchPill(): React.JSX.Element | null {
  const activeBranch = useAuthStore((s) => s.activeBranch)
  const router = useRouter()

  if (activeBranch === null) return null

  function handlePress(): void {
    router.push('/(auth)/branch?mode=switch')
  }

  return (
    <Pressable
      onPress={handlePress}
      style={styles.pill}
      accessibilityRole="button"
      accessibilityLabel={`Switch branch, currently ${activeBranch.name}`}
    >
      <Text style={styles.label} numberOfLines={1}>
        {truncate(activeBranch.name)}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={14} color={palette.zinc500} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.zinc100,
    borderRadius: 6,
    height: 28,
    paddingHorizontal: 10,
    gap: 2,
  },
  label: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 12,
    color: '#3F3F46',
  },
})
