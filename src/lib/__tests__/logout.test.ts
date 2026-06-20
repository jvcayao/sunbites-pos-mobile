import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '@/api/auth'
import { performLogout } from '../logout'

jest.mock('@/api/auth')
jest.mock('@/lib/queryClient', () => ({
  queryClient: { clear: jest.fn() },
}))

const mockAuthApi = authApi as jest.Mocked<typeof authApi>
const mockQueryClient = queryClient as jest.Mocked<typeof queryClient>
const mockRouter = router as jest.Mocked<typeof router>

function seedAuthState(): void {
  useAuthStore.setState({
    token: 'tok_xyz',
    user: {
      id: 1,
      first_name: 'Juan',
      last_name: 'dela Cruz',
      full_name: 'Juan dela Cruz',
      email: 'juan@sunbites.com',
      roles: ['cashier'],
      branches: [{ id: 1, name: 'Main', slug: 'main' }],
    },
    activeBranch: { id: 1, name: 'Main', slug: 'main' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  seedAuthState()
  // Cart: put something in it so we can verify clear
  useCartStore.setState({
    items: [{ menuItem: { id: 1, name: 'Chicken Rice', price: 65, category: 'meal', is_available: true, is_subscription_item: false, sort_order: 1, inventory_status: 'OK', has_inventory_mapping: true }, quantity: 1 }],
    student: null,
    isWalkIn: false,
  })
})

// ── manual logout (callApi = true) ────────────────────────────────────────────

describe('performLogout — manual logout', () => {
  it('calls POST /auth/logout API', async () => {
    mockAuthApi.logout.mockResolvedValue({} as any)
    await performLogout()
    expect(mockAuthApi.logout).toHaveBeenCalledTimes(1)
  })

  it('clears auth state even when the API call fails', async () => {
    mockAuthApi.logout.mockRejectedValue(new Error('network'))
    await performLogout()
    const { token, user, activeBranch } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
    expect(activeBranch).toBeNull()
  })

  it('clears the cart', async () => {
    mockAuthApi.logout.mockResolvedValue({} as any)
    await performLogout()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears the React Query cache', async () => {
    mockAuthApi.logout.mockResolvedValue({} as any)
    await performLogout()
    expect(mockQueryClient.clear).toHaveBeenCalledTimes(1)
  })

  it('navigates to /(auth)/login after logout', async () => {
    mockAuthApi.logout.mockResolvedValue({} as any)
    await performLogout()
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login')
  })
})

// ── 401-triggered logout (callApi = false) ────────────────────────────────────

describe('performLogout — 401-triggered (callApi=false)', () => {
  it('does NOT call the logout API', async () => {
    await performLogout(false)
    expect(mockAuthApi.logout).not.toHaveBeenCalled()
  })

  it('still clears auth state, cart, cache, and navigates', async () => {
    await performLogout(false)
    expect(useAuthStore.getState().token).toBeNull()
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(mockQueryClient.clear).toHaveBeenCalled()
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login')
  })
})
