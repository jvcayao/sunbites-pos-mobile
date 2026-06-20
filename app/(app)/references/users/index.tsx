import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Appbar, Text, TextInput, TouchableRipple } from 'react-native-paper'
import { router } from 'expo-router'
import { useUserList } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { AvatarInitials } from '@/components/references/AvatarInitials'
import { RoleBadge } from '@/components/references/RoleBadge'
import { palette } from '@/theme'
import type { UserRole } from '@/types/auth'
import type { ViewStyle, TextStyle } from 'react-native'

const viewStyles = StyleSheet.create<Record<string, ViewStyle>>({
  container:  { flex: 1, backgroundColor: palette.zinc100 },
  appbar:     { backgroundColor: palette.white },
  search:     { marginHorizontal: 16, marginTop: 8, backgroundColor: palette.white } as any,
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  info:       { flex: 1 },
  badges:     { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  dot:        { width: 10, height: 10, borderRadius: 5 },
  loadMore:   { padding: 8 } as any,
})

const textStyles = StyleSheet.create<Record<string, TextStyle>>({
  name: { color: palette.zinc950 },
  meta: { textAlign: 'center', color: palette.zinc500, padding: 8 },
})

export default function UsersScreen() {
  const canCreate = usePermission('references_branches')
  const [search, setSearch] = useState('')
  const [role, setRole]     = useState('all')
  const [status, setStatus] = useState('all')

  const params = {
    search:    search || undefined,
    role:      role   === 'all' ? undefined : role,
    is_active: status === 'all' ? undefined : status === 'active',
  }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserList(params)
  const users = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableRipple
      onPress={() => router.push(`/(app)/references/users/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.full_name}
    >
      <View style={viewStyles.row}>
        <AvatarInitials name={item.full_name} size={40} />
        <View style={viewStyles.info}>
          <Text variant="bodyMedium" style={textStyles.name}>{item.full_name}</Text>
          <View style={viewStyles.badges}>
            {(item.roles ?? []).map((r: UserRole) => <RoleBadge key={r} role={r} />)}
          </View>
        </View>
        <View style={[viewStyles.dot, { backgroundColor: item.is_active ? palette.green500 : palette.zinc500 }]} />
      </View>
    </TouchableRipple>
  ), [])

  return (
    <View style={viewStyles.container}>
      <Appbar.Header style={viewStyles.appbar}>
        <Appbar.Content title="Users" />
        {canCreate && (
          <Appbar.Action
            icon="account-plus"
            onPress={() => router.push('/(app)/references/users/create')}
            accessibilityLabel="Add user"
          />
        )}
      </Appbar.Header>
      <TextInput
        mode="outlined"
        placeholder="Search users…"
        value={search}
        onChangeText={setSearch}
        left={<TextInput.Icon icon="magnify" />}
        style={viewStyles.search as any}
        accessibilityLabel="Search users"
      />
      <FilterChipRow>
        {(['all', 'admin', 'manager', 'supervisor', 'cashier'] as const).map((r) => (
          <FilterChip key={r} label={r} active={role === r} onPress={() => setRole(r)} />
        ))}
      </FilterChipRow>
      <FilterChipRow>
        {(['all', 'active', 'inactive'] as const).map((s) => (
          <FilterChip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </FilterChipRow>
      {isLoading ? (
        <SkeletonCard count={5} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u: any) => String(u.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={<EmptyState icon="account-group-outline" title="No users found" />}
          ListFooterComponent={isFetchingNextPage ? <Text style={textStyles.meta}>Loading…</Text> : null}
        />
      )}
    </View>
  )
}
