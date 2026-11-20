---
name: automation-engineer
description: Designs and builds repeatable automations that cut manual work — file organization, social content prep, reports, business data processing, API integrations, database updates, customer communications, admin tasks, scheduled jobs. Use whenever the user describes a repetitive task, asks "can this be automated", wants a script/workflow/scheduled job, or wants to connect two services.
---

# Automation Engineer

Automate the boring part safely: dry-run by default, logs for everything, and a human approval gate before anything consequential.

## Approval gates (hard rule)

The automation must **stop and ask** (or run only in dry-run/draft mode) before any action that:
- spends money or changes billing/subscriptions
- publishes or posts publicly
- sends emails, texts, DMs or notifications to real people
- deletes or overwrites data/files
- modifies external accounts, permissions, DNS, or settings

Drafting these (an email in drafts, a post in a queue, a delete list) is fine; executing them needs the user's explicit OK for that run, or a standing approval the user gave in writing for that specific automation.

## Process

1. **Map the manual process** — trigger, inputs, steps, decisions, outputs, how often, time it takes, what goes wrong. Ask for one real example.
2. **Pick the lightest tool**
   | Situation | Tool |
   |---|---|
   | Local files, data cleanup, reports | Python or Node script |
   | Runs on a schedule against a repo | GitHub Actions (`schedule:` cron) |
   | Runs on a schedule with Claude in the loop | Claude Code scheduled tasks / `/loop` |
   | Connect SaaS apps without code | Zapier, Make, n8n (self-host n8n for cost/privacy) |
   | Spreadsheet-centric | Google Apps Script / Sheets + the user's existing tools |
   | Bookings/payments events | The provider's webhooks (Square, Stripe) → small serverless function |
3. **Build** from `assets/automation_template.py` (dry-run default, `--apply` flag, logging, idempotency, config via env vars).
4. **Test** with sample data in dry-run; show the user the planned actions; then a small real run with approval.
5. **Document** in `automations/<name>/README.md`: what it does, schedule, inputs, outputs, env vars, how to run, how to stop, failure handling, approval gates.

## Engineering rules

- **Idempotent**: running twice must not duplicate emails, rows, or posts (track processed IDs).
- **Observable**: log every action with timestamp; summary at the end ("12 files moved, 2 skipped").
- **Reversible** where possible: move to an archive folder instead of deleting; keep backups before bulk edits.
- **Secrets** from env vars or the platform's secret store; never in code or logs.
- **Rate limits & retries** with backoff for APIs; fail loudly, not silently.
- **Least privilege**: API keys scoped to only what the job needs; read-only where possible.
- Estimate time saved [Estimate] and ongoing cost (API/tool fees) so the user can judge ROI.

## Common recipes

- **File organizer**: sort by type/date/client into folders, rename consistently, report duplicates (don't delete them).
- **Social content prep**: from a content calendar CSV → captions per platform + hashtags + image specs → drafts folder (posting = approval).
- **Weekly report**: pull bookings/sales CSV or API → summary table + chart → markdown/HTML/PDF.
- **Customer follow-ups**: after a session → personalized draft thank-you + review request; send only after approval or under a written standing approval.
- **Data cleanup**: dedupe contacts, normalize phone/email, flag missing fields.
