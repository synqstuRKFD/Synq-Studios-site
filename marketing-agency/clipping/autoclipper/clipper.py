#!/usr/bin/env python3
"""SYNQ AutoClipper: free clip finder + editor for permission-based clipping campaigns.

Commands
  find  URL                       Find the best moments in a YouTube video from its transcript.
  cut   SOURCE --start --end      Make one finished vertical clip (captions + hook) from a URL or local file.
  batch MOMENTS.json              Make every clip listed in a moments file (edit it first: keep the ones you want).

Everything runs on your Mac with free tools: yt-dlp, ffmpeg, faster-whisper.
Only clip content you have permission to use (e.g. a campaign you joined).
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE / "output"

# ---------------------------------------------------------------- helpers

def die(msg):
    print(f"\n✖ {msg}", file=sys.stderr)
    sys.exit(1)


def need(tool):
    if not shutil.which(tool):
        die(f"'{tool}' is not installed. Run ./setup_mac.sh first.")


def run(cmd, quiet=True):
    res = subprocess.run(cmd, capture_output=quiet, text=True)
    if res.returncode != 0:
        if quiet:
            sys.stderr.write(res.stderr[-3000:])
        die(f"Command failed: {' '.join(str(c) for c in cmd[:3])} …")
    return res


def to_seconds(t):
    """'4:21:03', '21:03', '63', '63.5' -> seconds (float)."""
    t = str(t).strip()
    parts = [float(p) for p in t.split(":")]
    sec = 0.0
    for p in parts:
        sec = sec * 60 + p
    return sec


def fmt_ts(sec):
    sec = int(round(sec))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def slug(text, n=40):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return (s[:n] or "clip").strip("-")


def load_campaign(name):
    if not name:
        return {}
    p = HERE / "campaigns" / f"{name}.json"
    if not p.exists():
        die(f"No campaign file {p}")
    return json.loads(p.read_text())

# ---------------------------------------------------------------- find

DEFAULT_REACTIONS = {
    "oh my god": 3, "no way": 3, "what the": 2, "what is he doing": 4, "what are you doing": 3,
    "let's go": 2, "lets go": 2, "holy": 2, "insane": 2, "crazy": 2, "bro": 1, "dude": 1,
    "wait": 1, "stop": 1, "help": 1, "run": 1, "police": 1, "arrested": 2, "jail": 2,
    "dead": 1, "died": 2, "i can't": 2, "i cant": 2, "are you serious": 3, "what happened": 2,
    "[laughter]": 3, "[screaming]": 3, "[applause]": 2, "[music]": 0,
}


def fetch_transcript(url, workdir):
    """Download YouTube's English (auto) captions as json3 and return [(start_sec, text)]."""
    need("yt-dlp")
    tmpl = str(Path(workdir) / "subs")
    run(["yt-dlp", "--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs", "en.*,en",
         "--sub-format", "json3", "-o", tmpl, url])
    files = sorted(Path(workdir).glob("subs*.json3"))
    if not files:
        die("This video has no captions yet (common right after a long stream ends). Try again later.")
    data = json.loads(files[0].read_text())
    lines = []
    for ev in data.get("events", []):
        segs = ev.get("segs")
        if not segs:
            continue
        text = "".join(s.get("utf8", "") for s in segs).replace("\n", " ").strip()
        if text:
            lines.append((ev.get("tStartMs", 0) / 1000.0, text))
    return lines


def find_moments(lines, campaign, top=8, window=40, step=10):
    reactions = dict(DEFAULT_REACTIONS)
    reactions.update({k.lower(): v for k, v in campaign.get("extra_keywords", {}).items()})
    focus = [n.lower() for n in campaign.get("focus_names", [])]
    banned = [w.lower() for w in campaign.get("skip_words", [])]
    if not lines:
        return []
    end_time = lines[-1][0]
    candidates = []
    t = 0.0
    while t < end_time:
        chunk = [(s, x) for s, x in lines if t <= s < t + window]
        text = " ".join(x for _, x in chunk).lower()
        if chunk and not any(b in text for b in banned):
            score = sum(text.count(k) * w for k, w in reactions.items())
            score += sum(text.count(f) * 2 for f in focus)
            if score > 0:
                candidates.append({"start": t, "end": t + window, "score": score,
                                   "text": " ".join(x for _, x in chunk)})
        t += step
    candidates.sort(key=lambda c: -c["score"])
    picked = []
    for c in candidates:
        if all(c["end"] <= p["start"] or c["start"] >= p["end"] for p in picked):
            picked.append(c)
        if len(picked) >= top:
            break
    picked.sort(key=lambda c: c["start"])
    return picked


def cmd_find(a):
    campaign = load_campaign(a.campaign)
    with tempfile.TemporaryDirectory() as wd:
        lines = fetch_transcript(a.url, wd)
    moments = find_moments(lines, campaign, top=a.top)
    if not moments:
        die("No strong moments found. Try a longer video or add keywords in the campaign file.")
    OUT_DIR.mkdir(exist_ok=True)
    base = OUT_DIR / f"moments-{slug(a.url[-11:])}"
    rows = []
    for i, m in enumerate(moments, 1):
        rows.append({"keep": True, "source": a.url, "start": fmt_ts(m["start"]), "end": fmt_ts(m["end"]),
                     "score": m["score"], "hook": "", "title": "", "caption": "", "hashtags": [],
                     "transcript": m["text"]})
    Path(f"{base}.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False))
    md = [f"# Moments for {a.url}\n",
          "Edit the .json: set keep=false for ones you don't want, write hook, title, caption and hashtags,",
          "tighten start/end. Or ask Claude: 'write hooks, titles and captions and tighten timestamps'.\n"]
    for i, r in enumerate(rows, 1):
        md.append(f"## {i}. {r['start']} → {r['end']}  (score {r['score']})\n{r['transcript']}\n")
    Path(f"{base}.md").write_text("\n".join(md))
    print(f"✔ Found {len(rows)} moments")
    for i, r in enumerate(rows, 1):
        print(f"  {i}. {r['start']}–{r['end']}  score {r['score']}: {r['transcript'][:80]}…")
    print(f"\nSaved: {base}.json and {base}.md")

# ---------------------------------------------------------------- cut

def get_source(source, start, end, workdir):
    """Return (path, offset). For URLs, download only the needed section."""
    if Path(source).expanduser().exists():
        return str(Path(source).expanduser()), start
    need("yt-dlp")
    out = str(Path(workdir) / "src.%(ext)s")
    extra = []
    certs = os.environ.get("SSL_CERT_FILE")
    if certs:
        extra = ["--downloader-args", f"ffmpeg_i:-ca_file {certs}"]
    run(["yt-dlp", *extra, "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--download-sections",
         f"*{start}-{end}", "--force-keyframes-at-cuts", "--merge-output-format", "mp4", "-o", out, source],
        quiet=False)
    files = list(Path(workdir).glob("src.*"))
    if not files:
        die("Download failed.")
    return str(files[0]), 0.0


def transcribe_words(path, model_name):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        die("faster-whisper is not installed. Run ./setup_mac.sh first.")
    print(f"• Transcribing for captions (model {model_name})…")
    import numpy as np
    # Decode audio with ffmpeg (16 kHz mono) so we don't depend on PyAV versions.
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True).stdout
    if not raw:
        return []
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio, word_timestamps=True, vad_filter=True, language="en")
    words = []
    for seg in segments:
        for w in seg.words or []:
            txt = w.word.strip()
            if txt:
                words.append((w.start, w.end, txt))
    return words


FONTS_DIR = HERE / "fonts"
YELLOW = r"\c&H00E6FF&"      # active word (ASS colours are &HBBGGRR&)
GREEN = r"\c&H5CF25C&"       # names / reaction words
WHITE = r"\c&HFFFFFF&"


def ass_time(t):
    t = max(0.0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def ass_escape(s):
    return s.replace("\\", "").replace("{", "(").replace("}", ")")


def group_words(words, max_words=3, max_chars=18, gap=0.45):
    """Split words into short caption bursts, breaking on pauses and sentence ends."""
    groups, cur = [], []
    for w in words:
        if cur:
            text_len = len(" ".join(x[2] for x in cur + [w]))
            pause = w[0] - cur[-1][1]
            ends = cur[-1][2][-1:] in ".!?,"
            if len(cur) >= max_words or text_len > max_chars or pause > gap or ends:
                groups.append(cur)
                cur = []
        cur.append(w)
    if cur:
        groups.append(cur)
    return groups


def emphasis_words(campaign):
    words = {k.lower() for k in DEFAULT_REACTIONS if " " not in k and not k.startswith("[")}
    words |= {k.lower() for k in campaign.get("extra_keywords", {}) if " " not in k}
    words |= {n.lower() for n in campaign.get("focus_names", [])}
    return words


def clean_word(w):
    return re.sub(r"[^\w']", "", w.lower())


def layout_geometry(layout, zoom):
    """Where the video sits on the 1080x1920 canvas: (top, bottom) in pixels."""
    if layout == "split":
        return 0, 1920
    h = int(round(1080 * zoom * 9 / 16 / 2)) * 2
    top = (1920 - h) // 2 - 80
    return top, top + h


def build_ass(words, hook, duration, layout, campaign, zoom=1.3):
    top, bottom = layout_geometry(layout, zoom)
    cap_y = bottom - 150 if layout != "split" else 1150
    hook_y = max(top - 190, 260) if layout != "split" else 760
    emph = emphasis_words(campaign)
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Anton,120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,8,4,5,60,60,0,1
Style: Hook,Anton,108,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,7,5,5,70,70,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    if hook:
        # Hook: pops in above the video, accent colour on the last word, fades after a few seconds.
        hw = ass_escape(hook.upper()).split()
        if len(hw) > 1:
            hw[-1] = "{" + YELLOW + "}" + hw[-1]
        # two balanced lines read like a title instead of a strip of small text
        if len(hw) >= 4:
            cut = min(range(1, len(hw)), key=lambda i: abs(len(" ".join(hw[:i])) - len(" ".join(hw[i:]))))
            hw.insert(cut, r"\N")
        text = " ".join(hw).replace(r" \N ", r"\N")
        pop = r"\fscx30\fscy30\t(0,140,\fscx108\fscy108)\t(140,240,\fscx100\fscy100)"
        ev.append(f"Dialogue: 2,{ass_time(0)},{ass_time(min(3.2, duration))},Hook,,0,0,0,,"
                  f"{{\\an5\\pos(540,{hook_y})\\fad(0,250){pop}\\q0}}{text}")
    for g in group_words(words):
        g_end = g[-1][1]
        for j, (ws, we, _) in enumerate(g):
            start = g[0][0] if j == 0 else ws
            end = g[j + 1][0] if j + 1 < len(g) else max(g_end, start + 0.35)
            end = min(end, duration)
            if end <= start:
                continue
            parts = []
            for k, (_, _, wt) in enumerate(g):
                t = ass_escape(wt.upper())
                if k == j:
                    parts.append("{" + YELLOW + r"\fscx112\fscy112}" + t + "{" + WHITE + r"\fscx100\fscy100}")
                elif clean_word(wt) in emph:
                    parts.append("{" + GREEN + "}" + t + "{" + WHITE + "}")
                else:
                    parts.append(t)
            pop = r"\fscx75\fscy75\t(0,90,\fscx100\fscy100)" if j == 0 else ""
            ev.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Cap,,0,0,0,,"
                      f"{{\\an5\\pos(540,{cap_y}){pop}}}" + " ".join(parts))
    return header + "\n".join(ev) + "\n"


def video_filter(layout, facecam, zoom=1.3, duration=None):
    if layout == "split":
        if not facecam:
            die("--layout split needs --facecam x,y,w,h (in pixels of the source video). Use the 'frame' tip in README.")
        x, y, w, h = facecam
        base = ("[0:v]split=2[a][b];"
                f"[a]crop={w}:{h}:{x}:{y},scale=1080:768:force_original_aspect_ratio=increase,crop=1080:768[top];"
                "[b]crop=ih*1080/1152:ih,scale=1080:1152[bot];"
                "[top][bot]vstack=inputs=2,setsar=1")
    else:
        # fit: the video zoomed in slightly in the middle, a dark blurred copy fills the background,
        # with a soft shadow line so the video looks framed instead of pasted on.
        top, bottom = layout_geometry(layout, zoom)
        h = bottom - top
        w = int(round(1080 * zoom / 2)) * 2
        base = ("[0:v]split=2[a][b];"
                "[a]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=12:3,"
                "scale=1080:1920,eq=brightness=-0.22:saturation=1.25,vignette=PI/4[bg];"
                f"[b]scale={w}:{h}:force_original_aspect_ratio=increase,crop=1080:{h},"
                "unsharp=5:5:0.6:5:5:0,eq=contrast=1.05:saturation=1.12[fg];"
                f"[bg]drawbox=x=0:y={top - 6}:w=1080:h={h + 12}:color=black@0.55:t=fill[bgs];"
                f"[bgs][fg]overlay=0:{top},setsar=1")
    if duration:
        # thin progress bar along the bottom keeps people watching to the end
        base += (f",drawbox=x=0:y=1904:w=1080:h=16:color=black@0.45:t=fill,"
                 f"drawbox=x=0:y=1904:w='max(2,1080*t/{duration:.3f})':h=16:color=0xFFE600@0.95:t=fill")
    return base + "[v]"


def write_post_text(path, name, source, start, end, hook, title, caption, hashtags, campaign):
    """Ready-to-paste text for YouTube Shorts and TikTok."""
    required = campaign.get("required_hashtags", [])
    pool = campaign.get("hashtag_pool", [])
    tags = []
    for t in list(required) + list(hashtags or []) + list(pool):
        t = t if t.startswith("#") else f"#{t}"
        if t.lower() not in [x.lower() for x in tags]:
            tags.append(t)
    tags = tags[:6]
    title = (title or hook or "").strip()
    yt_title = title if len(title) <= 90 else title[:87].rstrip() + "…"
    if "#shorts" not in yt_title.lower() and len(yt_title) < 88:
        yt_title += " #shorts"
    body = (caption or title).strip()
    credit = campaign.get("credit", "").format(source=source).strip()
    question = campaign.get("cta", "").strip()
    desc = "\n\n".join(x for x in [body, question, credit, " ".join(tags)] if x)
    tiktok = " ".join(x for x in [body, question, " ".join(tags)] if x)
    path.write_text(
        f"=== YOUTUBE SHORTS ===\nTITLE:\n{yt_title}\n\nDESCRIPTION:\n{desc}\n\n"
        f"=== TIKTOK ===\nCAPTION:\n{tiktok}\n\n"
        f"=== THUMBNAIL ===\n{name}.jpg (upload as the cover; it is unique to this clip)\n\n"
        f"Source: {source} ({start}–{end})\n"
        f"Checklist: {campaign.get('checklist', 'review before posting')}\n", encoding="utf-8")


def make_thumbnail(video, duration, hook, out_jpg, wd):
    """Grab a frame from the middle of the finished clip and stamp the hook on it."""
    frame = Path(wd) / "thumb.png"
    run(["ffmpeg", "-y", "-ss", f"{max(0.0, duration * 0.45):.2f}", "-i", str(video), "-frames:v", "1", str(frame)])
    if not hook:
        run(["ffmpeg", "-y", "-i", str(frame), "-q:v", "2", str(out_jpg)])
        return
    words = ass_escape(hook.upper()).split()
    lines, cur = [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > 14:
            lines.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    lines.append(cur)
    if len(lines) > 1:
        lines[-1] = "{" + YELLOW + "}" + lines[-1]
    ass = Path(wd) / "thumb.ass"
    ass.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: T,Anton,150,&H00FFFFFF,&H00FFFFFF,&H00000000,&HA0000000,0,0,0,0,100,100,2,0,1,10,8,5,50,50,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:10.00,T,,0,0,0,,{{\\an5\\pos(540,430)\\frz-3}}{"\\N".join(lines)}
""", encoding="utf-8")
    run(["ffmpeg", "-y", "-i", str(frame), "-vf",
         f"eq=contrast=1.1:saturation=1.3,ass={ass}:fontsdir={FONTS_DIR}", "-q:v", "2", str(out_jpg)])


def make_clip(source, start, end, hook, caption, campaign, layout, facecam, model, name=None,
              title="", hashtags=None, words=None):
    need("ffmpeg")
    s, e = to_seconds(start), to_seconds(end)
    if e <= s:
        die("--end must be after --start")
    duration = e - s
    zoom = float(campaign.get("zoom", 1.3))
    OUT_DIR.mkdir(exist_ok=True)
    name = name or slug(hook or f"clip-{start}")
    final = OUT_DIR / f"{name}.mp4"
    with tempfile.TemporaryDirectory() as wd:
        path, offset = get_source(source, s, e, wd)
        piece = str(Path(wd) / "piece.mp4")
        print("• Cutting…")
        run(["ffmpeg", "-y", "-ss", f"{offset}", "-i", path, "-t", f"{duration}", "-c:v", "libx264",
             "-preset", "veryfast", "-crf", "16", "-c:a", "aac", "-b:a", "192k", piece])
        if words is None:
            words = transcribe_words(piece, model)
        ass = Path(wd) / "caps.ass"
        ass.write_text(build_ass(words, hook, duration, layout, campaign, zoom), encoding="utf-8")
        print("• Rendering vertical clip with animated captions…")
        vf = (video_filter(layout, facecam, zoom, duration)
              + f";[v]ass={ass}:fontsdir={FONTS_DIR},fps=fps='min(source_fps,60)'[out]")
        run(["ffmpeg", "-y", "-i", piece, "-filter_complex", vf, "-map", "[out]", "-map", "0:a?",
             "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p",
             "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(final)])
        print("• Making thumbnail…")
        make_thumbnail(final, duration, hook, OUT_DIR / f"{name}.jpg", wd)
    write_post_text(OUT_DIR / f"{name}.txt", name, source, start, end, hook, title, caption, hashtags, campaign)
    print(f"✔ {final}\n  post text → {OUT_DIR / (name + '.txt')}\n  thumbnail → {OUT_DIR / (name + '.jpg')}")
    return final


def parse_facecam(v):
    if not v:
        return None
    parts = [int(p) for p in v.split(",")]
    if len(parts) != 4:
        die("--facecam must be x,y,w,h")
    return parts


def cmd_cut(a):
    campaign = load_campaign(a.campaign)
    make_clip(a.source, a.start, a.end, a.hook, a.caption, campaign,
              a.layout or campaign.get("layout", "fit"), parse_facecam(a.facecam or campaign.get("facecam")),
              a.model, a.name, title=a.title, hashtags=a.hashtags.split() if a.hashtags else None)


def cmd_batch(a):
    campaign = load_campaign(a.campaign)
    rows = json.loads(Path(a.moments).read_text())
    keep = [r for r in rows if r.get("keep", True)]
    print(f"Making {len(keep)} clips…")
    for i, r in enumerate(keep, 1):
        print(f"\n[{i}/{len(keep)}] {r['start']}–{r['end']} {r.get('hook', '')}")
        make_clip(r["source"], r["start"], r["end"], r.get("hook", ""), r.get("caption", ""), campaign,
                  a.layout or campaign.get("layout", "fit"), parse_facecam(campaign.get("facecam")),
                  a.model, f"{i:02d}-{slug(r.get('hook') or r['start'])}",
                  title=r.get("title", ""), hashtags=r.get("hashtags"))

# ---------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description="SYNQ AutoClipper (free)")
    sub = p.add_subparsers(dest="cmd", required=True)

    f = sub.add_parser("find", help="find best moments in a YouTube video")
    f.add_argument("url")
    f.add_argument("--top", type=int, default=8)
    f.add_argument("--campaign", default="dylan_page")
    f.set_defaults(fn=cmd_find)

    c = sub.add_parser("cut", help="make one clip")
    c.add_argument("source", help="YouTube/Twitch URL or a local video file (e.g. a screen recording)")
    c.add_argument("--start", required=True, help="e.g. 4:21:03 (for a local file: time inside that file)")
    c.add_argument("--end", required=True)
    c.add_argument("--hook", default="", help="on-screen text for the first 3 seconds")
    c.add_argument("--title", default="", help="YouTube Shorts title (defaults to the hook)")
    c.add_argument("--caption", default="", help="post description/caption (hashtags are added automatically)")
    c.add_argument("--hashtags", default="", help='extra hashtags, e.g. "#GTA6 #gaming"')
    c.add_argument("--campaign", default="dylan_page")
    c.add_argument("--layout", choices=["fit", "split"])
    c.add_argument("--facecam", help="x,y,w,h of the facecam box in the source (for --layout split)")
    c.add_argument("--model", default="base.en", help="whisper model: tiny.en, base.en, small.en")
    c.add_argument("--name")
    c.set_defaults(fn=cmd_cut)

    b = sub.add_parser("batch", help="make all kept clips from a moments .json")
    b.add_argument("moments")
    b.add_argument("--campaign", default="dylan_page")
    b.add_argument("--layout", choices=["fit", "split"])
    b.add_argument("--model", default="base.en")
    b.set_defaults(fn=cmd_batch)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
