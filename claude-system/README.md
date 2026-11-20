# Claude Skills System

A reusable set of Claude Code skills and subagents for researching, designing, building, testing, automating, and monetizing projects.

## How it works

- **Skills** (`.claude/skills/<name>/SKILL.md`) are instruction packs. Claude loads a skill automatically when your request matches its description, or you can call it directly with `/<name>`. Some skills include working scripts, templates, and reference code.
- **Subagents** (`.claude/agents/*.md`) are the seven project-team roles. The `project-team` skill delegates to them. In environments without subagents, the same roles run one after another in a single session.
- **`CLAUDE.md`** (repo root) holds the permanent operating rules and the guide to which skill to use.
- **`.claude/settings.json`** blocks Claude from reading `.env` files, where secrets live.

```
CLAUDE.md                          central instructions + operating rules
.claude/
  settings.json                    deny reading .env secrets
  skills/
    business-intel/                SKILL 1  + references/report-template.md
    interactive-teaching/          SKILL 2  + assets/lesson-template.html (adaptive quiz engine)
    pricing-psychology/            SKILL 3  + scripts/pricing_calc.py (margins, LTV, break-even, A/B sample size)
    project-team/                  SKILL 4  (orchestrates the 7 agents below)
    recent-research/               SKILL 5  + scripts/date_window.py, references/sources.md
    fullstack-builder/             SKILL 6
    roblox-dev/                    SKILL 7  + references/PlayerData.luau, PurchaseHandler.server.luau, RemoteGuard.luau
    automation-engineer/           SKILL 8  + assets/automation_template.py (dry-run-first)
    marketing-content/             SKILL 9  + scripts/ai_tells.py (flags generic AI phrasing, EN/ES)
    quality-loop/                  SKILL 10 + scripts/site_check.cjs (Playwright), references/security-checklist.md
  agents/
    researcher.md planner.md designer.md developer.md tester.md reviewer.md business-analyst.md
claude-system/
  README.md        this file: overview + inventory
  WORKFLOWS.md     what to ask for, which skills run, prompt templates
  INSTALL.md       recommended external tools, safe install order, troubleshooting, using skills globally
  TESTING.md       how each component was verified + how to re-test
  STATUS.md        completed work, open issues, next steps
  validate_skills.py   structure validator
```

## Skills inventory

| # | Skill | Invoke | Bundled, working components | Needs |
|---|---|---|---|---|
| 1 | business-intel | `/business-intel` | Report template with evidence labels and feasibility scorecard | Web search for real data |
| 2 | interactive-teaching | `/interactive-teaching` | HTML lesson engine: adaptive difficulty, review queue, progress saved in the browser | A browser to open lessons |
| 3 | pricing-psychology | `/pricing-psychology` | `pricing_calc.py`: unit economics, LTV, CAC payback, break-even, A/B test sample size | Python 3 |
| 4 | project-team | `/project-team` | Seven subagents with inputs, outputs and success criteria; handoff files in `project-notes/<slug>/` | Agent tool (optional) |
| 5 | recent-research | `/recent-research` | `date_window.py`, primary-source map, evidence table format | **Web search (required)** |
| 6 | fullstack-builder | `/fullstack-builder` | Stack decision table, security/SEO/a11y rules, notes for this repo | Node/Python for the chosen stack |
| 7 | roblox-dev | `/roblox-dev` | Session-locked DataStore module, idempotent ProcessReceipt, remote validation/rate limiting | Roblox Studio (testing is on you) |
| 8 | automation-engineer | `/automation-engineer` | Dry-run-first automation template with idempotency and approval holds | Python 3 |
| 9 | marketing-content | `/marketing-content` | `ai_tells.py` cliché/AI-tell checker (EN + ES) | — |
| 10 | quality-loop | `/quality-loop` | `site_check.cjs` checks phone and desktop pages; security checklist; quality log template | Playwright (preinstalled in cloud sessions) |

## Quick verification

```bash
python3 claude-system/validate_skills.py
node .claude/skills/quality-loop/scripts/site_check.cjs dist/index.html
python3 .claude/skills/pricing-psychology/scripts/pricing_calc.py analyze --example
```

## Using these skills in other projects

Each project only sees the skills in its own `.claude/`. Two ways to reuse them:
- **Per project:** copy `.claude/skills`, `.claude/agents` and the "Operating rules" section of `CLAUDE.md` into the other repo.
- **Globally on your own computer:** copy the skill folders into `~/.claude/skills/` and the agents into `~/.claude/agents/`. Cloud sessions start from a fresh container, so a repo copy is the version that persists there.
