# SYNQ AutoClipper — briefing for Claude on the owner's Mac

You are running in `~/SYNQ-AutoClipper` on the owner's Mac (user `synq`, NOT an admin: never use sudo or Homebrew).
The owner runs a clipping business: short vertical clips of streams for paid, permission-based campaigns on Content Rewards.
Accounts: YouTube + TikTok `@gta6.moments.dailyclips` (both linked to Content Rewards).

## Tools (already installed in this folder)
- `./clip find "<youtube url>"` → best moments → `output/moments-*.md` and `.json`
- `./clip cut "<url or file>" --start H:MM:SS --end H:MM:SS --hook "text" --caption "text"` → `output/<name>.mp4` + `.txt`
- `./clip batch output/moments-XXXX.json` → every row with `"keep": true`
- Each clip makes `output/<name>.mp4` (animated word-by-word captions, hook title, progress bar, loudness-levelled audio), `<name>.jpg` (unique thumbnail) and `<name>.txt` (YouTube title + description, TikTok caption, hashtags).
- Options: `--layout split --facecam x,y,w,h`, `--model small.en` (better captions), `--campaign <file in campaigns/>`
- `open output` to show the owner the clips.
- If tools are missing or broken: `./setup_mac.sh` (no admin needed). Don't install anything system-wide.

## Your workflow
1. Run `find` on the newest approved stream. Read the moments file.
2. Pick the best 3–6 moments yourself: tighten start/end to 15–45 s, start on the first strong line. For each kept row fill in:
   - `hook`: 4–8 words on screen for the first 3 s, no emojis, creates curiosity ("He escaped a 5-star chase with no car").
   - `title`: YouTube Shorts title, under 70 characters, specific and true to the clip (#shorts is added automatically).
   - `caption`: 1–2 lively sentences that set up the moment without spoiling the payoff; 1–2 emojis OK. Never misleading.
   - `hashtags`: 1–3 extra tags specific to the moment (e.g. `["#GTA6Online", "#police"]`); the campaign's required tags and hashtag pool are added automatically (max 6 total).
   Set keep=false on the rest.
3. Run `batch`. Check each clip yourself: extract 3 frames (`ffmpeg -ss T -i clip.mp4 -frames:v 1 f.png`) and confirm the clip meets the campaign's focus rule, the GTA action is clear and captions are readable. Drop any that fail.
4. Post the clips with the "Posting" steps below. The owner approves each action from their phone; never work around a denied permission.

## Posting (Claude in Chrome, the owner's signed-in Chrome)
Daily target: up to the number the owner asks for (goal 10/day). Ramp a new account: 3–5/day the first week. Space posts at least 30–60 min apart, never all at once.
Before posting, read `output/posted.json` (create it as `[]` if missing) and skip any clip already listed.
For each clip, in order:
1. **YouTube** — open https://studio.youtube.com → Create → Upload videos → choose `output/<name>.mp4`.
   Title and description from `<name>.txt` (YOUTUBE section). Audience: "No, it's not made for kids". Upload thumbnail `<name>.jpg` if the page offers it.
   Visibility: Public → Publish. Copy the Shorts link (`https://youtube.com/shorts/<id>`).
2. **TikTok** (account @gta6.moments.dailyclips) — open https://www.tiktok.com/tiktokstudio/upload → choose the .mp4 → caption from the TIKTOK section → cover from the .jpg if offered → Post. Copy the video link from the profile.
3. **Content Rewards** — within 30 minutes of posting: open the current campaign → Submit clip → paste each platform's link (one submission per link if required) → submit.
4. Append to `output/posted.json`: `{"clip": "<name>", "youtube": "<url>", "tiktok": "<url>", "submitted": true, "time": "<ISO time>"}`.
Rules: stop and tell the owner if a site asks for a login, password, 2-step code or CAPTCHA, shows a warning or strike, or the campaign looks closed/full. Never type passwords. Never change account settings. Never post anything the owner hasn't had a chance to approve. If a step's button looks different from these notes, describe what you see instead of guessing.

## Page focus: GTA ONLY
The accounts are a GTA 6 page. Only clip campaigns where **the GTA game itself is the star** (gameplay, chases, heists, glitches, map secrets, funny NPCs). A streamer may be on screen, but skip campaigns whose rules require a person to be the main focus, and skip non-GTA content even if it pays well. Tell the owner about those instead.

## Choosing and adding a campaign
1. In Content Rewards (Chrome), list open campaigns. Keep only GTA-focused ones that are still open, with budget left and a payout per 1K views.
2. For the one the owner picks, copy `campaigns/_template_gta.json` to `campaigns/<short_name>.json` and fill it from the campaign brief: exact name, required hashtags, rules in `checklist`, any banned topics in `skip_words`, streamer name in `focus_names` only if the brief requires them.
3. Write the brief's rules into a "Current campaign" section of this file (replace the old one) with the approved source videos and allowed footage dates.
4. Run every command with `--campaign <short_name>`.

## Past campaign (ENDED around Nov 23, 2026, do not post): Dylan Page GTA VI Marathon
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
