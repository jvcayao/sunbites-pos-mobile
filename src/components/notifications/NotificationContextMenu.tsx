import { StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text } from 'react-native-paper'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { palette } from '@/theme'
import { useState } from 'react'

interface NotificationContextMenuProps {
  visible: boolean
  isRead: boolean
  isDeleting?: boolean
  onMarkRead: () => void
  onDelete: () => void
  onDismiss: () => void
}

export function NotificationContextMenu({
  visible,
  isRead,
  isDeleting = false,
  onMarkRead,
  onDelete,
  onDismiss,
}: NotificationContextMenuProps): React.JSX.Element {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteConfirm = (): void => {
    setConfirmDelete(false)
    onDelete()
    onDismiss()
  }

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modal}
        >
          <Surface style={styles.surface} elevation={3}>
            <Text variant="labelMedium" style={styles.header}>Options</Text>
            <Divider />
            {!isRead && (
              <Button
                mode="text"
                onPress={() => { onMarkRead(); onDismiss() }}
                style={styles.option}
                accessibilityRole="button"
              >
                Mark as Read
              </Button>
            )}
            <View style={styles.separator} />
            <Button
              mode="text"
              textColor={palette.red500}
              onPress={() => setConfirmDelete(true)}
              style={styles.option}
              loading={isDeleting}
              disabled={isDeleting}
              accessibilityRole="button"
            >
              Delete
            </Button>
          </Surface>
        </Modal>
      </Portal>

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete notification?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        confirmColor={palette.red500}
        onConfirm={handleDeleteConfirm}
        onDismiss={() => setConfirmDelete(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  modal:     { marginHorizontal: 40 },
  surface:   { borderRadius: 12, overflow: 'hidden', paddingBottom: 8 },
  header:    { padding: 16, color: palette.zinc500, textTransform: 'uppercase' },
  option:    { borderRadius: 0, justifyContent: 'flex-start' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: palette.zinc200, marginHorizontal: 16 },
})
