import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { palette } from '@/theme'

interface AvatarInitialsProps {
  name: string
  size?: number
  backgroundColor?: string
  textColor?: string
}

export function AvatarInitials({
  name,
  size = 40,
  backgroundColor = palette.orange100,
  textColor = palette.orange500,
}: AvatarInitialsProps) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
      accessibilityElementsHidden
    >
      <Text style={[styles.text, { color: textColor, fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700' },
})
