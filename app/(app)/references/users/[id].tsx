import { StyleSheet, View } from 'react-native'
import { Appbar, Button, DataTable, Menu, SegmentedButtons, Surface, Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { z } from 'zod'
import { useUserDetail, useDeactivateUser, useReactivateUser } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AvatarInitials } from '@/components/references/AvatarInitials'
import { RoleBadge } from '@/components/references/RoleBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { palette } from '@/theme'
import { useState } from 'react'
import type { UserRole } from '@/types/auth'

export default function UserDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>()
  const parsed = z.coerce.number().int().positive().safeParse(rawId)
  if (!parsed.success) return <EmptyState title="Invalid user link" />
  const userId = parsed.data

  const toast = useToast()
  const isAdmin = usePermission('references_branches')
  const [tab, setTab] = useState('personal')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)

  const { data: user, isLoading } = useUserDetail(userId)
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUser(userId)
  const { mutate: reactivate, isPending: isReactivating } = useReactivateUser(userId)

  if (isLoading) return <SkeletonCard count={4} />
  if (user === undefined) return <EmptyState title="User not found" />

  const u = user as any

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={u.full_name} subtitle={u.position} />
        {isAdmin && (
          <Menu
            visible={menuOpen}
            onDismiss={() => setMenuOpen(false)}
            anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuOpen(true)} />}
          >
            <Menu.Item onPress={() => { setMenuOpen(false); setShowDeactivate(true) }} title={u.is_active ? 'Deactivate' : 'Reactivate'} />
          </Menu>
        )}
      </Appbar.Header>

      <Surface style={styles.header} elevation={1}>
        <AvatarInitials name={u.full_name} size={56} />
        <View style={styles.headerInfo}>
          <Text variant="titleMedium" style={styles.name}>{u.full_name}</Text>
          <View style={styles.badges}>
            {(u.roles ?? []).map((r: UserRole) => <RoleBadge key={r} role={r} />)}
            <View style={[styles.dot, { backgroundColor: u.is_active ? palette.green500 : palette.zinc500 }]} />
          </View>
          <Text variant="bodySmall" style={styles.meta}>{u.email}</Text>
        </View>
      </Surface>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[{ value: 'personal', label: 'Personal' }, { value: 'employment', label: 'Employment' }, { value: 'branches', label: 'Branches' }]}
        style={styles.tabs}
      />

      {tab === 'personal' && (
        <DataTable>
          {[['Phone', u.phone], ['Birthday', u.birthday], ['Gender', u.gender]].map(([k, v]) => (
            <DataTable.Row key={k as string}>
              <DataTable.Cell textStyle={styles.tableKey}>{k}</DataTable.Cell>
              <DataTable.Cell>{v ?? '—'}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      )}

      {tab === 'employment' && (
        <DataTable>
          {[['Position', u.position], ['Type', u.employment_type], ['Date Hired', u.date_hired]].map(([k, v]) => (
            <DataTable.Row key={k as string}>
              <DataTable.Cell textStyle={styles.tableKey}>{k}</DataTable.Cell>
              <DataTable.Cell>{v ?? '—'}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      )}

      {tab === 'branches' && (
        <View style={styles.branchList}>
          {(u.branches ?? []).map((b: any) => (
            <Text key={b.id} variant="bodyMedium" style={styles.branchName}>• {b.name}</Text>
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={showDeactivate}
        title={u.is_active ? 'Deactivate User' : 'Reactivate User'}
        message={`${u.is_active ? 'Deactivate' : 'Reactivate'} ${u.full_name}?`}
        confirmLabel={u.is_active ? 'Deactivate' : 'Reactivate'}
        loading={isDeactivating || isReactivating}
        onConfirm={() => {
          const action = u.is_active ? deactivate : reactivate
          action(undefined as any, {
            onSuccess: () => { toast.success(`User ${u.is_active ? 'deactivated' : 'reactivated'}`); setShowDeactivate(false) },
            onError: (err) => toast.error(getApiError(err)),
          })
        }}
        onDismiss={() => setShowDeactivate(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  header: { flexDirection: 'row', padding: 20, gap: 16, alignItems: 'center', backgroundColor: palette.white },
  headerInfo: { flex: 1 },
  name: { color: palette.zinc950, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  meta: { color: palette.zinc500, marginTop: 4 },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  tableKey: { color: palette.zinc500 },
  branchList: { padding: 16 },
  branchName: { color: palette.zinc950, marginVertical: 4 },
})
