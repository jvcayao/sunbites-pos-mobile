---
title: Coding Standards
inclusion: always
priority: high
---

# Coding Standards

## TypeScript

- **Strict mode enabled** (`strict: true` in tsconfig.json)
- **No `any`** — use `unknown` and type-narrow, or define proper interfaces
- Explicit return types on all exported functions and hooks
- Use `interface` for component props and object shapes
- Use `type` for unions, intersections, and utility types
- Prefer `const` assertions for literal types
- Use `as const` for static arrays and objects

```typescript
// CORRECT
interface StudentCardProps {
  student: Student;
  onPress: (id: string) => void;
}

export function useStudents(params?: StudentListParams): UseQueryResult<Student[]> {
  // ...
}

type EnrollmentStatus = 'active' | 'inactive' | 'pending';

const SORT_OPTIONS = ['name', 'date', 'status'] as const;

// WRONG
function useStudents(params: any) { ... }  // no any
const data: object = { ... };             // use proper interface
```

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Files (general) | `kebab-case.ts` | `api-client.ts` |
| Component files | `PascalCase.tsx` | `StudentCard.tsx` |
| Components | `PascalCase` | `StudentCard`, `EmptyState` |
| Hooks (file) | `use-{name}.ts` | `use-students.ts` |
| Hooks (function) | `camelCase` with `use` | `useStudents`, `useCreateEnrollment` |
| Types/Interfaces | `PascalCase` | `Student`, `ApiResponse<T>` |
| Type files | `{domain}.types.ts` | `student.types.ts` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Functions/vars | `camelCase` | `formatPrice`, `studentList` |
| Booleans | `is`/`has`/`should`/`can` prefix | `isLoading`, `hasError`, `canEdit` |
| Event handlers | `on` + `Verb` | `onPress`, `onSubmit`, `onRefresh` |
| Handler props | `on` + `Noun` + `Verb` | `onStudentPress`, `onFilterChange` |
| Store files | `{name}-store.ts` | `cart-store.ts` |

## Code Patterns

### Early Returns
```typescript
// CORRECT — guard clauses first
export function StudentDetail({ studentId }: Props) {
  const { data, isLoading, error } = useStudent(studentId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState />;

  return <StudentProfile student={data} />;
}

// WRONG — deeply nested
export function StudentDetail({ studentId }: Props) {
  const { data, isLoading, error } = useStudent(studentId);

  return (
    <View>
      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState />
      ) : data ? (
        <StudentProfile student={data} />
      ) : (
        <EmptyState />
      )}
    </View>
  );
}
```

### Explicit Exports
```typescript
// CORRECT — named exports
export function StudentCard({ student }: StudentCardProps) { ... }
export function useStudents() { ... }

// WRONG — default exports (exception: Expo Router screens)
export default function StudentCard() { ... }
```

**Exception:** Expo Router screen files (`app/**/*.tsx`) use default exports as required by the framework.

### Null Handling
```typescript
// CORRECT — explicit null checks
if (student === null) return <EmptyState />;
if (student.email != null) sendNotification(student.email);

// WRONG — truthy/falsy for non-boolean values
if (!student) return <EmptyState />;  // 0 and '' are also falsy
```

### Async/Await
```typescript
// CORRECT — async/await with try/catch
async function submitForm(data: FormData): Promise<void> {
  try {
    await api.post('/enrollments', data);
  } catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message);
    }
    throw error;
  }
}

// WRONG — .then/.catch chains
api.post('/enrollments', data)
  .then(res => { ... })
  .catch(err => { ... });
```

## Accessibility

- Use `accessibilityRole` on all interactive elements (`button`, `link`, `header`, `image`)
- Use `accessibilityLabel` for icon-only buttons and non-text elements
- Use `accessibilityState` for toggles and selected states (`{ selected: true }`, `{ disabled: true }`)
- Use `accessibilityHint` sparingly — only when the action isn't obvious from the label
- Use `accessibilityLiveRegion="polite"` for dynamic content updates (Android)
- Ensure VoiceOver / TalkBack reads content in logical order

```typescript
<Pressable
  onPress={onEdit}
  accessibilityRole="button"
  accessibilityLabel={`Edit ${student.name}`}
  style={styles.editButton}
>
  <Pencil size={20} color={colors.secondary} />
</Pressable>
```

## Performance

- Use `StyleSheet.create()` — never inline style objects in render (creates new object each render)
- Use `FlatList` for lists — never `ScrollView` with `.map()` for dynamic data
- Use `React.memo()` only when profiling shows re-render problems — not by default
- Use `useCallback` for callbacks passed to `FlatList` `renderItem` and `keyExtractor`
- Use `expo-image` with `cachePolicy="memory-disk"` — never default `Image` for remote images
- Avoid anonymous functions in `onPress` inside lists — extract to named handler

## Formatting

- **ESLint 9** flat config with Expo plugin
- **Prettier 3** for formatting
- 100 character print width
- Single quotes
- Trailing commas (ES5)
- 2-space indentation
- Semicolons
