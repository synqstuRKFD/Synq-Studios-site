#!/bin/bash
# One-time setup for SYNQ AutoClipper on a Mac. Free tools only.
set -e
if ! command -v brew >/dev/null; then
  echo "Installing Homebrew (Mac package manager)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi
brew install ffmpeg yt-dlp deno python@3.12
cd "$(dirname "$0")"
python3.12 -m venv .venv
./.venv/bin/pip install --upgrade pip faster-whisper
echo
echo "✔ Setup done. Run clips with:  ./clip find <youtube-url>   or   ./clip cut <url-or-file> --start … --end … --hook \"…\""
