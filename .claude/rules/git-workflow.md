---
title: Git Workflow
inclusion: always
priority: medium
---

# Git Workflow

## Branch Strategy

```
main (production)
  └── staging
        └── feature/TICKET-123-add-user-auth
        └── bugfix/TICKET-456-fix-login-error
        └── hotfix/TICKET-789-critical-security-fix
```

### Branch Types

| Type | Pattern | Base | Merges To |
|------|---------|------|-----------|
| Feature | `feature/TICKET-description` | staging | staging |
| Bugfix | `bugfix/TICKET-description` | staging | staging |
| Hotfix | `hotfix/TICKET-description` | main | main → staging |
| Release | `release/v1.2.0` | staging | main → staging |
```

## Commits

- Concise, imperative messages: "Add enrollment screen", "Fix token refresh on background"
- Focus on the "what" and "why", not the "how"
- One logical change per commit
- **Do NOT add `Co-Authored-By`, `Signed-off-by`, or any attribution trailers to commit messages**
- **Do NOT add AI-generated footers, badges, or branding to PRs** (e.g., "Generated with Claude Code")
- **NEVER commit or push directly to `main`** — always create a feature/bugfix branch first, commit there, push the branch, and create a PR

### Format

```
type(scope): short description

[optional body]

```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature or fix |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Build, CI, dependencies |

### Rules

1. Use imperative mood: "add feature" not "added feature"
2. Keep subject line under 72 characters
3. Reference ticket numbers when applicable
4. Separate subject from body with blank line

## Before Committing

```bash
npx tsc --noEmit          # type check
npx expo lint             # lint
npx jest --passWithNoTests # tests
```

### PR Title Format

```
[TICKET-123] Short description of change
```

### Review Checklist

- [ ] Code follows coding standards
- [ ] Tests are included and pass
- [ ] No PII in logs
- [ ] No security vulnerabilities introduced

## PR Process

- Keep PRs small and focused — one feature or fix per PR
- Title: short, descriptive (<70 chars)
- Description: summary of changes, screenshots/recordings for UI changes, test plan
- Tag platform if relevant: `[iOS]`, `[Android]`, `[Both]`
- Request review before merging

## EAS Build Branches

| Branch | Environment | Build Profile |
|--------|-------------|---------------|
| `main` | Production | `production` |
| `develop` | Staging | `preview` |
| `feature/*` | Development | `development` |

## Sensitive Files — Never Commit

- `.env` / `.env.local` / `.env.production`
- `google-services.json` (Android Firebase)
- `GoogleService-Info.plist` (iOS Firebase)
- `*.p12`, `*.mobileprovision`, `*.keystore` (signing credentials)
- `eas.json` secrets (use EAS Secrets instead)
