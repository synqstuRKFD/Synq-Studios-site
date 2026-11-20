# Project instructions

This repo holds two things:
1. **The SYNQ Studios website** (recording studio in Rockford, IL; live at https://synqstudios815.com)
2. **The Claude skills system**: reusable skills in `.claude/skills/`, team subagents in `.claude/agents/`, and docs in `claude-system/`

## Website facts (read README.md for detail)

- `dist/` is the published site. Netlify and GitHub Pages publish it from `main`, so **merging or pushing to `main` is a deploy and needs the owner's approval.**
- Content (English + Spanish), rates, links and SEO live in `build-cinematic.py`. Run `python3 build-cinematic.py` to rebuild `dist/` (this also builds `es.html` via `prerender-es.js`).
- Styles are in `layouts/`, images in `images/`, behaviour in the root `*.js` files. Other tools live in `mac-dashboard/` and `trajes/` (suit designer).
- Bookings go through Square Appointments. Form emails go through Web3Forms.
- The site is bilingual: every content change must be made in both EN and ES.

## Which skill to use

| Request | Skill(s) |
|---|---|
| "Build me a complete website / app / booking system" | `project-team` → `fullstack-builder` → `quality-loop` |
| "Research profitable app/business ideas", "Analyze my competitors" | `business-intel` (+ `recent-research` for anything current) |
| "Improve my pricing", tiers, bundles, margins, A/B tests | `pricing-psychology` |
| "Research trends from the last 30 days", "what's new in…" | `recent-research` |
| "Create a Roblox game prototype", anything Luau or Roblox | `roblox-dev` (+ `project-team` for full prototypes) |
| "Teach me…", "quiz me", "make a training" | `interactive-teaching` |
| Repetitive tasks, scripts, scheduled jobs, connecting services | `automation-engineer` |
| Ads, social posts, scripts, landing copy, SEO | `marketing-content` |
| "Review and fix my project", "test this", before any deploy | `quality-loop` |

Full request-to-skill playbook and prompt templates: `claude-system/WORKFLOWS.md`.

## Operating rules (permanent)

1. Be proactive, but never claim a capability, installation, integration or test result that wasn't verified in this session.
2. Use the skills that fit the task. Combine them when the work spans areas.
3. Choose the stack per project. Prefer what the repo already uses; don't default to one framework.
4. Write maintainable, production-oriented code. Reuse existing working components before writing new ones.
5. Explain important technical decisions briefly, with the reason.
6. Keep solutions simple: no speculative abstractions or unnecessary dependencies.
7. Research before important technical recommendations. Check current versions and docs rather than relying on memory.
8. Verify installs and integrations by running them. Only report what actually ran.
9. Never expose, print, commit or log passwords, keys or tokens. Secrets belong in env vars or the platform's secret store.
10. **Get approval before** spending money, publishing or deploying (including pushing to `main`), sending messages or emails, deleting data, or changing external accounts. Drafts and dry runs are fine without approval.
11. Track work: record completed work, open issues and decisions in `claude-system/STATUS.md`, or `project-notes/<slug>/STATUS.md` for a project.
12. Prioritize functional, tested results over impressive-looking demos.
13. Never invent statistics, reviews or testimonials, and never promise revenue or player counts. Label every figure: [Provided] / [Verified] / [Quoted] / [Estimate] / [Assumption].

## Verification commands

```bash
python3 claude-system/validate_skills.py                         # skills + agents structure
node .claude/skills/quality-loop/scripts/site_check.cjs dist/index.html dist/es.html
```
