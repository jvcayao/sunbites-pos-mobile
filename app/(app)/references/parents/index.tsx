import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Chip, Text, TextInput, TouchableRipple } from 'react-native-paper'
import { router } from 'expo-router'
import { useParentList } from '@/hooks/useReferences'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { AvatarInitials } from '@/components/references/AvatarInitials'
import { palette } from '@/theme'

export default function ParentsScreen() {
  const [search, setSearch] = useState('')
  const params = { search: search || undefined }
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useParentList(params)
  const parents = data?.pages.flatMap((p: any) => p.data ?? []) ?? []

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableRipple onPress={() => router.push(`/(app)/references/parents/${item.id}`)} accessibilityRole="button" accessibilityLabel={item.full_name}>
      <View style={styles.row}>
        <AvatarInitials name={item.full_name} size={40} backgroundColor={palette.blue100} textColor={palette.blue500} />
        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.name}>{item.full_name}</Text>
          <Text variant="bodySmall" style={styles.meta}>{item.email}</Text>
          <Text variant="bodySmall" style={styles.meta}>{item.students?.length ?? 0} student{item.students?.length !== 1 ? 's' : ''}</Text>
        </View>
        <Chip compact style={item.activation_status === 'active' ? styles.activeChip : styles.pendingChip} textStyle={{ fontSize: 11, color: item.activation_status === 'active' ? palette.green500 : palette.yellow500 }}>
          {item.activation_status}
        </Chip>
      </View>
    </TouchableRipple>
  ), [])

  return (
    <View style={styles.container}>
      <TextInput mode="outlined" placeholder="Search parents…" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} accessibilityLabel="Search parents" />
      {isLoading ? <SkeletonCard count={5} /> : (
        <FlatList
          data={parents}
          keyExtractor={(p: any) => String(p.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={<EmptyState icon="account-heart" title="No parents found" />}
          ListFooterComponent={isFetchingNextPage ? <Text style={styles.meta}>Loading…</Text> : null}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  search: { marginHorizontal: 16, marginTop: 8, backgroundColor: palette.white },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  info: { flex: 1 },
  name: { color: palette.zinc950 },
  meta: { color: palette.zinc500 },
  activeChip: { backgroundColor: palette.green100 },
  pendingChip: { backgroundColor: palette.yellow100 },
})
