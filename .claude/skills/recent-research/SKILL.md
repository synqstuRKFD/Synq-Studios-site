---
name: recent-research
description: Current-information research for the last 30 days (or any recent window). Use whenever the user asks about recent trends, news, what's new, latest versions, new AI tools, framework or software updates, platform/policy changes (Roblox, social media, app stores), current business or monetization opportunities, or anything where information may have changed recently — e.g. "research trends from the last 30 days", "what's new in X", "is X still the best option".
---

# Last-30-Days Research

Current information is only useful if it is dated and sourced. This workflow refuses to fill gaps with memory.

## 0. Check capability first

Confirm a web search or fetch tool is available (e.g. `WebSearch`, `WebFetch`, a browser MCP). If none is available, **stop and say so**: "I can't browse in this environment, so I can't give you verified current information. Enable web search / a browser tool, or paste sources and I'll analyze them." You may add a clearly separated "Background from training data (may be outdated, cutoff-dependent)" section, never mixed with current findings.

## 1. Fix the exact window

```bash
python3 .claude/skills/recent-research/scripts/date_window.py          # last 30 days from today
python3 .claude/skills/recent-research/scripts/date_window.py --days 7
python3 .claude/skills/recent-research/scripts/date_window.py --since 2026-10-01
```

State the window at the top: "Window: 2026-10-21 → 2026-11-20 (30 days)".

## 2. Search

- Run several queries in parallel: the topic + month/year names in the window, + "release notes", + "changelog", + "announcement".
- Go to primary sources first (see `references/sources.md` per topic), then reputable trade press, then community discussion (as signal, not proof).
- Open the pages. A search snippet alone is not evidence.

## 3. Date every source

Record the publication or last-updated date **from the page itself**. Undated pages: mark "date unknown" and don't count them as in-window evidence. Items older than the window can appear only under "Context (older)".

## 4. Cross-check

Any claim that drives a recommendation (a price, a policy, a release, a number) needs a second independent source or a primary source. Single-source claims are labeled **Reported**.

## 5. Classify

- **Verified** — primary source, or ≥2 independent sources, dated in-window
- **Reported** — one credible source, not yet confirmed
- **Signal** — community chatter, social posts, anecdotal
- **Inference** — your interpretation; say what it rests on

## 6. Output

```
# <Topic> — what changed (<window>)
Window: <start> → <end> · Searched: <date> · Sources opened: N

## Key changes (most important first)
1. <change> — Verified — <source title>, <date>, <URL>
...

## Evidence table
| Claim | Status | Source (URL) | Published | Second source |

## What it means for you
## Recommended actions (each tied to a finding #)
## Context (older than window)
## Unknowns / couldn't verify
```

Keep it skimmable. Prefer 5 well-verified findings over 20 weak ones.
