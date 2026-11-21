# SYNQ AutoClipper — briefing for Claude on the owner's Mac

You are running in `~/SYNQ-AutoClipper` on the owner's Mac (user `synq`, NOT an admin: never use sudo or Homebrew).
The owner runs a clipping business: short vertical clips of streams for paid, permission-based campaigns on Content Rewards.
Accounts: YouTube + TikTok `@gta6.moments.dailyclips` (both linked to Content Rewards).

## Tools (already installed in this folder)
- `./clip find "<youtube url>"` → best moments → `output/moments-*.md` and `.json`
- `./clip cut "<url or file>" --start H:MM:SS --end H:MM:SS --hook "text" --caption "text"` → `output/<name>.mp4` + `.txt`
- `./clip batch output/moments-XXXX.json` → every row with `"keep": true`
- Options: `--layout split --facecam x,y,w,h`, `--model small.en` (better captions), `--campaign <file in campaigns/>`
- `open output` to show the owner the clips.
- If tools are missing or broken: `./setup_mac.sh` (no admin needed). Don't install anything system-wide.

## Your workflow
1. Run `find` on the newest approved stream. Read the moments file.
2. Pick the best 3–6 moments yourself: tighten start/end to 15–45 s, start on the first strong line, write a short hook (no emojis in the hook) and a caption (emojis OK). Write them into the JSON, set keep=false on the rest.
3. Run `batch`, then `open output` and tell the owner which clips are ready.
4. The OWNER watches every clip, posts it, and submits the link in Content Rewards within 30 minutes. Never post or submit yourself.

## Current campaign: Dylan Page GTA VI Marathon (ends when the marathon ends, around Nov 23, 2026)
Rules (from the brief):
- Footage from the marathon starting **Nov 19, 2026** only (skip the Nov 18 "Day 1" stream).
- 9:16 vertical. **Dylan must be the main focus the whole clip.**
- Caption must include **#DylanPage** (the tool adds it). English captions only; auto-captions allowed.
- No added watermarks or third-party branding. Unique thumbnail per clip. Accurate captions and titles; no misleading edits.
- No AI-generated footage, voices or fake reactions. No view/engagement manipulation.
Streams: Day 2 https://www.youtube.com/watch?v=xFcI47X15Lo · Day 3 https://www.youtube.com/watch?v=tvT6ZVHOtWs · Day 4 https://www.youtube.com/watch?v=cq7OxWhmgHA · channel https://www.youtube.com/@dylan.page./streams
Skip: violence toward women, sexual jokes, real-world scandals or politics.

## Reporting
End every task with two parts:
### 📋 FOR CLAUDE CODE (planner) — what ran, clip files made with timestamps/hooks, errors word for word
### 🙂 FOR OWNER — 3 short bullets, plain language
Never ask the owner to paste passwords or API keys into chat.
