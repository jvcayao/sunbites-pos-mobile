import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { router } from 'expo-router'
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { formatCurrency } from '@/lib/formatters'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AppHeader } from '@/components/shared/AppHeader'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { SystemConfig } from '@/types/references'

export default function SystemSettingsScreen() {
  const isAdmin = usePermission('references_branches')
  const toast   = useToast()

  useEffect(() => { if (!isAdmin) router.replace('/(app)/references') }, [isAdmin])

  const { data, isLoading } = useSystemSettings()
  const { mutate: updateSetting, isPending } = useUpdateSystemSetting()

  const configs = Array.isArray(data) ? data as SystemConfig[] : (data as any)?.data ?? []
  const [editTarget, setEditTarget] = useState<SystemConfig | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [saved, setSaved] = useState(false)

  const formatValue = (config: SystemConfig): string => {
    if (config.type === 'decimal' || config.type === 'integer') {
      return formatCurrency(Number(config.value))
    }
    return config.value
  }

  const handleSave = (): void => {
    if (!editTarget) return
    const val = editTarget.type === 'integer' ? parseInt(inputValue, 10) : editTarget.type === 'decimal' ? parseFloat(inputValue) : inputValue
    updateSetting({ key: editTarget.key, value: val }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const renderItem = ({ item }: { item: SystemConfig }) => (
    <View style={[listCardStyle, styles.row]}>
      <View style={styles.left}>
        <Text variant="bodyMedium" style={styles.label}>{item.label}</Text>
        {item.description !== null && (
          <Text variant="bodySmall" style={styles.meta}>{item.description}</Text>
        )}
        <Text variant="titleSmall" style={styles.value}>{formatValue(item)}</Text>
      </View>
      <Button compact mode="outlined" onPress={() => { setEditTarget(item); setInputValue(item.value); setSaved(false) }} accessibilityRole="button">
        Edit
      </Button>
    </View>
  )

  return (
    <View style={styles.container}>
      <AppHeader title="System Settings" />
      {isLoading ? <SkeletonCard count={4} /> : configs.length === 0 ? (
        <EmptyState icon="cog" title="No system settings" />
      ) : (
        <FlatList
          data={configs}
          keyExtractor={(c: SystemConfig) => c.key}
          renderItem={renderItem}
        />
      )}

      {editTarget !== null && (
        <Portal>
          <Modal visible onDismiss={() => setEditTarget(null)} contentContainerStyle={styles.modal}>
            <Surface style={styles.modalSurface} elevation={4}>
              <Text variant="titleMedium" style={styles.modalTitle}>Edit: {editTarget.label}</Text>
              {editTarget.description !== null && (
                <Text variant="bodySmall" style={styles.meta}>{editTarget.description}</Text>
              )}
              <Divider style={styles.divider} />
              <TextInput
                label={editTarget.label}
                mode="outlined"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={editTarget.type !== 'text' ? 'decimal-pad' : 'default'}
                style={styles.input}
                accessibilityLabel={`Edit ${editTarget.label}`}
              />
              {saved && <Text variant="bodySmall" style={styles.savedText}>✓ Saved</Text>}
              <View style={styles.modalActions}>
                <Button onPress={() => setEditTarget(null)}>Cancel</Button>
                <Button mode="contained" onPress={handleSave} loading={isPending} disabled={!inputValue || isPending}>
                  Save Changes
                </Button>
              </View>
            </Surface>
          </Modal>
        </Portal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  left: { flex: 1 },
  label: { color: palette.zinc950, fontWeight: '600' },
  meta: { color: palette.zinc500, marginTop: 2 },
  value: { color: palette.orange500, marginTop: 4 },
  modal: { marginHorizontal: 20 },
  modalSurface: { borderRadius: 16, overflow: 'hidden', padding: 20 },
  modalTitle: { fontWeight: '700', color: palette.zinc950, marginBottom: 4 },
  divider: { marginVertical: 12 },
  input: { backgroundColor: palette.white },
  savedText: { color: palette.green500, marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
})
