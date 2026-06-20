import { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { Appbar, Surface, Text } from 'react-native-paper'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { useDashboard, useUpdateStaffStatus } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/formatters'
import { useLayout } from '@/hooks/useLayout'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { SectionHeader } from '@/components/dashboard/SectionHeader'
import { OrderRow } from '@/components/dashboard/OrderRow'
import { StaffRow } from '@/components/dashboard/StaffRow'
import { StaffStatusPicker } from '@/components/dashboard/StaffStatusPicker'
import { TopItemRow } from '@/components/dashboard/TopItemRow'
import { AlertRow } from '@/components/dashboard/AlertRow'
import { SkeletonKpi } from '@/components/shared/SkeletonKpi'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { palette } from '@/theme'
import type { StaffMember, StaffStatus } from '@/types/dashboard'

export default function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching, dataUpdatedAt } = useDashboard()
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateStaffStatus()
  const { isTablet, isLandscape } = useLayout()
  const [pickerStaff, setPickerStaff] = useState<StaffMember | null>(null)

  const kpiColumns = isTablet || isLandscape ? 3 : 2
  const updatedLabel = dataUpdatedAt
    ? `Updated ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
    : ''

  const handleStatusSelect = (status: StaffStatus): void => {
    if (pickerStaff === null) return
    updateStatus({ userId: pickerStaff.id, status })
    setPickerStaff(null)
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="Dashboard" />
        </Appbar.Header>
        <SkeletonKpi count={6} columns={kpiColumns} />
        <SkeletonCard count={4} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Dashboard" subtitle={updatedLabel} />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.orange500}
            colors={[palette.orange500]}
          />
        }
      >
        {/* KPI Cards */}
        <View style={[styles.kpiGrid, { gap: 12 }]}>
          {[
            { label: 'Total Students', value: data?.total_students ?? 0, icon: 'account-group' as const },
            { label: 'Enrolled', value: data?.enrolled_count ?? 0, icon: 'account-check' as const, iconColor: palette.green500 },
            { label: 'Meals Today', value: data?.meals_today ?? 0, icon: 'food' as const },
            { label: 'Revenue Today', value: formatCurrency(data?.revenue_today ?? 0), icon: 'cash' as const, iconColor: palette.green500 },
            { label: 'Walk-in Orders', value: data?.walkin_orders ?? 0, icon: 'walk' as const, iconColor: palette.blue500 },
            { label: 'Wallet Orders', value: data?.wallet_orders ?? 0, icon: 'wallet' as const, iconColor: '#A855F7' },
          ].reduce<React.ReactNode[][]>((rows, card, i) => {
            const rowIdx = Math.floor(i / kpiColumns)
            if (rows[rowIdx] === undefined) rows[rowIdx] = []
            rows[rowIdx].push(
              <KpiCard key={card.label} label={card.label} value={card.value} icon={card.icon} iconColor={card.iconColor} />,
            )
            return rows
          }, []).map((row, i) => (
            <View key={i} style={styles.kpiRow}>{row}</View>
          ))}
        </View>

        {/* Recent Orders */}
        <Surface style={styles.section} elevation={1}>
          <SectionHeader title="Recent Orders" />
          {(data?.recent_orders.length ?? 0) === 0 ? (
            <EmptyState icon="receipt-outline" title="No orders today" />
          ) : (
            data?.recent_orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))
          )}
        </Surface>

        {/* Staff Roster */}
        <Surface style={styles.section} elevation={1}>
          <SectionHeader title="Staff Roster" />
          {(data?.staff_roster.length ?? 0) === 0 ? (
            <EmptyState icon="account-group-outline" title="No staff on roster" />
          ) : (
            data?.staff_roster.map((staff) => (
              <StaffRow
                key={staff.id}
                staff={staff}
                onStatusPress={(s) => setPickerStaff(s)}
              />
            ))
          )}
        </Surface>

        {/* Top Items */}
        <Surface style={styles.section} elevation={1}>
          <SectionHeader title="Top Items Today" />
          {(data?.top_items.length ?? 0) === 0 ? (
            <EmptyState icon="chart-bar" title="No sales data yet" />
          ) : (
            data?.top_items.map((item, i) => (
              <TopItemRow key={item.name} item={item} rank={i + 1} />
            ))
          )}
        </Surface>

        {/* Low Stock Alerts */}
        {(data?.low_stock.length ?? 0) > 0 && (
          <Surface style={styles.section} elevation={1}>
            <SectionHeader title="⚠ Low Stock" />
            {data?.low_stock.map((item) => (
              <AlertRow
                key={item.id}
                label={item.name}
                value={`${item.quantity} left`}
                sub={item.status}
                variant="stock"
                onPress={() => router.push('/(app)/references/inventory')}
              />
            ))}
          </Surface>
        )}

        {/* Credit Alerts */}
        {(data?.credit_alerts.length ?? 0) > 0 && (
          <Surface style={styles.section} elevation={1}>
            <SectionHeader title="Outstanding Credits" />
            {data?.credit_alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                label={alert.full_name}
                value={formatCurrency(alert.credit_balance)}
                sub={alert.grade_level}
                variant="credit"
                onPress={() => router.push(`/(app)/students/${alert.id}`)}
              />
            ))}
          </Surface>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {pickerStaff !== null && (
        <StaffStatusPicker
          visible
          staffName={pickerStaff.full_name}
          currentStatus={pickerStaff.status}
          loading={updatingStatus}
          onSelect={handleStatusSelect}
          onDismiss={() => setPickerStaff(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  kpiGrid: { padding: 16 },
  kpiRow: { flexDirection: 'row', gap: 12 },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: palette.white,
  },
  bottomPad: { height: 24 },
})
