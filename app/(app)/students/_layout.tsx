import { Stack } from 'expo-router'
import { palette } from '@/theme'

// Defines a Stack navigator for the Students tab so that [id].tsx is a
// stack screen (pushed on top of the list) and NOT a tab bar entry.
export default function StudentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.white },
        headerTintColor: palette.orange500,
        headerTitleStyle: { color: palette.zinc950, fontWeight: '700' },
        headerShown: false,
      }}
    />
  )
}
