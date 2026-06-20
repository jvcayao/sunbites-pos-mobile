import React, { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import {
  Appbar,
  ActivityIndicator,
  Chip,
  Text,
} from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { z } from 'zod'
import {
  usePreRegistrationDetail,
  useUpdatePreRegistration,
} from '@/hooks/usePreRegistrations'
import { DuplicateWarningBanner } from '@/components/pre-registrations/DuplicateWarningBanner'
import { PreRegistrationForm } from '@/components/pre-registrations/PreRegistrationForm'
import { PreRegistrationActions } from '@/components/pre-registrations/PreRegistrationActions'
import { RejectSheet } from '@/components/pre-registrations/RejectSheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/ErrorToast'
import { formatDate } from '@/lib/formatters'
import { palette } from '@/theme'
import type { UpdatePreRegistrationDto } from '@/types/pre-registration'

const idSchema = z.coerce.number().int().positive()

export default function PreRegistrationDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>()
  const parsed = idSchema.safeParse(id)

  if (!parsed.success) {
    return <EmptyState title="Invalid pre-registration link" icon="alert-circle-outline" />
  }

  return <DetailContent preRegistrationId={parsed.data} />
}

function DetailContent({ preRegistrationId }: { preRegistrationId: number }): React.JSX.Element {
  const toast = useToast()
  const [editMode, setEditMode] = useState(false)
  const [rejectSheetVisible, setRejectSheetVisible] = useState(false)
  const [editData, setEditData] = useState<UpdatePreRegistrationDto>({})

  const { data, isLoading, error, refetch, isRefetching } = usePreRegistrationDetail(preRegistrationId)
  const { mutate: update, isPending: isSaving } = useUpdatePreRegistration()

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.orange500} />
      </View>
    )
  }

  if (error !== null || data === undefined) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} accessibilityLabel="Back" />
          <Appbar.Content title="Pre-Registration" />
        </Appbar.Header>
        <EmptyState
          title="Failed to load pre-registration"
          subtitle="Pull to refresh or go back"
          icon="alert-circle-outline"
          actionLabel="Retry"
          onAction={refetch}
        />
      </View>
    )
  }

  const isPending = data.status === 'pending'
  const isExpired = data.status === 'expired'

  const handleStartEdit = (): void => {
    setEditData({
      first_name:              data.first_name,
      last_name:               data.last_name,
      student_number:          data.student_number ?? undefined,
      grade_level:             data.grade_level,
      section:                 data.section ?? undefined,
      birthday:                data.birthday,
      allergies:               data.allergies ?? undefined,
      notes:                   data.notes ?? undefined,
      enrollment_type:         data.enrollment_type,
      subscription_start_month: data.subscription_start_month ?? undefined,
      subscription_start_year:  data.subscription_start_year ?? undefined,
      subscription_end_month:   data.subscription_end_month ?? undefined,
      subscription_end_year:    data.subscription_end_year ?? undefined,
    })
    setEditMode(true)
  }

  const handleSave = (): void => {
    update(
      { id: preRegistrationId, data: editData },
      {
        onSuccess: () => {
          setEditMode(false)
          toast.success('Changes saved')
        },
        onError: () => {
          toast.error('Failed to save changes')
        },
      },
    )
  }

  const handleApproveSuccess = (): void => {
    toast.success('Enrolled successfully')
    router.back()
  }

  const handleRejectSuccess = (): void => {
    setRejectSheetVisible(false)
    toast.success('Pre-registration rejected')
    router.back()
  }

  const handleReactivateSuccess = (): void => {
    toast.success('Record reactivated')
    router.back()
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} accessibilityLabel="Back" />
        <Appbar.Content title={data.full_name} />
        {isPending && !editMode && (
          <Appbar.Action
            icon="pencil"
            onPress={handleStartEdit}
            accessibilityLabel="Edit pre-registration"
          />
        )}
        {editMode && (
          <>
            <Appbar.Action
              icon="close"
              onPress={() => setEditMode(false)}
              accessibilityLabel="Cancel edit"
            />
            <Appbar.Action
              icon="content-save"
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Save changes"
            />
          </>
        )}
      </Appbar.Header>

      <DuplicateWarningBanner
        duplicateWarning={data.duplicate_warning}
        existingStudentName={data.existing_student_name}
      />

      {editMode ? (
        <PreRegistrationForm
          data={editData}
          onChange={(update) => setEditData((prev) => ({ ...prev, ...update }))}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <SectionCard title="Student Information">
            <InfoRow label="Full name" value={data.full_name} />
            <InfoRow label="Student #" value={data.student_number ?? '—'} />
            <InfoRow label="Grade level" value={data.grade_level} />
            <InfoRow label="Section" value={data.section ?? '—'} />
            <InfoRow label="Birthday" value={formatDate(data.birthday)} />
            <InfoRow label="Allergies" value={data.allergies ?? '—'} />
            <InfoRow label="Notes" value={data.notes ?? '—'} />
          </SectionCard>

          <SectionCard title="Enrollment">
            <View style={styles.enrollmentRow}>
              <Chip
                compact
                style={{
                  backgroundColor:
                    data.enrollment_type === 'subscription' ? '#FED7AA' : palette.zinc100,
                }}
              >
                {data.enrollment_type === 'subscription' ? 'Subscription' : 'Non-Subscription'}
              </Chip>
            </View>
            {data.enrollment_type === 'subscription' &&
              data.subscription_start_month !== null && (
                <InfoRow
                  label="Period"
                  value={`${data.subscription_start_month} ${data.subscription_start_year ?? ''} – ${data.subscription_end_month ?? ''} ${data.subscription_end_year ?? ''}`}
                />
              )}
          </SectionCard>

          <SectionCard title={`Contacts (${data.contacts.length})`}>
            {data.contacts.map((c) => (
              <View key={c.id} style={styles.contactRow}>
                <Text variant="bodyMedium" style={styles.contactName}>
                  {c.full_name}
                </Text>
                <Text variant="bodySmall" style={styles.contactMeta}>
                  {c.relationship}{'  •  '}{c.phone}
                </Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Submission Info">
            <InfoRow label="Submitted" value={formatDate(data.submitted_at)} />
            {data.recaptcha_score !== null && (
              <InfoRow label="reCAPTCHA score" value={String(data.recaptcha_score)} />
            )}
            {data.submitter_ip !== null && (
              <InfoRow label="Submitter IP" value={data.submitter_ip} />
            )}
            {data.rejection_reason !== null && (
              <InfoRow label="Rejection reason" value={data.rejection_reason} />
            )}
            {data.rejected_by !== null && (
              <InfoRow label="Rejected by" value={data.rejected_by} />
            )}
            {data.approved_by !== null && (
              <InfoRow label="Approved by" value={data.approved_by} />
            )}
          </SectionCard>
        </ScrollView>
      )}

      {!editMode && (isPending || isExpired) && (
        <PreRegistrationActions
          preRegistrationId={preRegistrationId}
          status={data.status}
          onRejectPress={() => setRejectSheetVisible(true)}
          onReactivatePress={handleReactivateSuccess}
          onApproveSuccess={handleApproveSuccess}
        />
      )}

      <RejectSheet
        preRegistrationId={preRegistrationId}
        visible={rejectSheetVisible}
        onDismiss={() => setRejectSheetVisible(false)}
        onSuccess={handleRejectSuccess}
      />
    </View>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <View style={styles.sectionCard}>
      <Text variant="labelMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.infoRow}>
      <Text variant="bodySmall" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: palette.white },
  appbar:        { backgroundColor: palette.white },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:        { flex: 1 },
  sectionCard:   { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.zinc200 },
  sectionTitle:  { color: palette.zinc500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 16 },
  infoLabel:     { color: palette.zinc500, flex: 1 },
  infoValue:     { color: palette.zinc900, flex: 2, textAlign: 'right' },
  enrollmentRow: { flexDirection: 'row', marginBottom: 8 },
  contactRow:    { paddingVertical: 4 },
  contactName:   { color: palette.zinc900 },
  contactMeta:   { color: palette.zinc500 },
})
