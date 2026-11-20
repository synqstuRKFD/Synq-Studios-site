---
name: fullstack-builder
description: Builds websites and web applications end to end — landing sites, booking platforms, dashboards, SaaS apps, customer portals, mobile-friendly web apps, e-commerce and subscription platforms — with secure auth, databases, APIs, responsive UI and automated tests. Use whenever the user asks to build, add a feature to, or choose a stack for any website or web app ("build me a complete website", "add login", "make a booking system", "set up payments").
---

# Full-Stack App Builder

Pick the simplest stack that meets the requirements, integrate proven services before building your own, and ship something that runs and is tested.

## 1. Decide the stack (explain the choice to the user)

| Need | Default choice | Why |
|---|---|---|
| Marketing/info site, few pages | Static HTML/CSS/JS, or a static generator (Astro, Eleventy); this repo uses a Python build script → keep using it | Fast, cheap, nothing to hack |
| Booking / appointments | Integrate an existing scheduler (Square Appointments, Cal.com, Calendly) first; build custom only if it can't fit | Payments, reminders, calendars already solved |
| Dashboard / SaaS / portal | A full-stack framework (Next.js, SvelteKit, Remix, Django, Rails, Laravel) + Postgres (Supabase/Neon/managed) | Auth, routing, server code in one place |
| Payments / subscriptions | Stripe Checkout + Customer Portal, or Square, or Lemon Squeezy/Paddle when merchant-of-record helps with tax | Never handle raw card data |
| E-commerce, small catalog | Shopify / Square Online / Stripe Payment Links before custom | Inventory, tax, shipping solved |
| Mobile-friendly app | Responsive PWA first; native only if device APIs demand it | One codebase |
| Auth | The framework's proven auth library or a provider (Supabase Auth, Clerk, Auth.js, Django auth) | Don't hand-roll |

Before pinning versions, check current releases (use `recent-research` or the docs) — don't rely on memory for version numbers or APIs.

## 2. Plan

For more than a page or two, write a short spec (or use `project-team`): pages/screens, data model, user roles, integrations, env vars, acceptance criteria.

## 3. Build — non-negotiables

- **Mobile-first**, responsive at 375px and 1280px, no horizontal scroll, tap targets ≥44px.
- **Accessibility**: semantic HTML, labels on every field, alt text, visible focus, contrast AA, `prefers-reduced-motion`.
- **Security**: server-side validation, parameterized queries, authorization on every endpoint, RLS on hosted DBs, CSRF for cookie sessions, rate limits on forms, secrets only in env vars (`.env` git-ignored, `.env.example` committed), verified webhook signatures, idempotent payment handlers. See `../quality-loop/references/security-checklist.md`.
- **Data**: migrations in version control; backups enabled on the hosted DB.
- **SEO** (public sites): unique title + meta description, `lang`, Open Graph image, sitemap, robots.txt, structured data (e.g. `LocalBusiness`) where relevant, fast images (WebP/AVIF, sized, lazy-loaded).
- **i18n**: if the site is bilingual (this repo is EN/ES), keep both languages in sync for every change.
- **Errors**: empty, loading and error states for every data view; friendly 404.

## 4. Test (actually run them)

- Unit tests for business logic (pricing, availability, permissions).
- End-to-end with Playwright for the main flows (sign up, book, pay in test mode, cancel).
- `node .claude/skills/quality-loop/scripts/site_check.cjs <page>` for layout/a11y/SEO basics.
- Use payment providers' **test/sandbox modes** only.

## 5. Deliver

Run instructions, env vars needed, what was tested (with output), known gaps, and the hosting plan with ongoing costs. **Deploying, buying domains, connecting live payment accounts or sending real emails needs the user's explicit approval.**

## This repo specifically

`dist/` is the live site (Netlify + GitHub Pages publish it from `main`). Edit `build-cinematic.py` (content, EN+ES) and `layouts/`/`*.js`, then run `python3 build-cinematic.py` to rebuild `dist/`. Don't hand-edit `dist/` unless the README says that file is static. Merging to `main` publishes — that's a deploy and needs approval.
