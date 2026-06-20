import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import BranchScreen from '../branch'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { queryClient } from '@/lib/queryClient'
import client from '@/api/client'
import { performLogout } from '@/lib/logout'
import { router } from 'expo-router'
import type { ReactNode } from 'react'
import type { AuthUser, Branch } from '@/types/auth'

jest.mock('@/api/auth')
jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))
jest.mock('@/lib/queryClient', () => ({ queryClient: { clear: jest.fn() } }))
jest.mock('@/lib/logout')
jest.mock('@/store/auth')
jest.mock('@/store/cart', () => ({
  useCartStore: Object.assign(
    jest.fn(),
    { getState: jest.fn(() => ({ clearCart: jest.fn() })) }
  ),
}))

const mockAuthApi    = authApi as jest.Mocked<typeof authApi>
const mockClient     = client as jest.Mocked<typeof client>
const mockRouter     = router as jest.Mocked<typeof router>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockPerformLogout = performLogout as jest.MockedFunction<typeof performLogout>

const branch1: Branch = { id: 1, name: 'Main Branch', slug: 'main' }
const branch2: Branch = { id: 2, name: 'North Branch', slug: 'north' }

const cashierUser: AuthUser = {
  id: 1,
  first_name: 'Juan',
  last_name: 'dela Cruz',
  full_name: 'Juan dela Cruz',
  email: 'juan@sunbites.com',
  roles: ['cashier'],
  branches: [branch1, branch2],
}

const adminUser: AuthUser = {
  ...cashierUser,
  roles: ['admin'],
}

function seedStore(user: AuthUser, activeBranch: Branch | null = null): void {
  mockUseAuthStore.mockReturnValue({
    user,
    activeBranch,
    setActiveBranch: jest.fn(),
  } as any)
}

function Wrapper({ children }: { children: ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

function renderBranch() {
  return render(<BranchScreen />, { wrapper: Wrapper })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuthApi.setBranch.mockResolvedValue({} as any)
  ;(queryClient as any).clear = jest.fn()
  ;(useCartStore as any).getState = jest.fn(() => ({ clearCart: jest.fn() }))
  // Default expo-router params: login mode (no ?mode=switch)
  const expoRouter = jest.requireMock('expo-router')
  expoRouter.useLocalSearchParams.mockReturnValue({})
})

// ── Branch list renders ───────────────────────────────────────────────────────

describe('BranchScreen — renders branch list', () => {
  it('shows all branches from user.branches for a non-admin', async () => {
    seedStore(cashierUser)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Main Branch')).toBeTruthy()
      expect(screen.getByText('North Branch')).toBeTruthy()
    })
  })

  it('shows the screen title "Select Branch" in login mode', async () => {
    seedStore(cashierUser)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Select Branch')).toBeTruthy()
    })
  })
})

// ── Auto-select single branch ─────────────────────────────────────────────────

describe('BranchScreen — auto-select single branch', () => {
  it('auto-selects and navigates when user has exactly one branch in login mode', async () => {
    const setActiveBranch = jest.fn()
    mockUseAuthStore.mockReturnValue({
      user: { ...cashierUser, branches: [branch1] },
      activeBranch: null,
      setActiveBranch,
    } as any)
    renderBranch()
    await waitFor(() => {
      expect(setActiveBranch).toHaveBeenCalledWith(branch1)
    })
  })
})

// ── Admin full branch list ────────────────────────────────────────────────────

describe('BranchScreen — admin fetches all branches', () => {
  it('calls GET /branches when user is admin', async () => {
    seedStore(adminUser)
    const allBranches: Branch[] = [branch1, branch2, { id: 3, name: 'South', slug: 'south' }]
    mockClient.get.mockResolvedValue({ data: allBranches })
    renderBranch()
    await waitFor(() => {
      expect(mockClient.get).toHaveBeenCalledWith('/branches')
    })
  })

  it('falls back to user.branches when GET /branches fails', async () => {
    seedStore(adminUser)
    mockClient.get.mockRejectedValue(new Error('network'))
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Main Branch')).toBeTruthy()
    })
  })
})

// ── Branch selection ──────────────────────────────────────────────────────────

describe('BranchScreen — branch selection', () => {
  it('calls authApi.setBranch when a branch card is tapped', async () => {
    const setActiveBranch = jest.fn()
    mockUseAuthStore.mockReturnValue({
      user: cashierUser,
      activeBranch: null,
      setActiveBranch,
    } as any)
    renderBranch()
    await waitFor(() => screen.getByText('Main Branch'))
    fireEvent.press(screen.getByText('Main Branch'))
    await waitFor(() => {
      expect(mockAuthApi.setBranch).toHaveBeenCalledWith(branch1.id, undefined)
    })
  })

  it('navigates to /(app)/pos after branch selection', async () => {
    const setActiveBranch = jest.fn()
    mockUseAuthStore.mockReturnValue({
      user: cashierUser,
      activeBranch: null,
      setActiveBranch,
    } as any)
    renderBranch()
    await waitFor(() => screen.getByText('Main Branch'))
    fireEvent.press(screen.getByText('Main Branch'))
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/pos')
    })
  })
})

// ── Switch mode ───────────────────────────────────────────────────────────────

describe('BranchScreen — switch mode (?mode=switch)', () => {
  beforeEach(() => {
    const expoRouter = jest.requireMock('expo-router')
    expoRouter.useLocalSearchParams.mockReturnValue({ mode: 'switch' })
  })

  it('shows "Switch Branch" title', async () => {
    seedStore(cashierUser, branch1)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Switch Branch')).toBeTruthy()
    })
  })

  it('shows Back button instead of Sign Out', async () => {
    seedStore(cashierUser, branch1)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeTruthy()
      expect(screen.queryByText('Sign out')).toBeNull()
    })
  })

  it('highlights the currently active branch with "Active" badge', async () => {
    seedStore(cashierUser, branch1)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeTruthy()
    })
  })

  it('does NOT auto-select a single branch in switch mode', async () => {
    const setActiveBranch = jest.fn()
    mockUseAuthStore.mockReturnValue({
      user: { ...cashierUser, branches: [branch1] },
      activeBranch: branch1,
      setActiveBranch,
    } as any)
    renderBranch()
    // Give time for any auto-select effect to run
    await act(async () => { await new Promise((r) => setTimeout(r, 100)) })
    expect(setActiveBranch).not.toHaveBeenCalled()
  })
})

// ── Sign Out button ───────────────────────────────────────────────────────────

describe('BranchScreen — Sign Out button (login mode)', () => {
  it('shows Sign Out button in login mode', async () => {
    seedStore(cashierUser)
    renderBranch()
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeTruthy()
    })
  })

  it('calls performLogout when Sign Out is pressed', async () => {
    mockPerformLogout.mockResolvedValue()
    seedStore(cashierUser)
    renderBranch()
    await waitFor(() => screen.getByText('Sign out'))
    fireEvent.press(screen.getByText('Sign out'))
    await waitFor(() => {
      expect(mockPerformLogout).toHaveBeenCalled()
    })
  })
})
