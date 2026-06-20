import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { palette } from '@/theme'

interface Props {
  selectedCount: number
  isWindowOpen: boolean
  isPending: boolean
  onSend: () => void
}

export function SendRemindersBar({
  selectedCount,
  isWindowOpen,
  isPending,
  onSend,
}: Props): React.JSX.Element {
  const isDisabled = selectedCount === 0 || !isWindowOpen || isPending

  return (
    <View style={styles.container}>
      {!isWindowOpen && (
        <Text variant="bodySmall" style={styles.windowNote}>
          Outside reminder window — sending is disabled
        </Text>
      )}
      <Button
        testID="send-reminders-btn"
        mode="contained"
        disabled={isDisabled}
        loading={isPending}
        onPress={onSend}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={`Send reminders to ${selectedCount} parents`}
      >
        {`Send (${selectedCount}) Reminders`}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
    backgroundColor: palette.white,
    gap: 8,
  },
  windowNote: {
    color: palette.zinc500,
    textAlign: 'center',
  },
  button: { borderRadius: 8 },
})
