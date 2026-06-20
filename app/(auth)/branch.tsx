import { useCallback, useEffect, useState } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { Text, Surface, TouchableRipple, Button, ActivityIndicator } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { authApi } from '@/api/auth'
import { queryClient } from '@/lib/queryClient'
import { performLogout } from '@/lib/logout'
import client from '@/api/client'
import { palette } from '@/theme'
import type { Branch } from '@/types/auth'

export default function BranchScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>()
  const isSwitchMode = mode === 'switch'

  const { user, activeBranch, setActiveBranch } = useAuthStore()
  const isAdmin = user?.roles.includes('admin') ?? false

  const [branches, setBranches] = useState<Branch[]>(user?.branches ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      setLoading(true)
      client
        .get<Branch[]>('/branches')
        .then((res) => setBranches(res.data))
        .catch(() => setBranches(user?.branches ?? []))
        .finally(() => setLoading(false))
    } else {
      setBranches(user?.branches ?? [])
    }
  }, [isAdmin, user?.branches])

  // Auto-select single branch (only on login flow, not switch mode)
  useEffect(() => {
    if (!isSwitchMode && branches.length === 1) {
      handleSelect(branches[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, isSwitchMode])

  const handleSelect = useCallback(
    async (branch: Branch) => {
      try {
        await authApi.setBranch(branch.id, activeBranch?.id)
      } catch {
        // branch context set server-side is best-effort;
        // API still enforces authorization per request
      }
      setActiveBranch(branch)
      // Clear stale data and cart from previous branch session
      queryClient.clear()
      useCartStore.getState().clearCart()
      router.replace('/(app)/pos')
    },
    [activeBranch, setActiveBranch],
  )

  const handleLogout = (): Promise<void> => performLogout()

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.orange500} />
      </View>
    )
  }

  if (!isSwitchMode && branches.length === 1) return null

  return (
    <View style={styles.container}>
      {isSwitchMode && (
        <Button
          icon="arrow-left"
          mode="text"
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          Back
        </Button>
      )}

      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {isSwitchMode ? 'Switch Branch' : 'Select Branch'}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose the branch you are working at today
        </Text>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActive = isSwitchMode && activeBranch?.id === item.id
          return (
            <Surface
              style={[styles.card, isActive && styles.cardActive]}
              elevation={1}
            >
              <TouchableRipple
                onPress={() => handleSelect(item)}
                borderless
                style={styles.ripple}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.name}`}
                accessibilityState={{ selected: isActive }}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Text variant="titleMedium" style={isActive && styles.activeText}>
                      {item.name}
                    </Text>
                    {isActive && (
                      <Text variant="labelSmall" style={styles.activeBadge}>
                        Active
                      </Text>
                    )}
                  </View>
                  <Text variant="bodySmall" style={styles.slug}>{item.slug}</Text>
                </View>
              </TouchableRipple>
            </Surface>
          )
        }}
      />

      {!isSwitchMode && (
        <Button
          mode="text"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textColor={palette.zinc500}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          Sign out
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.zinc100,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: { marginBottom: 32 },
  title: { color: palette.zinc950, fontWeight: 'bold' },
  subtitle: { color: palette.zinc500, marginTop: 4 },
  list: { gap: 12 },
  card: { borderRadius: 12, overflow: 'hidden' },
  cardActive: { borderWidth: 2, borderColor: palette.orange500 },
  ripple: { borderRadius: 12 },
  cardContent: { padding: 20 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeText: { color: palette.orange500 },
  activeBadge: {
    color: palette.orange500,
    backgroundColor: palette.orange100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  slug: { color: palette.zinc500, marginTop: 2 },
  logoutBtn: { marginTop: 24, marginBottom: 16 },
})
