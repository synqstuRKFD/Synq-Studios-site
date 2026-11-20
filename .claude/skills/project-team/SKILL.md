---
name: project-team
description: Runs a coordinated multi-agent project team (research, planning, design, development, testing, review, business) to take a project from idea to tested result. Use for any substantial build or overhaul — "build me a complete website", "create an app/SaaS/booking system", "create a Roblox game prototype", "plan and build X end to end", "review and fix my project" — or whenever work spans research + design + code + testing.
---

# Multi-Agent Project Team

Seven specialist roles hand off written artifacts. Each role has a subagent definition in `.claude/agents/`. If the `Agent` tool is available, delegate to them (`subagent_type: "researcher"`, etc.); run independent roles in parallel (e.g. Research + Business). If subagents aren't available, play each role yourself in sequence, keeping the same artifacts and success criteria.

## Workspace

Write handoffs to `project-notes/<project-slug>/` so they survive between sessions:

| # | File | Owner |
|---|---|---|
| 01 | `01-research.md` | researcher |
| 02 | `02-spec.md` | planner |
| 03 | `03-design.md` | designer |
| 04 | code in the real project paths | developer |
| 05 | `05-test-report.md` | tester |
| 06 | `06-review.md` | reviewer |
| 07 | `07-business.md` | business-analyst |
| — | `STATUS.md` | coordinator (you): done / in progress / open issues / decisions |

## Roles: inputs → outputs → success criteria

| Role | Inputs | Outputs | Done when |
|---|---|---|---|
| **Research** | User brief, existing code | 01: requirements, constraints, existing solutions/libraries (with versions checked), risks, open questions | Every recommendation has a source or a reason; reuse options considered before building |
| **Planning** | 01, brief | 02: scope (in/out), architecture, data model, file structure, milestones with acceptance criteria, priorities (must/should/could) | Each milestone is testable; nothing in scope lacks an acceptance criterion |
| **Design** | 02, brand assets | 03: user flows, page/screen list, layout at phone + desktop, design tokens (color, type, spacing), component list, accessibility notes | Every screen in 02 is covered; contrast ≥ WCAG AA; mobile-first |
| **Development** | 02, 03 | Working code, setup instructions, notes on decisions | Builds/runs locally; meets milestone acceptance criteria; no secrets in code |
| **Testing** | Code, 02 | 05: commands run + actual output, pass/fail per acceptance criterion, bugs with repro steps; functional, edge cases, a11y, security, performance, phone/desktop | Every acceptance criterion has an executed result (or "not tested — why") |
| **Review** | All artifacts | 06: issues ranked (blocker / should-fix / nit), each with the fix requested and the owner | No unaddressed blockers |
| **Business** | Brief, 01 | 07: target users, monetization, pricing (via `pricing-psychology`), acquisition channels, ongoing costs (hosting, APIs, fees) | Costs itemized and labeled; no revenue promises |

## Flow

1. **Kickoff** — restate the goal, constraints, and what "done" means. Create `STATUS.md`.
2. **Research ∥ Business** (parallel).
3. **Plan** → for large builds, show the user the spec summary and get a go-ahead before development. Small builds: proceed and note assumptions.
4. **Design** → **Develop** milestone by milestone.
5. **Test** each milestone (use the `quality-loop` skill and its site checker for web work).
6. **Review** → send blockers back to the owning role. Maximum 2 revision rounds per milestone; anything left goes in `STATUS.md` as an open issue rather than looping forever.
7. **Deliver** — summary for the user: what was built, how to run it, test results (real output), open issues, next steps.

## Rules

- Reuse working components in the repo before writing new ones.
- Choose the stack per project (see `fullstack-builder` / `roblox-dev`); explain the choice in 02.
- Consequential external actions (deploy, publish, purchase, send, delete, modify accounts) need the user's explicit approval.
- Never mark something tested unless it was executed; quote the command and result.
