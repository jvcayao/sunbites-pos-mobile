import * as SecureStore from 'expo-secure-store'
import { useAuthStore, TOKEN_KEY } from '../auth'
import type { AuthUser, Branch } from '@/types/auth'

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>

const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  first_name: 'Juan',
  last_name: 'dela Cruz',
  full_name: 'Juan dela Cruz',
  email: 'juan@sunbites.com',
  roles: ['cashier'],
  branches: [{ id: 1, name: 'Main Branch', slug: 'main' }],
  ...overrides,
})

const makeBranch = (overrides: Partial<Branch> = {}): Branch => ({
  id: 1,
  name: 'Main Branch',
  slug: 'main',
  ...overrides,
})

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, activeBranch: null })
  jest.clearAllMocks()
})

// ── login ─────────────────────────────────────────────────────────────────────

describe('useAuthStore — login', () => {
  it('stores the token in SecureStore under the correct key', async () => {
    mockSecureStore.setItemAsync.mockResolvedValue()
    const user = makeUser()
    await useAuthStore.getState().login('tok_abc123', user)
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'tok_abc123')
  })

  it('updates token and user in Zustand state', async () => {
    mockSecureStore.setItemAsync.mockResolvedValue()
    const user = makeUser()
    await useAuthStore.getState().login('tok_abc123', user)
    const state = useAuthStore.getState()
    expect(state.token).toBe('tok_abc123')
    expect(state.user).toEqual(user)
  })

  it('sets the token even when SecureStore succeeds immediately', async () => {
    mockSecureStore.setItemAsync.mockResolvedValue()
    await useAuthStore.getState().login('my-token', makeUser())
    expect(useAuthStore.getState().token).toBe('my-token')
  })
})

// ── logout ────────────────────────────────────────────────────────────────────

describe('useAuthStore — logout', () => {
  it('deletes the token from SecureStore', async () => {
    mockSecureStore.setItemAsync.mockResolvedValue()
    mockSecureStore.deleteItemAsync.mockResolvedValue()
    await useAuthStore.getState().login('tok_abc123', makeUser())
    await useAuthStore.getState().logout()
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY)
  })

  it('clears token, user, and activeBranch from Zustand state', async () => {
    mockSecureStore.setItemAsync.mockResolvedValue()
    mockSecureStore.deleteItemAsync.mockResolvedValue()
    await useAuthStore.getState().login('tok_abc123', makeUser())
    useAuthStore.setState({ activeBranch: makeBranch() })
    await useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.activeBranch).toBeNull()
  })
})

// ── setActiveBranch ───────────────────────────────────────────────────────────

describe('useAuthStore — setActiveBranch', () => {
  it('updates activeBranch in state', () => {
    const branch = makeBranch({ id: 2, name: 'North Branch', slug: 'north' })
    useAuthStore.getState().setActiveBranch(branch)
    expect(useAuthStore.getState().activeBranch).toEqual(branch)
  })

  it('replaces a previously selected branch', () => {
    const branch1 = makeBranch({ id: 1 })
    const branch2 = makeBranch({ id: 2, name: 'South', slug: 'south' })
    useAuthStore.getState().setActiveBranch(branch1)
    useAuthStore.getState().setActiveBranch(branch2)
    expect(useAuthStore.getState().activeBranch?.id).toBe(2)
  })
})
