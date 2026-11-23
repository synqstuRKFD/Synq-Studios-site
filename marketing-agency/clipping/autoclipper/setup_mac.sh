#!/bin/bash
# One-time setup for SYNQ AutoClipper on a Mac.
# NO admin password needed: everything is installed inside this folder (bin/ and .venv/).
set -e
cd "$(dirname "$0")"
DIR="$(pwd)"
BIN="$DIR/bin"
mkdir -p "$BIN"

case "$(uname -m)" in
  arm64)  FF_ARCH=arm64; DENO_ARCH=aarch64 ;;
  x86_64) FF_ARCH=amd64; DENO_ARCH=x86_64 ;;
  *) echo "Unsupported Mac type: $(uname -m)"; exit 1 ;;
esac

fetch_zip () {  # url, name-in-zip
  local tmp; tmp="$(mktemp -d)"
  echo "• Downloading $2…"
  curl -fL --progress-bar "$1" -o "$tmp/x.zip"
  unzip -o -q "$tmp/x.zip" -d "$tmp/out"
  find "$tmp/out" -type f -name "$2" -exec mv {} "$BIN/$2" \;
  chmod +x "$BIN/$2"
  rm -rf "$tmp"
}

[ -x "$BIN/ffmpeg" ]  || fetch_zip "https://ffmpeg.martin-riedl.de/redirect/latest/macos/$FF_ARCH/release/ffmpeg.zip" ffmpeg
[ -x "$BIN/ffprobe" ] || fetch_zip "https://ffmpeg.martin-riedl.de/redirect/latest/macos/$FF_ARCH/release/ffprobe.zip" ffprobe
[ -x "$BIN/deno" ]    || fetch_zip "https://github.com/denoland/deno/releases/latest/download/deno-$DENO_ARCH-apple-darwin.zip" deno

if [ ! -x "$BIN/uv" ]; then
  echo "• Downloading uv (Python manager)…"
  curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="$BIN" UV_NO_MODIFY_PATH=1 INSTALLER_NO_MODIFY_PATH=1 sh >/dev/null
fi

echo "• Setting up Python + Whisper + yt-dlp (first time takes a few minutes)…"
"$BIN/uv" venv --quiet --allow-existing --python 3.12 "$DIR/.venv"
"$BIN/uv" pip install --quiet --python "$DIR/.venv/bin/python" --upgrade faster-whisper "yt-dlp[default]"

echo "• Checking…"
"$BIN/ffmpeg" -hide_banner -filters 2>/dev/null | grep -q " ass " && echo "  ffmpeg ✔"
"$BIN/deno" --version | head -1 | sed 's/^/  /'
"$DIR/.venv/bin/yt-dlp" --version | sed 's/^/  yt-dlp /'
"$DIR/.venv/bin/python" -c "import faster_whisper; print('  whisper ✔')"
echo
echo "✔ Setup done."
