import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { Appbar, Button, SegmentedButtons, Text, TextInput } from 'react-native-paper'
import { router } from 'expo-router'
import { useStudentList, useDeleteStudent, useTopUp, useTogglePayment } from '@/hooks/useStudents'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { StudentCard } from '@/components/students/StudentCard'
import { WalletTopUpSheet } from '@/components/students/WalletTopUpSheet'
import { PrintQrSheet } from '@/components/students/PrintQrSheet'
import { useLayout } from '@/hooks/useLayout'
import { palette } from '@/theme'
import type { Student, StudentType, TopUpDto } from '@/types/student'
import type { EnrollmentStatus } from '@/types/student'

type StudentTypeFilter = StudentType | 'all'

export default function StudentsScreen() {
  const toast = useToast()
  const { isTablet, isLandscape } = useLayout()
  const canStudents = usePermission('students')

  const [typeFilter, setTypeFilter] = useState<StudentTypeFilter>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [topUpStudent, setTopUpStudent] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [batchQrStudent, setBatchQrStudent] = useState<Student | null>(null)

  const params = {
    search: search || undefined,
    student_type: typeFilter === 'all' ? undefined : typeFilter,
    enrollment_status: statusFilter === 'all' ? undefined : statusFilter,
  }

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useStudentList(params)
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutate: topUp, isPending: isTopping } = useTopUp(topUpStudent?.id ?? 0)
  const { mutate: togglePayment } = useTogglePayment(0)

  const students = data?.pages.flatMap((p) => p.data) ?? []
  const numCols = isTablet || isLandscape ? 2 : 1

  const handleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDelete = (): void => {
    if (deleteTarget === null) return
    deleteStudent(deleteTarget.id, {
      onSuccess: () => { toast.success('Student removed'); setDeleteTarget(null) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleTopUp = (data: TopUpDto): void => {
    if (topUpStudent === null) return
    topUp(data, {
      onSuccess: () => { toast.success('Wallet topped up'); setTopUpStudent(null) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const renderItem = useCallback(({ item }: { item: Student }) => (
    <View style={numCols > 1 ? styles.gridItem : styles.listItem}>
      <StudentCard
        student={item}
        selected={selectedIds.has(item.id)}
        onSelect={() => handleSelect(item.id)}
        onTopUp={() => setTopUpStudent(item)}
        onRemove={() => setDeleteTarget(item)}
        onTogglePayment={(payId) => togglePayment(payId)}
      />
    </View>
  ), [selectedIds, numCols, handleSelect, togglePayment])

  const keyExtractor = useCallback((s: Student) => String(s.id), [])

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Students" />
        <Appbar.Action
          icon="account-plus"
          onPress={() => router.push('/(app)/enrollment')}
          accessibilityLabel="Enroll student"
          accessibilityRole="button"
        />
      </Appbar.Header>

      <SegmentedButtons
        value={typeFilter}
        onValueChange={(v) => setTypeFilter(v as StudentTypeFilter)}
        buttons={[
          { value: 'all',              label: 'All' },
          { value: 'subscription',     label: 'Subscription' },
          { value: 'non_subscription', label: 'Non-Sub' },
        ]}
        style={styles.tabs}
      />

      <TextInput
        mode="outlined"
        placeholder="Search students…"
        value={search}
        onChangeText={setSearch}
        left={<TextInput.Icon icon="magnify" />}
        style={styles.search}
        accessibilityLabel="Search students"
      />

      <FilterChipRow>
        {(['all', 'enrolled', 'paused', 'unenrolled', 'banned', 'graduated'] as const).map((s) => (
          <FilterChip key={s} label={s === 'all' ? 'All Status' : s} active={statusFilter === s} onPress={() => setStatusFilter(s)} />
        ))}
      </FilterChipRow>

      {isLoading ? (
        <SkeletonCard count={4} />
      ) : students.length === 0 ? (
        <EmptyState icon="account-group-outline" title="No students found" />
      ) : (
        <FlatList
          data={students}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numCols}
          key={String(numCols)}
          contentContainerStyle={styles.list}
          columnWrapperStyle={numCols > 1 ? styles.row : undefined}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={isFetchingNextPage ? <Text style={styles.loadMore}>Loading…</Text> : null}
          removeClippedSubviews
          maxToRenderPerBatch={8}
        />
      )}

      {/* Floating batch bar */}
      {selectedIds.size > 0 && (
        <View style={styles.batchBar}>
          <Button
            icon="close"
            mode="text"
            textColor={palette.white}
            onPress={() => setSelectedIds(new Set())}
            accessibilityRole="button"
          >
            Clear
          </Button>
          <Text style={styles.batchCount}>{selectedIds.size} selected</Text>
          <Button
            mode="contained"
            icon="qrcode"
            onPress={() => {
              const first = students.find((s) => selectedIds.has(s.id))
              if (first) setBatchQrStudent(first)
            }}
            accessibilityRole="button"
          >
            Print QR Codes
          </Button>
        </View>
      )}

      {/* Modals */}
      {topUpStudent !== null && (
        <WalletTopUpSheet
          visible
          currentBalance={topUpStudent.wallet_balance}
          studentName={topUpStudent.full_name}
          loading={isTopping}
          onConfirm={handleTopUp}
          onDismiss={() => setTopUpStudent(null)}
        />
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Remove Student"
        message={`Remove ${deleteTarget?.full_name ?? ''}? This cannot be undone.`}
        confirmLabel="Remove"
        loading={isDeleting}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />

      {batchQrStudent !== null && (
        <PrintQrSheet
          visible
          studentName={batchQrStudent.full_name}
          qrCode={batchQrStudent.qr_code}
          onDismiss={() => setBatchQrStudent(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  search: { marginHorizontal: 16, marginBottom: 4, backgroundColor: palette.white },
  list: { padding: 16 },
  listItem: {},
  gridItem: { flex: 1 },
  row: { gap: 8 },
  loadMore: { textAlign: 'center', color: palette.zinc500, padding: 12 },
  batchBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.orange500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  batchCount: { color: palette.white, fontWeight: '600' },
})
