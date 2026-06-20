---
title: Mobile Security Standards
inclusion: always
priority: high
---

# Mobile Security Standards

## Token & Credential Storage

```
expo-secure-store  →  Auth tokens, API keys, session data
AsyncStorage       →  Non-sensitive preferences only (theme, onboarding flag)
MMKV               →  Non-sensitive cached data only
```

- **NEVER** store tokens, passwords, or API keys in AsyncStorage, MMKV, or React state
- **NEVER** log tokens to console or crash reporters
- Use `expo-secure-store` — backed by Keychain (iOS) and EncryptedSharedPreferences (Android)

```typescript
// CORRECT
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('auth_access_token', token);

// WRONG
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('token', token);  // plaintext on disk!
```

## No Secrets in Bundles

The JS bundle is extractable from the app binary (even with Hermes bytecode).

- **NEVER** hardcode API secrets, client secrets, or private keys in source code
- `EXPO_PUBLIC_*` env vars end up in the bundle — only use for non-secret values
- Safe for `EXPO_PUBLIC_`: API base URL, app identifiers (these are public identifiers)
- **NOT safe**: Database passwords, signing keys, third-party API secrets

```typescript
// CORRECT — public identifiers only
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// WRONG — secret in bundle
const API_SECRET = 'sk_live_abc123';  // extractable!
```

## Expo Config Security

`app.json` / `app.config.ts` values are embedded in the binary:
- Do NOT put secrets in `extra`, `plugins`, or custom config fields
- Use EAS Secrets for build-time secrets that shouldn't be in the repo

## Input Validation

- All user inputs validated with Zod before API submission
- Client validation is for UX — **server validation (Laravel) is the source of truth**
- Sanitize text inputs: trim whitespace, limit length
- Never trust deep link parameters — validate and sanitize all incoming URL params

```typescript
import { z } from 'zod';

const enrollmentFormSchema = z.object({
  studentName: z.string().trim().min(1).max(255),
  guardianEmail: z.string().email(),
  guardianPhone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  amount: z.number().positive(),
});

// Validate deep link params
const deepLinkSchema = z.object({
  studentId: z.string().uuid(),
});
```

## Network Security

- **HTTPS only** — no HTTP fallback, no mixed content
- All API calls go through the centralized `api-client.ts` with auth headers (Bearer token from secure store)
- Handle SSL errors gracefully — don't disable SSL validation
- The Laravel API is the single source of truth — never trust client-only authorization checks

## PII Protection

Personal data that must NEVER appear in logs or crash reports:
- Student names, guardian names
- Email addresses
- Phone numbers
- Passwords / tokens
- Physical addresses
- Payment amounts or transaction IDs

```typescript
// CORRECT — redact PII in logs
console.log('Student enrolled', { studentId: student.id });

// WRONG — leaking PII
console.log('Enrolled student', { name: student.name, email: guardian.email });
```

In production, remove all `console.log` statements or use a logger that strips them.

## Authentication Security

- Auth tokens issued by the Laravel API — store access token in `expo-secure-store`
- Short-lived access tokens with refresh token rotation
- Complete logout: delete all tokens from SecureStore + clear React Query cache + reset navigation
- Generic error messages on login failure ("Incorrect email or password") — never reveal if email exists
- Rate limit login attempts on client side (disable button after 5 failures)

## Sensitive Screens

For screens showing payment data, student PII, or financial summaries:
- Consider preventing screenshots: `expo-screen-capture` to detect/prevent
- Hide content in app switcher on iOS (use `AppState` to overlay a blur)
- Auto-lock after inactivity (return to login after N minutes in background)

## Role & Branch Authorization

- Cashier vs. admin role checks on the client are UI-only — the Laravel API enforces the real rules
- Never trust client-side `role` or `branch` values for access decisions
- Active branch context must be re-validated by the API on sensitive operations

## Deep Link Security

```typescript
// Always validate deep link parameters
import { useLocalSearchParams } from 'expo-router';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Validate before using
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return <ErrorState message="Invalid student link" />;
  }

  return <StudentDetail studentId={parsed.data} />;
}
```

## Dependency Security

- Run `npm audit` regularly and fix critical/high vulnerabilities
- Keep Expo SDK updated — security patches ship with SDK updates
- Audit third-party native modules before adding — prefer well-maintained Expo packages
- Pin dependency versions in `package.json` for reproducible builds

## Error Messages

- Never expose stack traces, file paths, or internal system details to users
- Show user-friendly error messages
- Log detailed errors for debugging only in development (`__DEV__`)
- Crash reporters (Sentry) should strip PII before sending

## Security Checklist

- [ ] Tokens stored in `expo-secure-store` only
- [ ] No secrets in source code or `app.json`
- [ ] No PII in console logs or crash reports
- [ ] All inputs validated with Zod before API submission
- [ ] Deep link parameters validated and sanitized
- [ ] HTTPS only — no HTTP fallback
- [ ] Logout clears all tokens, React Query cache, and navigation state
- [ ] Generic error messages on auth failure
- [ ] `npm audit` clean of critical/high vulnerabilities
- [ ] `EXPO_PUBLIC_*` vars contain only non-secret values
- [ ] Production builds have no `console.log` statements
- [ ] Branch/role authorization enforced server-side, not client-side only
