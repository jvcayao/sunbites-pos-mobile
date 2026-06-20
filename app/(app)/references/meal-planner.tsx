import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Appbar, Button, Chip, SegmentedButtons, Surface, Text, TextInput } from 'react-native-paper'
import { useMealPlanner, useUpdateMealPlanner, useResetMealPlanner, useUpdateMealPlannerVisibility } from '@/hooks/useReferences'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { SCHOOL_MONTHS } from '@/lib/constants'
import { palette } from '@/theme'
import type { SchoolMonth } from '@/types/student'
import type { MealDay } from '@/types/references'

const DAYS: MealDay['day_of_week'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const COLS: Array<keyof Omit<MealDay, 'day_of_week'>> = ['ulam', 'vegetables', 'fruit', 'soup', 'snacks']
const COL_COLORS = [palette.orange500, palette.green500, palette.blue500, '#0EA5E9', '#A855F7']

export default function MealPlannerScreen() {
  const toast = useToast()
  const canEdit = usePermission('enrollment') // admin/manager
  const [month, setMonth] = useState<SchoolMonth>('june')
  const [week, setWeek]   = useState(1)
  const [editMode, setEditMode] = useState(false)
  const [localDays, setLocalDays] = useState<MealDay[]>([])
  const [showReset, setShowReset] = useState(false)
  const [showVisibility, setShowVisibility] = useState(false)

  const { data, isLoading } = useMealPlanner(month, week)
  const { mutate: save,   isPending: isSaving }   = useUpdateMealPlanner()
  const { mutate: reset,  isPending: isResetting } = useResetMealPlanner()
  const { mutate: toggle, isPending: isToggling }  = useUpdateMealPlannerVisibility()

  const plan = data as any

  useEffect(() => {
    if (plan?.days) setLocalDays(plan.days)
  }, [plan])

  const updateCell = (day: string, col: string, value: string): void => {
    setLocalDays((prev) => prev.map((d) => d.day_of_week === day ? { ...d, [col]: value } : d))
  }

  const handleSave = (): void => {
    save({ month, week_number: week, days: localDays }, {
      onSuccess: () => { toast.success('Week saved'); setEditMode(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleReset = (): void => {
    reset({ month, week_number: week }, {
      onSuccess: () => { toast.success('Week reset'); setShowReset(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const handleToggleVisibility = (): void => {
    toggle({ month, week_number: week, visible_to_parents: !plan?.visible_to_parents }, {
      onSuccess: () => { toast.success('Visibility updated'); setShowVisibility(false) },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Meal Planner" />
        {plan !== undefined && (
          <Chip
            compact
            style={plan.visible_to_parents ? styles.visibleChip : styles.hiddenChip}
            textStyle={{ fontSize: 11, color: plan.visible_to_parents ? palette.green500 : palette.zinc500 }}
            onPress={canEdit ? () => setShowVisibility(true) : undefined}
          >
            {plan.visible_to_parents ? 'Visible to Parents' : 'Hidden'}
          </Chip>
        )}
        {canEdit && !editMode && <Appbar.Action icon="pencil" onPress={() => setEditMode(true)} accessibilityLabel="Edit" />}
        {canEdit && editMode && <Appbar.Action icon="check" onPress={handleSave} accessibilityLabel="Save" />}
      </Appbar.Header>

      <FilterChipRow>
        {(SCHOOL_MONTHS as readonly SchoolMonth[]).map((m) => (
          <FilterChip key={m} label={m.slice(0, 3).toUpperCase()} active={month === m} onPress={() => { setMonth(m); setEditMode(false) }} />
        ))}
      </FilterChipRow>

      <SegmentedButtons
        value={String(week)}
        onValueChange={(v) => { setWeek(Number(v)); setEditMode(false) }}
        buttons={[1, 2, 3, 4].map((w) => ({ value: String(w), label: `Week ${w}` }))}
        style={styles.weekTabs}
      />

      {isLoading ? <Text style={styles.loading}>Loading…</Text> : (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Header */}
            <View style={styles.gridRow}>
              <View style={[styles.dayCell, styles.headerCell]}><Text variant="labelSmall" style={styles.headerText}>Day</Text></View>
              {COLS.map((col, i) => (
                <View key={col} style={[styles.mealCell, styles.headerCell, { borderTopColor: COL_COLORS[i] }]}>
                  <Text variant="labelSmall" style={[styles.headerText, { color: COL_COLORS[i] }]}>{col}</Text>
                </View>
              ))}
            </View>
            {/* Rows */}
            {DAYS.map((day) => {
              const row = localDays.find((d) => d.day_of_week === day)
              return (
                <Surface key={day} style={styles.gridRow} elevation={0}>
                  <View style={styles.dayCell}>
                    <Text variant="labelSmall" style={styles.dayText}>{day.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  {COLS.map((col) => (
                    <View key={col} style={styles.mealCell}>
                      {editMode ? (
                        <TextInput
                          mode="flat"
                          dense
                          value={(row as any)?.[col] ?? ''}
                          onChangeText={(v) => updateCell(day, col, v)}
                          style={styles.cellInput}
                          accessibilityLabel={`${day} ${col}`}
                        />
                      ) : (
                        <Text variant="bodySmall" style={styles.cellText}>{(row as any)?.[col] ?? '—'}</Text>
                      )}
                    </View>
                  ))}
                </Surface>
              )
            })}
          </View>
        </ScrollView>
      )}

      {canEdit && editMode && (
        <View style={styles.editActions}>
          <Button mode="outlined" onPress={() => setShowReset(true)} textColor={palette.red500}>Reset Week</Button>
          <Button mode="contained" onPress={handleSave} loading={isSaving}>Save Week</Button>
        </View>
      )}

      <ConfirmDialog visible={showReset} title="Reset Week" message="Reset this week to default pattern?" confirmLabel="Reset" loading={isResetting} onConfirm={handleReset} onDismiss={() => setShowReset(false)} />
      <ConfirmDialog visible={showVisibility} title="Toggle Visibility" message={`Make this week ${plan?.visible_to_parents ? 'hidden from' : 'visible to'} parents?`} confirmLabel="Confirm" confirmColor={palette.orange500} loading={isToggling} onConfirm={handleToggleVisibility} onDismiss={() => setShowVisibility(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  appbar: { backgroundColor: palette.white },
  weekTabs: { marginHorizontal: 16, marginVertical: 8 },
  loading: { textAlign: 'center', padding: 32, color: palette.zinc500 },
  gridRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200, backgroundColor: palette.white },
  headerCell: { backgroundColor: palette.zinc50 },
  headerText: { color: palette.zinc500, textTransform: 'uppercase' },
  dayCell: { width: 44, padding: 8, justifyContent: 'center', alignItems: 'center' },
  dayText: { color: palette.zinc950, fontWeight: '700', textTransform: 'uppercase' },
  mealCell: { width: 120, padding: 8, justifyContent: 'center', borderTopWidth: 2, borderTopColor: 'transparent' },
  cellText: { color: palette.zinc950 },
  cellInput: { backgroundColor: 'transparent', fontSize: 12, paddingHorizontal: 0 },
  editActions: { flexDirection: 'row', padding: 16, gap: 12, justifyContent: 'flex-end' },
  visibleChip: { backgroundColor: palette.green100 },
  hiddenChip: { backgroundColor: palette.zinc100 },
})
