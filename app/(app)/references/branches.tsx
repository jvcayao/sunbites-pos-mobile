import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Button, Chip, Surface, Text, TextInput } from 'react-native-paper'
import { router } from 'expo-router'
import { useBranchList, useUpdateBranch, useToggleBranch } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AppHeader } from '@/components/shared/AppHeader'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import { useEffect } from 'react'

export default function BranchesScreen() {
  const isAdmin = usePermission('references_branches')
  const toast   = useToast()

  useEffect(() => { if (!isAdmin) router.replace('/(app)/references') }, [isAdmin])

  const { data, isLoading, refetch, isRefetching } = useBranchList()
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch()
  const { mutate: toggleBranch, isPending: isToggling } = useToggleBranch()

  const branches = Array.isArray(data) ? data : (data as any)?.data ?? []
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [toggleTarget, setToggleTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ name: '', gcash_number: '', address: '' })

  const handleEdit = (branch: any): void => {
    setEditTarget(branch)
    setEditForm({ name: branch.name, gcash_number: branch.gcash_number ?? '', address: branch.address ?? '' })
  }

  const handleUpdate = (): void => {
    if (!editTarget) return
    updateBranch({ id: editTarget.id, data: editForm }, {
      onSuccess: () => { toast.success('Branch updated'); setEditTarget(null) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleToggle = (): void => {
    if (!toggleTarget) return
    toggleBranch(toggleTarget.id, {
      onSuccess: () => { toast.success('Branch updated'); setToggleTarget(null) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const renderItem = useCallback(({ item }: { item: any }) => (
    <Surface style={[listCardStyle, styles.card]} elevation={1}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.meta}>{item.slug}</Text>
        </View>
        <Chip compact style={item.is_active ? styles.activeChip : styles.inactiveChip} textStyle={{ fontSize: 11, color: item.is_active ? palette.green500 : palette.zinc500 }}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Chip>
      </View>
      {item.gcash_number !== null && <Text variant="bodySmall" style={styles.meta}>GCash: {item.gcash_number}</Text>}
      {item.address !== null      && <Text variant="bodySmall" style={styles.meta}>{item.address}</Text>}
      <View style={styles.cardActions}>
        <Button compact mode="outlined" onPress={() => handleEdit(item)} accessibilityRole="button">Edit</Button>
        <Button compact mode="text" textColor={item.is_active ? palette.red500 : palette.green500} onPress={() => setToggleTarget(item)} accessibilityRole="button">
          {item.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </View>
    </Surface>
  ), [])

  return (
    <View style={styles.container}>
      <AppHeader title="Branches" />
      {isLoading ? <SkeletonCard count={3} /> : (
        <FlatList
          data={branches}
          keyExtractor={(b: any) => String(b.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
          ListEmptyComponent={<EmptyState icon="store" title="No branches" />}
        />
      )}

      {editTarget !== null && (
        <ConfirmDialog
          visible
          title={`Edit: ${editTarget.name}`}
          message=""
          confirmLabel="Save"
          confirmColor={palette.orange500}
          loading={isUpdating}
          onConfirm={handleUpdate}
          onDismiss={() => setEditTarget(null)}
        />
      )}

      <ConfirmDialog
        visible={toggleTarget !== null}
        title={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} Branch`}
        message={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.name}"?`}
        loading={isToggling}
        onConfirm={handleToggle}
        onDismiss={() => setToggleTarget(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  list: { padding: 16, gap: 12 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1 },
  name: { color: palette.zinc950, fontWeight: '700' },
  meta: { color: palette.zinc500, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  activeChip: { backgroundColor: palette.green100 },
  inactiveChip: { backgroundColor: palette.zinc100 },
})
