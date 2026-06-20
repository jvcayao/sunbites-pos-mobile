import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native'
import {
  Appbar, Button, DataTable, Divider, IconButton, Menu,
  SegmentedButtons, Surface, Text, TextInput,
} from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { z } from 'zod'
import { QrCodeSvg } from 'react-native-qr-svg'
import {
  useStudentDetail, useStudentContacts, useStudentPayments,
  useStudentOrders, useStudentWalletTransactions,
  useUpdateStudent, useDeleteStudent, useUpdateStatus, useUpdateType,
  useTopUp, useTogglePayment, useUpdatePaymentAmount, useAddSubscriptionRange,
  useRegenerateQr, useCreateContact, useUpdateContact, useRemoveContact,
  useResendActivation,
} from '@/hooks/useStudents'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { WalletTopUpSheet } from '@/components/students/WalletTopUpSheet'
import { StatusPickerSheet } from '@/components/students/StatusPickerSheet'
import { PrintQrSheet } from '@/components/students/PrintQrSheet'
import { ContactCard } from '@/components/students/ContactCard'
import { AddSubscriptionPeriodSheet } from '@/components/students/AddSubscriptionPeriodSheet'
import { EditPaymentAmountSheet } from '@/components/students/EditPaymentAmountSheet'
import { MonthPaymentBadge } from '@/components/students/MonthPaymentBadge'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { palette } from '@/theme'
import type { EnrollmentStatus, SchoolMonth, StudentContact, TopUpDto, ContactDto, SubscriptionRangeDto } from '@/types/student'
import type { Order } from '@/types/order'

type TabKey = 'profile' | 'contacts' | 'wallet' | 'orders' | 'payments' | 'logs'

export default function StudentDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>()
  const parsed = z.coerce.number().int().positive().safeParse(rawId)
  if (!parsed.success) return <EmptyState title="Invalid student link" />
  const studentId = parsed.data

  const toast = useToast()
  const canManageStatus   = usePermission('enrollment')   // admin/manager
  const canTogglePayment  = usePermission('enrollment')
  const canManageContacts = usePermission('students')     // admin/manager/supervisor
  const canDeleteStudent  = usePermission('references_branches') // admin only
  const isAdminManager    = usePermission('enrollment')

  const [tab, setTab] = useState<TabKey>('profile')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showPrintQr, setShowPrintQr] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddPeriod, setShowAddPeriod] = useState(false)
  const [showRegenQr, setShowRegenQr] = useState(false)
  const [editPayment, setEditPayment] = useState<{ id: number; amount: number } | null>(null)
  const [editContact, setEditContact] = useState<StudentContact | null>(null)
  const [deleteContact, setDeleteContact] = useState<StudentContact | null>(null)

  const { data: student, isLoading, refetch } = useStudentDetail(studentId)
  const { data: contactsData, refetch: refetchContacts } = useStudentContacts(studentId)
  const { data: paymentsData } = useStudentPayments(studentId)
  const { data: ordersData, fetchNextPage, hasNextPage, isFetchingNextPage } = useStudentOrders(studentId)
  const { data: walletData } = useStudentWalletTransactions(studentId)

  const { mutate: deleteStudent,   isPending: isDeleting }  = useDeleteStudent()
  const { mutate: topUp,           isPending: isTopping }   = useTopUp(studentId)
  const { mutate: updateStatus,    isPending: isUpdating }  = useUpdateStatus(studentId)
  const { mutate: regenerateQr,    isPending: isRegen }     = useRegenerateQr(studentId)
  const { mutate: togglePayment }                           = useTogglePayment(studentId)
  const { mutate: updatePayAmt,    isPending: isUpdatingAmt } = useUpdatePaymentAmount(studentId)
  const { mutate: addPeriod,       isPending: isAddingPeriod } = useAddSubscriptionRange(studentId)
  const { mutate: removeContact,   isPending: isRemovingContact } = useRemoveContact(studentId)
  const { mutate: resendActivation } = useResendActivation(studentId)

  const orders = ordersData?.pages.flatMap((p: any) => p.data ?? []) ?? []
  const walletTx = Array.isArray(walletData) ? walletData : (walletData as any)?.data ?? []
  const contacts = Array.isArray(contactsData) ? contactsData as StudentContact[] : (contactsData as any)?.data ?? []
  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData as any)?.data ?? []

  const handleTopUp = (data: TopUpDto): void => {
    topUp(data, {
      onSuccess: () => { toast.success('Wallet topped up'); setShowTopUp(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleStatusChange = (status: EnrollmentStatus, reason?: string): void => {
    updateStatus({ enrollment_status: status, reason }, {
      onSuccess: () => { toast.success('Status updated'); setShowStatusPicker(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    deleteStudent(studentId, {
      onSuccess: () => { router.back() },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleRegenerateQr = (): void => {
    regenerateQr(undefined, {
      onSuccess: () => { toast.success('QR regenerated'); setShowRegenQr(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const renderOrder = useCallback(({ item }: { item: Order }) => (
    <View style={styles.orderRow}>
      <Text variant="labelSmall" style={styles.orderReceipt}>{item.receipt_number}</Text>
      <Text variant="bodySmall" style={styles.meta}>{item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</Text>
      <View style={styles.orderRight}>
        <Text variant="labelSmall" style={styles.meta}>{item.payment_method}</Text>
        <Text variant="bodyMedium" style={styles.amount}>{formatCurrency(item.total)}</Text>
        <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d')}</Text>
      </View>
    </View>
  ), [])

  if (isLoading) return <SkeletonCard count={6} />
  if (student === undefined) return <EmptyState title="Student not found" />

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={student.full_name} subtitle={student.grade_level} />
        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={
            <Appbar.Action icon="dots-vertical" onPress={() => setMenuOpen(true)} accessibilityLabel="More actions" />
          }
        >
          {canManageStatus && <Menu.Item onPress={() => { setMenuOpen(false); setShowStatusPicker(true) }} title="Change Status" />}
          <Menu.Item onPress={() => { setMenuOpen(false); setShowTopUp(true) }} title="Top Up Wallet" />
          <Menu.Item onPress={() => { setMenuOpen(false); setShowPrintQr(true) }} title="Print QR Code" />
          {canDeleteStudent && <Menu.Item onPress={() => { setMenuOpen(false); setShowDeleteConfirm(true) }} title="Remove Student" titleStyle={{ color: palette.red500 }} />}
        </Menu>
      </Appbar.Header>

      {/* Quick stats */}
      <Surface style={styles.statsBar} elevation={1}>
        <View style={styles.statItem}>
          <Text variant="labelSmall" style={styles.statLabel}>Wallet</Text>
          <Text variant="titleSmall" style={styles.statGreen}>{formatCurrency(student.wallet_balance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="labelSmall" style={styles.statLabel}>Points</Text>
          <Text variant="titleSmall" style={styles.statValue}>{student.points}</Text>
        </View>
        {student.credit_balance > 0 && (
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>Credit</Text>
            <Text variant="titleSmall" style={styles.statRed}>{formatCurrency(student.credit_balance)}</Text>
          </View>
        )}
        <View style={styles.statItem}>
          <Text variant="labelSmall" style={styles.statLabel}>Status</Text>
          <Text variant="titleSmall" style={styles.statValue}>{student.enrollment_status}</Text>
        </View>
      </Surface>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <SegmentedButtons
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          buttons={[
            { value: 'profile',  label: 'Profile' },
            { value: 'contacts', label: 'Contacts' },
            { value: 'wallet',   label: 'Wallet' },
            { value: 'orders',   label: 'Orders' },
            ...(student.student_type === 'subscription' ? [{ value: 'payments', label: 'Payments' }] : []),
            { value: 'logs',     label: 'Logs' },
          ]}
          style={styles.tabs}
        />
      </ScrollView>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <ScrollView
          style={styles.tabContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={palette.orange500} />}
        >
          <Surface style={styles.section} elevation={1}>
            <DataTable>
              {[
                ['First Name', student.first_name],
                ['Last Name', student.last_name],
                ['Student #', student.student_number],
                ['Grade', student.grade_level],
                ['Section', student.section ?? '—'],
                ['Birthday', student.birthday !== null ? formatDate(student.birthday) : '—'],
                ['Type', student.student_type],
                ['Allergies', student.allergies ?? '—'],
              ].map(([label, value]) => (
                <DataTable.Row key={label}>
                  <DataTable.Cell textStyle={styles.tableKey}>{label}</DataTable.Cell>
                  <DataTable.Cell>{value}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Surface>

          <Surface style={[styles.section, styles.qrSection]} elevation={1}>
            <QrCodeSvg value={student.qr_code} frameSize={160} />
            <Text variant="labelSmall" style={styles.qrLabel}>{student.qr_code}</Text>
            <View style={styles.qrActions}>
              <Button
                mode="outlined"
                icon="share-variant"
                onPress={() => Share.share({ message: student.qr_code })}
                accessibilityRole="button"
              >
                Share
              </Button>
              <Button
                mode="outlined"
                icon="refresh"
                onPress={() => setShowRegenQr(true)}
                accessibilityRole="button"
              >
                Regenerate
              </Button>
            </View>
          </Surface>
        </ScrollView>
      )}

      {/* Contacts Tab */}
      {tab === 'contacts' && (
        <ScrollView style={styles.tabContent}>
          {contacts.map((c: StudentContact) => (
            <View key={c.id} style={styles.contactWrapper}>
              <ContactCard
                contact={c}
                canManage={canManageContacts}
                canResend={isAdminManager}
                onEdit={() => setEditContact(c)}
                onDelete={() => setDeleteContact(c)}
                onResendActivation={() => resendActivation(c.id, { onSuccess: () => toast.success('Activation email sent') })}
              />
            </View>
          ))}
          {canManageContacts && contacts.length < 3 && (
            <Button mode="outlined" icon="account-plus" onPress={() => setEditContact(null)} style={styles.addContactBtn} accessibilityRole="button">
              Add Contact
            </Button>
          )}
        </ScrollView>
      )}

      {/* Wallet Tab */}
      {tab === 'wallet' && (
        <View style={styles.tabContent}>
          <Surface style={styles.walletHeader} elevation={1}>
            <Text variant="headlineMedium" style={styles.walletBalance}>
              {formatCurrency(student.wallet_balance)}
            </Text>
            <Button mode="contained" onPress={() => setShowTopUp(true)} style={styles.topUpBtn} accessibilityRole="button">
              Top Up
            </Button>
          </Surface>
          <FlatList
            data={walletTx}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item }: { item: any }) => (
              <View style={styles.txRow}>
                <View style={styles.txLeft}>
                  <Text variant="bodySmall" style={styles.txType}>{item.type}</Text>
                  {item.note !== undefined && <Text variant="bodySmall" style={styles.meta}>{item.note}</Text>}
                  <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d, h:mm a')}</Text>
                </View>
                <Text variant="titleSmall" style={item.amount >= 0 ? styles.statGreen : styles.statRed}>
                  {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={(o: Order) => String(o.id)}
          renderItem={renderOrder}
          onEndReached={() => { if (hasNextPage) void fetchNextPage() }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders yet" />}
          ListFooterComponent={isFetchingNextPage ? <Text style={styles.meta}>Loading…</Text> : null}
        />
      )}

      {/* Payments Tab */}
      {tab === 'payments' && student.student_type === 'subscription' && (
        <ScrollView style={styles.tabContent}>
          <View style={styles.monthsGrid}>
            {(SCHOOL_MONTHS as readonly SchoolMonth[]).map((month) => {
              const payment = payments.find((p: any) => p.school_month === month)
              if (payment === undefined) return null
              return (
                <View key={month} style={styles.paymentRow}>
                  <Text variant="bodyMedium" style={styles.monthLabel}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </Text>
                  <MonthPaymentBadge
                    month={month}
                    status={payment.status}
                    canToggle={canTogglePayment}
                    onPress={() => togglePayment(payment.id)}
                  />
                  <Text variant="bodyMedium">{formatCurrency(payment.amount)}</Text>
                  {canTogglePayment && payment.status === 'unpaid' && (
                    <IconButton icon="pencil" size={16} onPress={() => setEditPayment({ id: payment.id, amount: payment.amount })} accessibilityLabel="Edit amount" />
                  )}
                </View>
              )
            })}
          </View>
          {canTogglePayment && (
            <Button mode="outlined" onPress={() => setShowAddPeriod(true)} style={styles.addPeriodBtn} accessibilityRole="button">
              Add Subscription Period
            </Button>
          )}
        </ScrollView>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <FlatList
          data={(student as any).activities ?? []}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: { item: any }) => (
            <View style={styles.logRow}>
              <Text variant="bodySmall" style={styles.meta}>{formatDate(item.created_at, 'MMM d, h:mm a')} · {item.causer_name}</Text>
              <Text variant="bodyMedium">{item.description}</Text>
              <Divider style={styles.logDivider} />
            </View>
          )}
          ListEmptyComponent={<EmptyState icon="history" title="No activity logs" />}
        />
      )}

      {/* Modals */}
      {showTopUp && (
        <WalletTopUpSheet visible currentBalance={student.wallet_balance} studentName={student.full_name} loading={isTopping} onConfirm={handleTopUp} onDismiss={() => setShowTopUp(false)} />
      )}
      {showStatusPicker && (
        <StatusPickerSheet visible currentStatus={student.enrollment_status} onConfirm={handleStatusChange} onDismiss={() => setShowStatusPicker(false)} />
      )}
      {showPrintQr && (
        <PrintQrSheet visible studentName={student.full_name} qrCode={student.qr_code} onDismiss={() => setShowPrintQr(false)} />
      )}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Remove Student"
        message={`Remove ${student.full_name}? This cannot be undone.`}
        confirmLabel="Remove"
        loading={isDeleting}
        onConfirm={handleDelete}
        onDismiss={() => setShowDeleteConfirm(false)}
      />
      <ConfirmDialog
        visible={showRegenQr}
        title="Regenerate QR Code"
        message="This will invalidate the current QR code."
        confirmLabel="Regenerate"
        confirmColor={palette.orange500}
        loading={isRegen}
        onConfirm={handleRegenerateQr}
        onDismiss={() => setShowRegenQr(false)}
      />
      {editPayment !== null && (
        <EditPaymentAmountSheet
          visible
          currentAmount={editPayment.amount}
          loading={isUpdatingAmt}
          onConfirm={(amount) => {
            updatePayAmt({ paymentId: editPayment.id, amount }, {
              onSuccess: () => { toast.success('Amount updated'); setEditPayment(null) },
              onError: (err) => toast.error(getApiError(err)),
            })
          }}
          onDismiss={() => setEditPayment(null)}
        />
      )}
      {showAddPeriod && (
        <AddSubscriptionPeriodSheet
          visible
          loading={isAddingPeriod}
          onConfirm={(data: SubscriptionRangeDto) => {
            addPeriod(data, {
              onSuccess: () => { toast.success('Period added'); setShowAddPeriod(false) },
              onError: (err) => toast.error(getApiError(err)),
            })
          }}
          onDismiss={() => setShowAddPeriod(false)}
        />
      )}
      <ConfirmDialog
        visible={deleteContact !== null}
        title="Delete Contact"
        message={`Delete ${deleteContact?.full_name ?? ''}?`}
        loading={isRemovingContact}
        onConfirm={() => {
          if (deleteContact === null) return
          removeContact(deleteContact.id, {
            onSuccess: () => { toast.success('Contact deleted'); setDeleteContact(null); void refetchContacts() },
            onError: (err) => toast.error(getApiError(err)),
          })
        }}
        onDismiss={() => setDeleteContact(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.white,
    gap: 20,
  },
  statItem: { alignItems: 'center' },
  statLabel: { color: palette.zinc500, textTransform: 'uppercase' },
  statValue: { color: palette.zinc950 },
  statGreen: { color: palette.green500, fontWeight: '700' },
  statRed: { color: palette.red500, fontWeight: '700' },
  tabScroll: { maxHeight: 56, backgroundColor: palette.white },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  tabContent: { flex: 1 },
  section: { margin: 16, borderRadius: 12, backgroundColor: palette.white, overflow: 'hidden' },
  qrSection: { alignItems: 'center', padding: 20, gap: 12 },
  qrLabel: { color: palette.zinc500, fontFamily: 'monospace' },
  qrActions: { flexDirection: 'row', gap: 12 },
  tableKey: { color: palette.zinc500 },
  contactWrapper: { margin: 16, marginBottom: 0 },
  addContactBtn: { margin: 16 },
  walletHeader: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.white,
  },
  walletBalance: { color: palette.green500, fontWeight: '700' },
  topUpBtn: { minWidth: 120 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  txLeft: { flex: 1 },
  txType: { color: palette.zinc950, fontWeight: '600', textTransform: 'capitalize' },
  orderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  orderReceipt: { color: palette.zinc950, fontWeight: '600', width: 100 },
  orderRight: { alignItems: 'flex-end', gap: 2 },
  amount: { color: palette.zinc950, fontWeight: '600' },
  meta: { color: palette.zinc500 },
  monthsGrid: { padding: 16, gap: 8 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  monthLabel: { width: 80, color: palette.zinc950 },
  addPeriodBtn: { margin: 16 },
  logRow: { paddingHorizontal: 16, paddingVertical: 8 },
  logDivider: { marginTop: 8 },
})
