# Argus - Claude Code Project Context

Argus is a SaaS platform built by CooeyTools LLC for cybersecurity, IT, and project management
professionals to track continuing professional development (CPD) credits and manage certification
portfolios. The live application is at argus.cooeytools.com.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Database / Auth | Supabase (PostgreSQL + RLS + Auth) |
| Hosting | Vercel |
| DNS / Proxy | Cloudflare |
| Styling | Tailwind CSS |
| Language | TypeScript (strict mode) |
| Email | Resend via noreply@cooeytools.com |
| Payments | Lemon Squeezy (not yet integrated) |

---

## Environment Model

There are three environments. Never run migrations or schema changes directly against production.

| Environment | Supabase Project | Hosting | Trigger |
|---|---|---|---|
| Local | Docker (supabase start) | localhost:3000 | `npm run dev` |
| Staging | iasyayzigsscmqprwvip | Vercel preview URL | GitHub PR |
| Production | oerhsbqetxldjdstikmu | argus.cooeytools.com | Merge to main |

### Environment Variable Files

- `.env.local` -- local development only, never committed
- Vercel environment variables manage staging and production secrets
- Never hardcode credentials, keys, or project refs in source code

### Environment Variables

The following variables are configured in Vercel for Preview and Production environments.
All must be present in `.env.local` for local development.

```
NEXT_PUBLIC_ENV                      # "development", "preview", or "production"
NEXT_PUBLIC_SUPABASE_URL             # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY        # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY            # Supabase service role key -- server-side only, never expose to client
NEXT_PUBLIC_SITE_URL                 # Canonical site URL, used in auth redirects
SITE_PASSWORD                        # Beta access password gate (if active)
RESEND_API_KEY                       # Resend transactional email key (note: verify spelling in Vercel)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES  # Session timeout threshold
```

> Note: `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It must only ever be used in server-side
> code. It must never appear in any `NEXT_PUBLIC_` variable or be referenced in client components.

---

## Code Conventions

### General

- TypeScript strict mode is required; no `any` unless explicitly justified with a comment
- Prefer server components by default; use `"use client"` only when interactivity requires it
- Use `getUser()` for server-side auth validation -- never `getSession()` (reads stale local cookies)
- Never use em dashes (`--`) in copy, code comments, or documentation; use a regular hyphen or rewrite the sentence
- No hardcoded strings for URLs, project refs, or credentials; use environment variables

### Supabase and RLS

- Every database query must account for Row-Level Security
- Always test queries under the anon/authenticated role, not the service role, unless the operation explicitly requires elevated privileges
- Use the admin client (`adminClient`) only for operations that must bypass RLS (e.g., cleanup after MFA enrollment failure)
- Admin client operations should never trigger user-facing notifications unless intentionally designed to do so
- When creating new tables, write an RLS policy in the same migration

### Auth Patterns

- Use `getUser()` on the server for all auth checks -- not `getSession()`
- Read AAL (Authenticator Assurance Level) from JWT claims synchronously; do not call `getAuthenticatorAssuranceLevel()` inside `onAuthStateChange` callbacks (causes Supabase storage lock deadlock)
- `onAuthStateChange` callbacks must remain synchronous
- Admin MFA cleanup must use `adminClient.auth.admin.mfa.deleteFactor()` to avoid triggering security notification emails

### Error Handling

- All async handlers must have a top-level `try/catch/finally`
- Loading states must always be reset in `finally` blocks to prevent stuck UI states
- User-visible error messages must be clear and actionable, never raw Supabase error strings

## Security Principles

Argus serves cybersecurity professionals who will actively scrutinize the application's security
posture. Privacy and trust are core to the product's value proposition. Every code change should
default to the more secure option.

These principles align to NIST SP 800-171 Rev 3 and general secure development practice.

### Authentication and Session Management

- MFA is required for all authenticated users; do not create bypass paths
- Session tokens must never be logged, stored in plaintext, or exposed in URLs
- All auth redirects must use `NEXT_PUBLIC_SITE_URL` from environment variables, never hardcoded URLs
- Use PKCE flow for all Supabase auth callbacks
- Read AAL from JWT claims -- never call `getAuthenticatorAssuranceLevel()` inside `onAuthStateChange`

### API Route Security

- All API routes must validate the authenticated user via `getUser()` before processing any request
- Apply rate limiting on all sensitive endpoints: auth, MFA verification, backup code redemption
- Validate and sanitize all user inputs server-side; never trust client-provided data
- Return generic error messages to the client; log specific errors server-side only
- No sensitive data in URL parameters or query strings (visible in logs and referrer headers)

### Data Protection

- Never log PII, auth tokens, session data, or credential material
- Supabase RLS must be active on every user-facing table; verify policies exist before shipping
- The service role key must never appear in client-side code or be exposed via any API response
- Prefer minimal data collection; do not store data that is not required for product functionality

### Dependency and Infrastructure

- Review third-party dependencies before adding them; prefer well-maintained packages with small scope
- Security headers must be present (CSP, HSTS, X-Frame-Options, etc.) -- verify in Vercel/Cloudflare config
- Secrets must rotate if there is any possibility of exposure; do not wait to confirm exposure before rotating
- Database schema changes require a migration file; no console-only changes to production

### Audit and Observability

- Auth events (login, MFA enroll, MFA verify, MFA remove, backup code use) must be logged
- Logs must be structured and queryable, not ad-hoc console output
- Failed auth attempts must be logged with enough context for incident response, but without PII

---

### Making Schema Changes

1. Never modify schema directly in the Supabase dashboard on production
2. Create a migration: `supabase migration new <descriptive-name>`
3. Write the SQL in the generated file under `supabase/migrations/`
4. Test locally: `supabase db reset`
5. Validate on staging before merging to main

### Checking Schema Drift

```bash
supabase db diff --schema public
```

---

## Git Workflow

### Branch Naming

```
feature/ARG-XX-short-description
```

### Commit Messages

Keep commits focused. Reference the issue number in the commit message body when relevant.

### Pull Request Magic Words

Include one of these in the PR description to auto-close the Linear issue on merge:

```
Fixes ARG-XX
Closes ARG-XX
Resolves ARG-XX
```

---

## Brand Guidelines

| Token | Value |
|---|---|
| Navy | #1B3A6B |
| Gold | #C8943A |
| Cream | #F5F0E8 |
| Motif | Hound dog (references Argus Panoptes and Odysseus's hound) |

- No em dashes anywhere in UI copy, error messages, emails, or comments
- The product name is Argus; the business entity is CooeyTools LLC
- Do not use the old name CredVault anywhere; purge any remaining references if found

---

## Supported Certification Bodies

ISC2, ISACA, GIAC, EC-Council, CompTIA, PMI, SHRM, HRCI, Cisco

---

## Subscription Tiers

| Tier | Price | Limits |
|---|---|---|
| Free (Awareness) | $0 | Unlimited cert tracking, 20-activity cap, basic dashboard |
| Pro (Protection) | $79/year or $9/month | Unlimited activities, compliance intelligence, full dashboard |

The 20-activity cap on Free should surface as a value prompt near the limit, not a countdown.

---

## Known Gotchas and Architecture Notes

### Supabase Auth

- **Storage lock deadlock:** If `onAuthStateChange` makes async API calls (e.g., `getAuthenticatorAssuranceLevel()`), it can deadlock the Supabase storage layer. Read AAL from JWT synchronously instead.
- **`getSession()` vs `getUser()`:** `getSession()` reads from local cookies without server validation and can return stale or spoofed state. Always use `getUser()` on the server.
- **Admin client for MFA cleanup:** Use `adminClient.auth.admin.mfa.deleteFactor()` for incomplete enrollment cleanup. Using the user client triggers a "MFA disabled" security email even when MFA was never fully enrolled.

### Next.js

- The middleware file convention changed in recent Next.js versions. Use `proxy` instead of `middleware` if the deprecation warning appears.
- PKCE auth callback route exists at `/auth/callback` -- do not remove or rename it.

### Cloudflare

- ChaCha20-Poly1305 cipher reordering requires Cloudflare Business tier. DISA NIPR network compatibility issues are a known limitation, not a fixable bug at the current tier.

### GitHub Secret Scanning

- Base64-encoded SVG image data can trigger false-positive pattern matches for cloud provider tokens. Close as false positive; do not delete the image data.

### Vercel Analytics

- Cookieless by default (hash-based). No consent banner is required for analytics alone, but the privacy policy must disclose anonymized usage data collection.

---

## Active Issues

Do not rely on a static list in this file. At the start of every session, query Linear directly
to get the current state of open issues:

- Use the Linear MCP integration to list issues for the Argus team
- Filter to non-archived, non-canceled, non-done issues
- Sort by priority (Urgent first, then High, then Normal)
- Use that as the working task list for the session

The Linear team identifier is ARG. The active cycle is "Beta".

## Workflow

Follow the global workflow orchestration, task management, and core principles defined in
`~/.claude/CLAUDE.md`. That file governs how sessions are structured, how bugs are fixed,
and how lessons are captured.

For this project, use `tasks/todo.md` for session task tracking and `tasks/lessons.md` for
accumulated lessons. Both files live in the repo root and should be committed.

---

## Division of Labor

**Claude.ai (planning session):** Architecture decisions, Linear issue management, deployment steps,
diagnosing issues, drafting prompts for Claude Code.

**Claude Code (this context):** File reading, code writing, running commands, iterative debugging.

When an issue requires file access or code changes, work directly in Claude Code rather than
relaying file contents back and forth through the planning session.

---

## Session Handoff

### Starting a Session (bring Claude Code up to speed)

Paste this prompt at the start of every Claude Code terminal session:

```
Please do the following before we start:
1. Read CLAUDE.md in the repo root
2. Read ~/.claude/CLAUDE.md for global workflow rules
3. Read tasks/lessons.md and flag any lessons relevant to today's work
4. Read tasks/todo.md and summarize any incomplete items from the last session
5. Query Linear for open Argus issues sorted by priority
6. Confirm the current git branch and status

Then give me a short summary: pending tasks, relevant lessons, and top open issues.
We can then agree on what to tackle today.
```

### Ending a Session (capture work before closing)

Paste this prompt before closing Claude Code:

```
Before we close this session:
1. Update tasks/todo.md with what was completed, what was skipped, and why
2. Add any new lessons or patterns to tasks/lessons.md
3. If any new issues were discovered, list them so I can log them in Linear
4. Give me the git commands to commit and push everything including the updated task files
```

---

## Session Start Checklist

```bash
# Confirm local environment
supabase status
npm run dev

# Check for TypeScript errors before starting
npx tsc --noEmit

# Review current branch
git status
git branch
```

## Session End Checklist

```bash
# Type check before committing
npx tsc --noEmit

# Stage, commit, push
git add -A
git commit -m "ARG-XX: short description of change"
git push origin feature/ARG-XX-short-description
```
