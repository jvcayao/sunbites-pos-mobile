---
title: Testing Standards
inclusion: conditional
priority: high
file_patterns:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/__tests__/**/*"
  - "**/test/**/*"
  - "**/tests/**/*"
  - "jest.config.*"
---

# Testing Standards

## Testing Philosophy

1. **Test behavior, not implementation** - Tests should verify what code does, not how
2. **Mock external dependencies** - Never call real APIs, native modules, or device features in unit tests
3. **Fast feedback** - Unit tests must run quickly (<5 seconds total)
4. **Meaningful coverage** - 80% minimum, but quality over quantity

## Test Types

| Type | Purpose | Tools | Speed |
|------|---------|-------|-------|
| Unit | Individual functions/hooks/utils | Jest, mocks | Fast (<100ms) |
| Component | React Native components render correctly | React Native Testing Library | Fast (<200ms) |
| Integration | Multiple components/screens together | React Native Testing Library, MSW | Medium (<5s) |
| E2E | Full app user flows | Maestro or Detox | Slow (<60s) |

## File Organization

```
src/
├── components/
│   ├── StudentCard.tsx
│   └── __tests__/
│       └── StudentCard.test.tsx
├── screens/
│   ├── LoginScreen.tsx
│   └── __tests__/
│       └── LoginScreen.test.tsx
├── hooks/
│   ├── use-auth.ts
│   └── __tests__/
│       └── use-auth.test.ts
├── services/
│   ├── api.ts
│   └── __tests__/
│       └── api.test.ts
├── utils/
│   ├── validation.ts
│   └── __tests__/
│       └── validation.test.ts
tests/
├── integration/
│   └── auth-flow.int.test.tsx
└── e2e/
    └── login.e2e.ts
```

## Naming Conventions

```typescript
// File names
StudentCard.test.tsx         // Unit/component tests
auth-flow.int.test.tsx       // Integration tests
login.e2e.ts                 // E2E tests

// Test descriptions
describe('LoginScreen', () => {
  describe('when user submits valid credentials', () => {
    it('should call login API with email and password', async () => {});
    it('should navigate to home screen on success', async () => {});
    it('should show error toast on invalid credentials', async () => {});
  });
});
```

## Component Test Structure

Follow the AAA pattern: **Arrange, Act, Assert**

```typescript
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockNavigate, replace: mockNavigate }),
}));

// Mock API service
jest.mock('../../services/api');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable submit button when fields are empty', () => {
    // ARRANGE
    render(<LoginScreen />);

    // ACT
    const submitButton = screen.getByTestId('login-submit');

    // ASSERT
    expect(submitButton).toBeDisabled();
  });

  it('should call login API with entered credentials', async () => {
    // ARRANGE
    const mockLogin = jest.mocked(api.login).mockResolvedValue({ token: 'abc' });
    render(<LoginScreen />);

    // ACT
    fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    // ASSERT
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error message on failed login', async () => {
    // ARRANGE
    jest.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginScreen />);

    // ACT
    fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'wrong');
    fireEvent.press(screen.getByTestId('login-submit'));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

## Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../use-auth';

jest.mock('expo-secure-store');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return logged out state initially', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set user after successful login', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
```

## Mocking Native Modules & Expo

```typescript
// jest.setup.ts — global mocks for native modules

// expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
}));

// react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// react-native-paper
jest.mock('react-native-paper', () => {
  const RNP = jest.requireActual('react-native-paper');
  return { ...RNP };
});
```

## Mocking API Calls

```typescript
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('StudentProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display student data after loading', async () => {
    // ARRANGE
    jest.mocked(api.getStudentProfile).mockResolvedValue({
      id: 'student-123',
      name: 'Juan dela Cruz',
      branch: 'Main Branch',
    });

    // ACT
    render(<StudentProfileScreen />);

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Juan dela Cruz')).toBeTruthy();
      expect(screen.getByText('Main Branch')).toBeTruthy();
    });
  });

  it('should show error state when API fails', async () => {
    // ARRANGE
    jest.mocked(api.getStudentProfile).mockRejectedValue(new Error('Network error'));

    // ACT
    render(<StudentProfileScreen />);

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });
  });
});
```

## Testing Error Scenarios

```typescript
describe('error handling', () => {
  it('should show validation error for invalid email', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('email-input'), 'not-an-email');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('should show network error on timeout', async () => {
    jest.mocked(api.login).mockRejectedValue(new Error('Network request failed'));

    render(<LoginScreen />);
    fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByText(/network/i)).toBeTruthy();
    });
  });
});
```

## Testing Async Code

```typescript
// ALWAYS: Use async/await with rejects
await expect(asyncFunction()).rejects.toThrow(ExpectedError);

// ALWAYS: Use waitFor for async UI updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeTruthy();
});

// NEVER: Forget to await
expect(asyncFunction()).rejects.toThrow(); // Test passes incorrectly!
```

## Test Data Factories

```typescript
// tests/factories/student.factory.ts
export function createTestStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: `student-${Date.now()}`,
    name: 'Juan dela Cruz',
    email: `student-${Date.now()}@example.com`,
    branchId: 'branch-123',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: `enrollment-${Date.now()}`,
    studentId: 'student-123',
    amount: 5000,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Usage in tests
it('should display student name', () => {
  const student = createTestStudent({ name: 'Maria Santos' });
  // ...
});
```

## Coverage Requirements

```typescript
// jest.config.ts
export default {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['./jest.setup.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/app/**/_layout.tsx',  // Exclude layout boilerplate
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|react-native-paper)',
  ],
};
```

## What NOT to Test

- Third-party library internals (expo-image, reanimated, react-native-paper)
- TypeScript types (they're compile-time)
- Simple style-only components with no logic
- expo-router layout files (`_layout.tsx`)
- Platform-specific native module behavior (test at E2E level)
- Animation timing values

## Rules

When writing tests:

1. **Mock all native modules** - Never call real device APIs (camera, haptics, secure store)
2. **Mock API services** - Use jest mocks or MSW for network requests
3. **Use AAA pattern** - Arrange, Act, Assert structure
4. **Test edge cases** - Invalid inputs, errors, empty states, loading states
5. **One assertion focus** - Each test verifies one behavior
6. **Descriptive names** - `should [expected behavior] when [condition]`
7. **Reset mocks** - `jest.clearAllMocks()` in beforeEach
8. **Async handling** - Always await async operations and use waitFor for UI
9. **Factory functions** - Create test data factories for reuse
10. **Use testID** - Access components via `testID` prop, not text when possible
