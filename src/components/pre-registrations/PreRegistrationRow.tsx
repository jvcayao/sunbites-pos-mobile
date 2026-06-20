import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { formatDate } from '@/lib/formatters'
import { isExpiringSoon } from '@/types/pre-registration'
import { palette } from '@/theme'
import type { PreRegistrationListItem } from '@/types/pre-registration'

interface Props {
  item: PreRegistrationListItem
  onPress: (id: number) => void
}

const BADGE_COLOR: Record<string, string> = {
  subscription:     '#F97316',
  non_subscription: palette.zinc500,
}

const BADGE_LABEL: Record<string, string> = {
  subscription:     'Subscription',
  non_subscription: 'Non-Subscription',
}

function PreRegistrationRowBase({ item, onPress }: Props): React.JSX.Element {
  const expiringSoon = item.status === 'pending' && isExpiringSoon(item.expires_at)
  const badgeColor = BADGE_COLOR[item.enrollment_type] ?? palette.zinc500
  const badgeLabel = BADGE_LABEL[item.enrollment_type] ?? item.enrollment_type

  return (
    <Pressable
      testID={`pre-reg-row-${item.id}`}
      onPress={() => onPress(item.id)}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`Pre-registration for ${item.full_name}`}
    >
      <View style={styles.topRow}>
        <Text variant="titleSmall" style={styles.name} numberOfLines={1}>
          {item.full_name}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text variant="labelSmall" style={styles.badgeText}>
            {badgeLabel}
          </Text>
        </View>
      </View>

      <Text variant="bodySmall" style={styles.meta}>
        Guardian: {item.contact_name}
        {'  •  '}
        {formatDate(item.submitted_at)}
      </Text>

      {item.status === 'pending' && item.expires_at !== null && (
        <View style={styles.expiryRow}>
          <Text
            variant="bodySmall"
            style={[styles.expiry, expiringSoon && styles.expiryRed]}
          >
            Expires: {formatDate(item.expires_at)}
          </Text>
          {expiringSoon && (
            <MaterialCommunityIcons
              testID="expiry-warning"
              name="alert"
              size={14}
              color={palette.red500}
              style={styles.warningIcon}
              accessibilityLabel="Expiring soon"
            />
          )}
        </View>
      )}
    </Pressable>
  )
}

PreRegistrationRowBase.displayName = 'PreRegistrationRow'
export const PreRegistrationRow = React.memo(PreRegistrationRowBase)

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: palette.zinc900,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: palette.white,
    fontWeight: '600',
  },
  meta: {
    color: palette.zinc500,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiry: {
    color: palette.zinc500,
  },
  expiryRed: {
    color: palette.red500,
    fontWeight: '600',
  },
  warningIcon: {
    marginTop: 1,
  },
})
