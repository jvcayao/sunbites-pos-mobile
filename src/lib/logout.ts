import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '@/api/auth'

/**
 * Central logout — clears token, Zustand state, cart, React Query cache,
 * and navigates to login. Safe to call from any logout path.
 *
 * @param callApi - true (default) for manual logout (calls POST /auth/logout);
 *                  false for 401-triggered logout (token is already invalid).
 */
export async function performLogout(callApi = true): Promise<void> {
  if (callApi) {
    try {
      await authApi.logout()
    } catch {
      // server-side logout is best-effort; proceed with local teardown regardless
    }
  }
  await useAuthStore.getState().logout()
  useCartStore.getState().clearCart()
  queryClient.clear()
  router.replace('/(auth)/login')
}
