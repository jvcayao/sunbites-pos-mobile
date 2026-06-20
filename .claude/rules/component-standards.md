---
title: Component & Hook Standards
inclusion: conditional
priority: high
file_patterns:
  - "**/components/**/*"
  - "**/hooks/**/*"
  - "**/screens/**/*"
  - "**/app/**/*.tsx"
---

# Component & Hook Standards

## Component Template

```typescript
import { StyleSheet, View } from 'react-native';

interface Props {
  // typed props — never use `any`
}

export function ComponentName({ ...props }: Props) {
  return (
    <View style={styles.container}>
      {/* content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### Rules
- One component per file (except small, tightly-coupled sub-components)
- PascalCase for component files and names: `StudentCard.tsx`
- Keep components under 150 lines — extract sub-components if larger
- Props interface defined above the component, not inline
- `StyleSheet.create()` at the bottom of the file, not inline
- Use `Pressable` for all tappable elements — never `TouchableOpacity`
- Destructure props in the function signature

## Hook Conventions

- File: `hooks/use-{name}.ts` (kebab-case)
- Function: `useNoun()` or `useVerbNoun()` — e.g., `useAuth()`, `useFetchStudent()`
- Return object for 3+ values: `{ data, isLoading, error }`
- Query hooks wrap API service functions
- Keep hooks pure — no side effects outside useEffect
- Extract shared logic into custom hooks, not utility functions with state

```typescript
// hooks/use-student.ts
export function useStudent(studentId: string) {
  const [data, setData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ...fetch logic

  return { data, isLoading, error };
}
```

## Screen Structure

Every screen should handle three states:

1. **Loading** — skeleton placeholder or `ActivityIndicator`
2. **Error** — clear message with retry action
3. **Empty** — helpful message, optional CTA (e.g., "Add your first student")

```typescript
export function StudentListScreen() {
  const { data, isLoading, error } = useStudents();

  if (isLoading) return <StudentListSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No students enrolled" />;

  return <StudentList students={data} />;
}
```

## Forms

- Controlled components with `useState`
- Zod validation schemas in a shared location or co-located with form
- Show field-level errors from `safeParse` results
- Disable submit button while loading (+ show `ActivityIndicator`)
- Use correct `keyboardType` on every `TextInput`
- Use `returnKeyType` to chain fields or submit

```typescript
const result = schema.safeParse(formData);
if (!result.success) {
  // Map errors to field names
  return;
}
await submitMutation(result.data);
```

## Imports

Group order (blank line between groups):

1. React / React Native (`react`, `react-native`)
2. Expo packages (`expo-router`, `expo-image`, `expo-haptics`)
3. External packages (`zod`, `react-native-paper`, `react-native-reanimated`)
4. Internal with relative paths (`../components/...`, `../hooks/...`)
5. Types (with `type` keyword)

```typescript
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { z } from 'zod';
import { Card } from 'react-native-paper';

import { StudentCard } from '../components/StudentCard';
import { useStudents } from '../hooks/use-students';

import type { Student } from '../types/student.types';
```
