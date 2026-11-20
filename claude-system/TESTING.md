# Testing procedures & verification record

## Verified on 2026-11-20 (actually executed in the cloud session)

| Component | Command | Result |
|---|---|---|
| Structure (10 skills, 7 agents, settings) | `python3 claude-system/validate_skills.py` | PASS. Also caught a deliberately broken copy (bad skill name, missing agent), exit 1 |
| `pricing_calc.py analyze --example` | see command | PASS. Fees $90×2.9%+$0.30 = $2.91 ✓; break-even $2,500 ÷ $132.20 = 18.9, so 19 ✓ |
| `pricing_calc.py samplesize --baseline 0.04 --mde 0.25` | see command | PASS: 6,745 per variant, matching the standard two-proportion formula. An impossible baseline exits with an error |
| `date_window.py` | `--today 2026-11-20`; `--since 2026-12-20 --until 2027-01-05`; reversed dates | PASS: 2026-10-21 → 2026-11-20; year rollover handled; reversed dates rejected |
| `lesson-template.html` | Playwright play-through (wrong answer, then correct ones) | PASS: 5 questions + 1 review = 6 answered, summary shown, no console errors, no horizontal overflow at 375px |
| `automation_template.py` | dry run, `--apply`, rerun, bad path | PASS: the dry run changed nothing; apply moved 3 files; the rerun was a no-op (idempotent); bad path exits 2 |
| `ai_tells.py` | cliché text vs. clean text (EN + ES) | PASS: 6 flags on cliché text including "not just X, it's Y"; the Spanish "al siguiente nivel" is caught after a fix; clean text passes with `--strict` exit 0 |
| `site_check.cjs` | `dist/index.html dist/es.html` + lesson template | Runs. Found real site issues (below) |

## NOT verified

| Component | Why | How to verify |
|---|---|---|
| Luau modules (`roblox-dev/references/*.luau`) | No Luau toolchain or Roblox Studio here. Downloading the Luau compiler was blocked by this session's permission settings | `selene` + `luau-lsp analyze` on your computer, then a Studio playtest with **Start Server, 2 players**. Test a developer product purchase (free in Studio), leave and rejoin to confirm the data saved, and run two servers to confirm the session lock |
| Skills auto-triggering in a new session | Skills load at session start; this session started before they existed | Start a new session, type `/`, and confirm all 10 appear. Ask "improve my pricing" and confirm `pricing-psychology` loads |
| Subagents via the Agent tool | Same reason: they load at session start | `/agents` lists all 7; run `/project-team` on a small task |
| External tools in INSTALL.md | Deliberately not installed (approval needed) | The verify step listed under each tool |

## Real findings from the site check (not fixed: website changes weren't part of this task)

1. **Phone, both languages:** the logo link (`a.brand`) has no accessible name. Its image has `alt=""`, and the "SYNQ Studios" text is hidden at phone width, so screen readers announce an unnamed link. Fix: add `aria-label="SYNQ Studios home"` to the link (EN) and the Spanish equivalent (ES), in the build script.
2. **Phone:** 2 tap targets are smaller than 24px.
3. `images/studio/mixing-screens.jpg` is 324 KB; converting it to WebP/AVIF would cut that.
4. The page transfers about 2.4 MB in total on phone, much of it images and embeds. Worth a Lighthouse run.

## Re-test procedure (run after changing any skill)

```bash
python3 claude-system/validate_skills.py
python3 .claude/skills/pricing-psychology/scripts/pricing_calc.py analyze --example >/dev/null && echo pricing ok
python3 .claude/skills/recent-research/scripts/date_window.py
echo "elevate your seamless experience" | python3 .claude/skills/marketing-content/scripts/ai_tells.py
node .claude/skills/quality-loop/scripts/site_check.cjs .claude/skills/interactive-teaching/assets/lesson-template.html
```
