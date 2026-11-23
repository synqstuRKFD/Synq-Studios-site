# SYNQ AutoClipper (free)

Turns a stream into finished vertical clips on your Mac:
**find the best moments → cut → make it 9:16 → add captions + hook text → write the caption with required hashtags.**

All free: yt-dlp (download), Whisper (captions), ffmpeg (editing). You still review every clip, post it, and submit the link.

> Only clip content you have permission to use, like a campaign you joined. Follow each campaign's rules.

---

## 1. One-time setup (about 10 minutes)

1. Get this folder on your Mac: on github.com open the repo, switch to branch `claude/magical-dirac-422l4b`, click **Code → Download ZIP**, unzip, and open `marketing-agency/clipping/autoclipper`.
2. Open **Terminal** (Cmd+Space, type "Terminal").
3. Type `cd ` (with a space), drag the `autoclipper` folder into the Terminal window, press Enter.
4. Run:
   ```
   ./setup_mac.sh
   ```
   It downloads ffmpeg, yt-dlp, deno, Python and Whisper **into this folder only**. No admin password needed.

## 2. Find the best moments in a stream

```
./clip find "https://www.youtube.com/watch?v=tvT6ZVHOtWs"
```

You get a list of the top 8 moments (timestamps + what's said), saved in `output/moments-….md` and `.json`.
It looks for big reactions ("oh my god", "no way", laughter, screaming) and for Dylan's name, and skips banned topics.

Then either:
- **Easiest:** paste the `.md` file to Claude and say *"pick the best 5, tighten the timestamps, and write hooks and captions — give me back the JSON."* Save the JSON over the old one.
- Or open the `.json` yourself: set `"keep": false` on ones you don't want, fill in `"hook"` and `"caption"`.

If it says "no captions yet": very long streams take a while to get captions. Try later.

## 3. Make all the clips at once

```
./clip batch output/moments-XXXX.json
```

Finished clips land in `output/` as `.mp4`, each with a `.txt` file holding the caption (with `#DylanPage` added automatically) and the rules checklist.

## 4. Or make one clip

From a YouTube link:
```
./clip cut "https://www.youtube.com/watch?v=tvT6ZVHOtWs" --start 4:21:03 --end 4:21:38 --hook "\"I'm still the best driver\"" --caption "Dylan vs GTA 6 driving 😭 #GTA6"
```

From your own screen recording (times are inside that file):
```
./clip cut ~/Desktop/recording.mov --start 0:00 --end 0:35 --hook "Dylan learning GTA 6 in real time"
```

## Layouts

- **fit** (default): the whole stream frame in the middle, blurred background, captions below. Safest: Dylan's facecam is always in the shot.
- **split**: facecam on top, gameplay on the bottom. Needs the facecam's position in the stream:
  1. Take a screenshot of the stream at full size (1920×1080).
  2. Open it in Preview → Tools → Show Inspector, then drag a box around the facecam; note x, y, width, height.
  3. Add `--layout split --facecam x,y,w,h`, or put them in `campaigns/dylan_page.json`.

## Tips

- Keep emojis in the **caption**, not the hook text (the hook font may not draw them).
- Captions model: add `--model small.en` for more accurate captions (slower), `--model tiny.en` for faster.
- You can still open any clip in **CapCut** to polish it (zooms, sound effects) before posting.
- New campaign? Copy `campaigns/dylan_page.json`, change the hashtags, names and rules, and use `--campaign newname`.

## After the clip is made (you)

1. Watch it. Check the `.txt` checklist (Dylan in focus, no watermark, English captions…).
2. Post: YouTube Shorts (computer or phone) / TikTok (phone app).
3. **Within 30 minutes:** paste the post link in Content Rewards → campaign → **Submit clip**.
