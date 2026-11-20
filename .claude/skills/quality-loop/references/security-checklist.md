# Security checklist

Tick only what you checked. Mark N/A where it doesn't apply.

## Secrets
- [ ] No keys/tokens/passwords in the repo or git history: `git grep -nI -E "(api[_-]?key|secret|passw(or)?d|token|PRIVATE KEY)" -- . ':!*.lock'`
- [ ] `.env` is git-ignored; `.env.example` lists names only
- [ ] Client-side code (HTML/JS shipped to browsers, Roblox LocalScripts) contains no secrets — anything shipped to a browser or game client is public
- [ ] Public form endpoints (e.g. Web3Forms access keys) are the kind meant to be public, and spam protection is on

## Input & output
- [ ] All user input validated server-side (type, length, range, format)
- [ ] Output encoded when rendered (no `innerHTML` with user data; use `textContent`)
- [ ] Database queries parameterized; no string-built SQL
- [ ] File uploads: type/size limits, stored outside web root or in object storage, never executed

## Auth & access
- [ ] Proven auth library/provider (not hand-rolled); passwords hashed with bcrypt/scrypt/argon2
- [ ] Authorization checked on every server endpoint (not just hidden in the UI)
- [ ] Row-level security on hosted databases (e.g. Supabase RLS) enabled and tested
- [ ] Sessions: HttpOnly, Secure, SameSite cookies; CSRF protection for cookie auth
- [ ] Rate limiting on login, signup, contact and booking forms

## Payments & game economy
- [ ] Prices and entitlements decided server-side; client is never trusted
- [ ] Payment webhooks verified by signature; handlers idempotent
- [ ] Roblox: `ProcessReceipt` idempotent and only returns `PurchaseGranted` after data is saved; RemoteEvents validate args and rate-limit

## Transport & headers
- [ ] HTTPS everywhere; no mixed content
- [ ] Security headers where the host allows (Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, frame-ancestors)
- [ ] External links with `target="_blank"` use `rel="noopener"`

## Dependencies
- [ ] `npm audit` / `pip-audit` run; criticals addressed or logged
- [ ] Third-party scripts loaded from trusted origins, pinned versions; Subresource Integrity where possible
- [ ] No unreviewed install scripts (`curl | bash`, postinstall hooks)

## Privacy
- [ ] Only necessary personal data collected; privacy notice exists if collecting any
- [ ] Analytics respects consent requirements for the audience's region
