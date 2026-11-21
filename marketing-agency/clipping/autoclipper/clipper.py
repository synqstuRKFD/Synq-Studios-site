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
                     "score": m["score"], "hook": "", "caption": "", "transcript": m["text"]})
    Path(f"{base}.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False))
    md = [f"# Moments for {a.url}\n",
          "Edit the .json: set keep=false for ones you don't want, write a hook + caption, tighten start/end.",
          "Or paste this whole file to Claude and ask: 'write hooks and captions and tighten timestamps'.\n"]
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
    run(["yt-dlp", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--download-sections",
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


def ass_time(t):
    t = max(0.0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def ass_escape(s):
    return s.replace("\\", "").replace("{", "(").replace("}", ")")


def build_ass(words, hook, duration, layout, per_line=3, hook_secs=3.0):
    cap_margin = 430 if layout == "fit" else 160
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Arial Black,86,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,2,2,60,60,{cap_margin},1
Style: Hook,Arial Black,64,&H00000000,&H00000000,&H0000B4FF,&H0000B4FF,-1,0,0,0,100,100,0,0,3,18,0,8,70,70,230,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    if hook:
        ev.append(f"Dialogue: 1,{ass_time(0)},{ass_time(min(hook_secs, duration))},Hook,,0,0,0,,{ass_escape(hook)}")
    for i in range(0, len(words), per_line):
        group = words[i:i + per_line]
        start = group[0][0]
        nxt = words[i + per_line][0] if i + per_line < len(words) else group[-1][1] + 0.4
        end = min(max(group[-1][1], start + 0.3), nxt, duration)
        text = " ".join(w[2] for w in group).upper()
        ev.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Cap,,0,0,0,,{ass_escape(text)}")
    return header + "\n".join(ev) + "\n"


def video_filter(layout, facecam):
    if layout == "split":
        if not facecam:
            die("--layout split needs --facecam x,y,w,h (in pixels of the source video). Use the 'frame' tip in README.")
        x, y, w, h = facecam
        return ("[0:v]split=2[a][b];"
                f"[a]crop={w}:{h}:{x}:{y},scale=1080:768:force_original_aspect_ratio=increase,crop=1080:768[top];"
                "[b]crop=ih*1080/1152:ih,scale=1080:1152[bot];"
                "[top][bot]vstack=inputs=2,setsar=1[v]")
    # fit: whole frame in the middle, blurred copy fills the background
    return ("[0:v]split=2[a][b];"
            "[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.15[bg];"
            "[b]scale=1080:-2[fg];"
            "[bg][fg]overlay=0:(H-h)/2-80,setsar=1[v]")


def make_clip(source, start, end, hook, caption, campaign, layout, facecam, model, name=None):
    need("ffmpeg")
    s, e = to_seconds(start), to_seconds(end)
    if e <= s:
        die("--end must be after --start")
    duration = e - s
    OUT_DIR.mkdir(exist_ok=True)
    name = name or slug(hook or f"clip-{start}")
    final = OUT_DIR / f"{name}.mp4"
    with tempfile.TemporaryDirectory() as wd:
        path, offset = get_source(source, s, e, wd)
        piece = str(Path(wd) / "piece.mp4")
        print("• Cutting…")
        run(["ffmpeg", "-y", "-ss", f"{offset}", "-i", path, "-t", f"{duration}", "-c:v", "libx264",
             "-preset", "veryfast", "-crf", "18", "-c:a", "aac", "-b:a", "160k", piece])
        words = transcribe_words(piece, model)
        ass = Path(wd) / "caps.ass"
        ass.write_text(build_ass(words, hook, duration, layout), encoding="utf-8")
        print("• Rendering vertical clip with captions…")
        vf = video_filter(layout, facecam) + f";[v]ass={ass}[out]"
        run(["ffmpeg", "-y", "-i", piece, "-filter_complex", vf, "-map", "[out]", "-map", "0:a?",
             "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
             "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(final)])
    tags = " ".join(campaign.get("required_hashtags", []))
    cap_text = (caption or hook or "").strip()
    if tags and not all(t.lower() in cap_text.lower() for t in campaign.get("required_hashtags", [])):
        cap_text = f"{cap_text} {tags}".strip()
    (OUT_DIR / f"{name}.txt").write_text(
        f"TITLE / CAPTION:\n{cap_text}\n\nSource: {source} ({start}–{end})\n"
        f"Checklist: {campaign.get('checklist', 'review before posting')}\n")
    print(f"✔ {final}\n  caption → {OUT_DIR / (name + '.txt')}")
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
              a.model, a.name)


def cmd_batch(a):
    campaign = load_campaign(a.campaign)
    rows = json.loads(Path(a.moments).read_text())
    keep = [r for r in rows if r.get("keep", True)]
    print(f"Making {len(keep)} clips…")
    for i, r in enumerate(keep, 1):
        print(f"\n[{i}/{len(keep)}] {r['start']}–{r['end']} {r.get('hook', '')}")
        make_clip(r["source"], r["start"], r["end"], r.get("hook", ""), r.get("caption", ""), campaign,
                  a.layout or campaign.get("layout", "fit"), parse_facecam(campaign.get("facecam")),
                  a.model, f"{i:02d}-{slug(r.get('hook') or r['start'])}")

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
    c.add_argument("--caption", default="", help="post caption (required hashtags are added automatically)")
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
