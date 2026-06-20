import { Stack } from 'expo-router'
import { palette } from '@/theme'

export default function ReferencesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.white },
        headerTintColor: palette.orange500,
        headerTitleStyle: { color: palette.zinc950, fontWeight: '700' },
      }}
    />
  )
}
