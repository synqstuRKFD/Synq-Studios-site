---
name: quality-loop
description: Iterative quality control — build, test, find bugs, fix, optimize performance, review security, improve design/usability, verify, and log unresolved issues. Use at the end of every build, whenever the user says "review and fix my project", "test this", "QA", "is this ready", "polish", "check my site", or before anything is deployed or published.
---

# Continuous Quality Improvement

The rule that matters most: **nothing is "tested" unless it was executed in this session.** Report the command and the actual output. If something couldn't be run, say "not run" and why.

## The loop (repeat until no blockers, max 3 rounds, then log the rest)

1. **Working baseline** — make sure it builds/runs. Record the exact run command.
2. **Run relevant tests**
   - Existing test suites (`npm test`, `pytest`, etc. — check `package.json`, CI workflows)
   - Web pages: `node .claude/skills/quality-loop/scripts/site_check.cjs <file-or-url> [--screenshots DIR]` — checks phone + desktop for JS/console errors, failed requests, horizontal overflow, title/description/lang/viewport, alt text, unlabeled controls and inputs, broken local links, heavy assets. Add `--block-external` for offline checks of local files.
   - Deeper audits if installed: `npx lighthouse <url>`, `npx @axe-core/cli <url>`
   - Scripts/CLIs: run them with normal input, bad input, and empty input
   - Roblox: see `roblox-dev` checks (Luau syntax/lint with selene/luau-lsp if available; Studio playtest is manual — list the steps for the user)
3. **Identify bugs and limitations** — list them with severity: blocker / major / minor.
4. **Performance** — image sizes and formats (WebP/AVIF, `width`/`height`, `loading="lazy"` below the fold), unused JS/CSS, blocking scripts, N+1 queries, per-frame loops.
5. **Security** — `references/security-checklist.md`.
6. **Design & usability** — phone layout first, tap targets, contrast, clear primary action, empty/error/loading states, copy clarity, both languages if bilingual.
7. **Verify** — re-run the same checks; compare before/after numbers.
8. **Record** — append to `QUALITY-LOG.md` in the project root (or `project-notes/<slug>/`) using the template below.

## Log template

```markdown
## <YYYY-MM-DD> — <what was checked>
Commands run:
- `<command>` → <result summary>
Fixed:
- <issue> (file:line) — verified by <command>
Unresolved:
- [severity] <issue> — why not fixed / next step
Not tested:
- <area> — reason
```

## Reporting to the user

Lead with: overall state (ready / not ready), blockers, what was fixed, what's unresolved. Keep raw output short — quote the relevant lines.
