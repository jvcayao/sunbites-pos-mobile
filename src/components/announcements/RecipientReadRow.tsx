import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
import { palette } from '@/theme'
import type { AnnouncementRecipient } from '@/types/announcement'

interface RecipientReadRowProps {
  recipient: AnnouncementRecipient
}

export function RecipientReadRow({ recipient }: RecipientReadRowProps): React.JSX.Element {
  const isRead = recipient.read_at !== null
  const readTimestamp = isRead
    ? format(parseISO(recipient.read_at!), 'MMM d, h:mm a')
    : null

  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={styles.name}>{recipient.full_name}</Text>
      <View style={styles.status}>
        {isRead ? (
          <>
            <Text
              testID={`read-timestamp-${recipient.id}`}
              variant="bodySmall"
              style={styles.timestamp}
            >
              {readTimestamp}
            </Text>
            <MaterialCommunityIcons
              testID={`read-check-${recipient.id}`}
              name="check"
              size={16}
              color={palette.green500}
            />
          </>
        ) : (
          <Text variant="bodySmall" style={styles.unread}>Not yet read</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 16 },
  name:      { flex: 1, color: palette.zinc900 },
  status:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timestamp: { color: palette.zinc500 },
  unread:    { color: palette.zinc500 },
})
