import { render, screen, fireEvent } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import { BranchPill } from '../BranchPill'

const mockPush = jest.fn()
;(useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: jest.fn(), back: jest.fn() })

const mockBranch = { id: 1, name: 'Main Branch', slug: 'main-branch' }
const longBranch = { id: 2, name: 'Northside Elementary School', slug: 'northside' }

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ activeBranch: null, token: null, user: null })
})

describe('BranchPill — null state', () => {
  it('renders nothing when activeBranch is null', () => {
    const { toJSON } = render(<BranchPill />)
    expect(toJSON()).toBeNull()
  })
})

describe('BranchPill — display', () => {
  beforeEach(() => {
    useAuthStore.setState({ activeBranch: mockBranch })
  })

  it('renders the branch name', () => {
    render(<BranchPill />)
    expect(screen.getByText('Main Branch')).toBeTruthy()
  })

  it('truncates branch names longer than 18 characters', () => {
    useAuthStore.setState({ activeBranch: longBranch })
    render(<BranchPill />)
    expect(screen.getByText('Northside Elementa…')).toBeTruthy()
  })

  it('has correct accessibilityRole and accessibilityLabel', () => {
    render(<BranchPill />)
    const pill = screen.getByRole('button')
    expect(pill.props.accessibilityLabel).toBe('Switch branch, currently Main Branch')
  })
})

describe('BranchPill — interaction', () => {
  beforeEach(() => {
    useAuthStore.setState({ activeBranch: mockBranch })
  })

  it('navigates to branch switcher on press', () => {
    render(<BranchPill />)
    fireEvent.press(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/(auth)/branch?mode=switch')
  })
})
