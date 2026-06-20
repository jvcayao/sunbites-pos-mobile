import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { palette } from '@/theme'

interface Props {
  duplicateWarning: boolean
  existingStudentName: string | null
}

export function DuplicateWarningBanner({
  duplicateWarning,
  existingStudentName,
}: Props): React.JSX.Element | null {
  if (!duplicateWarning || existingStudentName === null) return null

  return (
    <View testID="duplicate-warning-banner" style={styles.container}>
      <MaterialCommunityIcons
        name="alert"
        size={18}
        color={palette.yellow500}
        style={styles.icon}
        accessibilityElementsHidden
      />
      <Text variant="bodySmall" style={styles.text}>
        {'A student with this student number already exists: '}
        <Text style={styles.bold}>{existingStudentName}</Text>
        {'. Resolve before approving.'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.yellow100,
    borderLeftWidth: 4,
    borderLeftColor: palette.yellow500,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    color: palette.zinc900,
  },
  bold: {
    fontWeight: '700',
    color: palette.zinc900,
  },
})
