import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, Divider, Modal, Portal, Surface, Text, TextInput } from 'react-native-paper'
import { useMonthlyAmounts, useBranchList } from '@/hooks/useReferences'
import { referencesApi } from '@/api/references'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { AppHeader } from '@/components/shared/AppHeader'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatters'
import { palette } from '@/theme'
import type { SchoolMonth } from '@/types/student'

const YEARS = Array.from({ length: 7 }, (_, i) => 2024 + i)

export default function SubscriptionConfigScreen() {
  const toast = useToast()
  const [year, setYear] = useState(new Date().getFullYear())
  const [editCell, setEditCell] = useState<{ branchId: number; month: SchoolMonth; existing?: any } | null>(null)
  const [days, setDays]   = useState('')
  const [amount, setAmount] = useState('')
  const [dailyRate, setDailyRate] = useState(0)

  const { data: amountsData } = useMonthlyAmounts(year)
  const { data: branchesData } = useBranchList()

  const amounts = Array.isArray(amountsData) ? amountsData : (amountsData as any)?.data ?? []
  const branches = Array.isArray(branchesData) ? branchesData : (branchesData as any)?.data ?? []

  const getCell = (branchId: number, month: SchoolMonth) =>
    amounts.find((a: any) => a.branch_id === branchId && a.school_month === month)

  const handleOpenCell = (branchId: number, month: SchoolMonth): void => {
    const existing = getCell(branchId, month)
    setEditCell({ branchId, month, existing })
    setDays(existing ? String(existing.school_days) : '')
    setAmount(existing?.amount ? String(existing.amount) : '')
  }

  const handleSave = async (): Promise<void> => {
    if (!editCell) return
    try {
      const payload = { branch_id: editCell.branchId, school_month: editCell.month, year, school_days: Number(days), amount: amount ? Number(amount) : undefined }
      if (editCell.existing) {
        await referencesApi.subscriptionConfig.updateAmount(editCell.existing.id, payload)
      } else {
        await referencesApi.subscriptionConfig.createAmount(payload)
      }
      toast.success('Saved')
      setEditCell(null)
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  const computed = dailyRate > 0 && days ? dailyRate * Number(days) : null

  return (
    <View style={styles.container}>
      <AppHeader title="Subscription Config" />
      <FilterChipRow>{YEARS.map((y) => <FilterChip key={y} label={String(y)} active={year === y} onPress={() => setYear(y)} />)}</FilterChipRow>

      <ScrollView horizontal>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.monthCell}><Text variant="labelSmall" style={styles.headerText}>Month</Text></View>
            {branches.map((b: any) => (
              <View key={b.id} style={styles.branchCell}>
                <Text variant="labelSmall" style={styles.headerText}>{b.name}</Text>
              </View>
            ))}
          </View>
          {/* Rows */}
          {(SCHOOL_MONTHS as readonly SchoolMonth[]).map((month) => (
            <View key={month} style={styles.dataRow}>
              <View style={styles.monthCell}>
                <Text variant="bodySmall" style={styles.monthText}>{month.slice(0, 3).toUpperCase()}</Text>
              </View>
              {branches.map((b: any) => {
                const cell = getCell(b.id, month)
                return (
                  <Button
                    key={b.id}
                    mode="text"
                    compact
                    style={styles.branchCell}
                    onPress={() => handleOpenCell(b.id, month)}
                    accessibilityLabel={`${month} ${b.name}`}
                  >
                    <Text variant="bodySmall" style={cell ? styles.configured : styles.unconfigured}>
                      {cell ? `${cell.school_days}d · ${formatCurrency(cell.amount ?? 0)}` : '—'}
                    </Text>
                  </Button>
                )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {editCell !== null && (
        <Portal>
          <Modal visible onDismiss={() => setEditCell(null)} contentContainerStyle={styles.modal}>
            <Surface style={styles.modalSurface} elevation={4}>
              <Text variant="titleMedium" style={styles.modalTitle}>
                {editCell.month.toUpperCase()} · {branches.find((b: any) => b.id === editCell.branchId)?.name}
              </Text>
              <Divider />
              <View style={styles.modalBody}>
                <TextInput label="School Days *" mode="outlined" value={days} onChangeText={setDays} keyboardType="number-pad" style={styles.input} />
                <TextInput label="Amount Override (₱, optional)" mode="outlined" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.input} />
                {computed !== null && !amount && (
                  <Text variant="bodySmall" style={styles.computed}>Computed: {formatCurrency(computed)}</Text>
                )}
              </View>
              <View style={styles.modalActions}>
                <Button onPress={() => setEditCell(null)}>Cancel</Button>
                <Button mode="contained" onPress={handleSave} disabled={!days}>Save</Button>
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
  headerRow: { flexDirection: 'row', backgroundColor: palette.zinc50, borderBottomWidth: 1, borderBottomColor: palette.zinc200 },
  dataRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  headerText: { color: palette.zinc500, textTransform: 'uppercase', padding: 8 },
  monthCell: { width: 52, padding: 8, justifyContent: 'center' },
  monthText: { color: palette.zinc950, fontWeight: '700' },
  branchCell: { width: 120, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: palette.zinc200, justifyContent: 'center' },
  configured: { color: palette.zinc950 },
  unconfigured: { color: palette.zinc500 },
  modal: { marginHorizontal: 20 },
  modalSurface: { borderRadius: 16, overflow: 'hidden' },
  modalTitle: { padding: 20, fontWeight: '700', color: palette.zinc950 },
  modalBody: { padding: 20, gap: 12 },
  input: { backgroundColor: palette.white },
  computed: { color: palette.orange500 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})
