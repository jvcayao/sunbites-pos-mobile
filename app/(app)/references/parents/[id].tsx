import { StyleSheet, View } from 'react-native'
import { Button, DataTable, Surface, Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { z } from 'zod'
import { useParentDetail } from '@/hooks/useReferences'
import { referencesApi } from '@/api/references'
import { usePermission } from '@/lib/permissions'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvatarInitials } from '@/components/references/AvatarInitials'
import { palette } from '@/theme'

export default function ParentDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>()
  const parsed = z.coerce.number().int().positive().safeParse(rawId)
  if (!parsed.success) return <EmptyState title="Invalid parent link" />

  const toast = useToast()
  const canResend = usePermission('enrollment') // admin/manager
  const { data, isLoading } = useParentDetail(parsed.data)

  if (isLoading) return <SkeletonCard count={3} />
  if (data === undefined) return <EmptyState title="Parent not found" />

  const parent = data as any

  const handleResend = async (): Promise<void> => {
    try {
      await referencesApi.parents.resendActivation(parsed.data)
      toast.success('Activation email sent')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <AvatarInitials name={parent.full_name} size={56} backgroundColor={palette.blue100} textColor={palette.blue500} />
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.name}>{parent.full_name}</Text>
          <Text variant="bodySmall" style={styles.meta}>{parent.email}</Text>
          {canResend && parent.activation_status === 'pending' && (
            <Button mode="text" compact onPress={handleResend} textColor={palette.blue500} style={styles.resendBtn} accessibilityRole="button">
              Resend Activation
            </Button>
          )}
        </View>
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Linked Students</Text>
        <DataTable>
          {(parent.students ?? []).map((s: any) => (
            <DataTable.Row key={s.id} onPress={() => router.push(`/(app)/students/${s.id}`)}>
              <DataTable.Cell>{s.full_name}</DataTable.Cell>
              <DataTable.Cell>{s.grade_level}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        {(parent.students?.length ?? 0) === 0 && (
          <Text variant="bodySmall" style={[styles.meta, { padding: 16 }]}>No students linked</Text>
        )}
      </Surface>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  header: { flexDirection: 'row', padding: 20, gap: 16, alignItems: 'center', backgroundColor: palette.white, marginBottom: 12 },
  info: { flex: 1 },
  name: { color: palette.zinc950, fontWeight: '700' },
  meta: { color: palette.zinc500, marginTop: 4 },
  resendBtn: { alignSelf: 'flex-start', marginTop: 4 },
  section: { margin: 16, borderRadius: 12, backgroundColor: palette.white, overflow: 'hidden' },
  sectionTitle: { padding: 16, fontWeight: '700', color: palette.zinc950 },
})
