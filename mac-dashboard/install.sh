#!/bin/bash
# SYNQ Dashboard installer for macOS.
#
# Install or update:
#   curl -fsSL https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/main/mac-dashboard/install.sh | bash
# Remove:
#   curl -fsSL https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/main/mac-dashboard/install.sh | bash -s -- --uninstall
#
# What it sets up:
#   ~/Library/Application Support/SYNQ Dashboard/   the dashboard page, the data fetcher, and your numbers
#   /Applications/SYNQ Dashboard.app                 opens the dashboard (refreshes the numbers first)
#   /Applications/SYNQ Dashboard Keys.app            opens your private .env file to add or change keys
#   ~/Library/LaunchAgents/com.synqstudios.dashboard.plist   refreshes the numbers every 15 minutes
# Keys live only in ~/Library/Application Support/SYNQ Dashboard/.env (readable by you only).
# Re-running the installer never overwrites a .env you've already filled in.

set -euo pipefail

RAW="https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/main/mac-dashboard"
DIR="$HOME/Library/Application Support/SYNQ Dashboard"
AGENT_ID="com.synqstudios.dashboard"
AGENT="$HOME/Library/LaunchAgents/$AGENT_ID.plist"
if [ -w /Applications ]; then APPS="/Applications"; else APPS="$HOME/Applications"; fi
MAIN_APP="$APPS/SYNQ Dashboard.app"
KEYS_APP="$APPS/SYNQ Dashboard Keys.app"

say() { printf '\033[1m%s\033[0m\n' "$*"; }

if [ "$(uname)" != "Darwin" ]; then echo "This installer is for macOS."; exit 1; fi

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "gui/$(id -u)/$AGENT_ID" 2>/dev/null || true
  rm -f "$AGENT"
  rm -rf "/Applications/SYNQ Dashboard.app" "/Applications/SYNQ Dashboard Keys.app" \
         "$HOME/Applications/SYNQ Dashboard.app" "$HOME/Applications/SYNQ Dashboard Keys.app" "$DIR"
  say "SYNQ Dashboard removed (apps, numbers and your .env keys file)."
  exit 0
fi

say "Installing SYNQ Dashboard…"
mkdir -p "$DIR" "$APPS" "$HOME/Library/LaunchAgents"
for f in fetch.js dashboard.html icon.png .env.example; do
  curl -fsSL "$RAW/$f?$(date +%s)" -o "$DIR/$f"
done
# Private keys file: created once from the template, only you can read it
if [ ! -f "$DIR/.env" ]; then cp "$DIR/.env.example" "$DIR/.env"; fi
chmod 600 "$DIR/.env"

# ---- "SYNQ Dashboard Keys" app: opens the .env file in TextEdit
cat > "$DIR/keys.applescript" <<'APPLESCRIPT'
on run
	set envFile to POSIX path of (path to home folder) & "Library/Application Support/SYNQ Dashboard/.env"
	display dialog "Your keys file will open in TextEdit." & return & return & "Paste each key right after its = sign (no spaces or quotes), then press ⌘S to save and close the window." & return & return & "Then open SYNQ Dashboard to see your numbers." buttons {"Open .env"} default button 1 with title "SYNQ Dashboard Keys"
	do shell script "open -W -e " & quoted form of envFile
	do shell script "chmod 600 " & quoted form of envFile
end run
APPLESCRIPT

# ---- "SYNQ Dashboard" app: asks for keys the first time, refreshes the numbers, opens the page
cat > "$DIR/main.applescript" <<APPLESCRIPT
on run
	set base to POSIX path of (path to home folder) & "Library/Application Support/SYNQ Dashboard/"
	-- First time (no keys filled in yet): open the keys file
	try
		do shell script "grep -Eq '^(GOATCOUNTER_API_KEY|SQUARE_ACCESS_TOKEN|YOUTUBE_API_KEY)=[^[:space:]]' " & quoted form of (base & ".env")
	on error
		do shell script "open -W " & quoted form of "$KEYS_APP"
	end try
	display notification "Pulling your latest numbers…" with title "SYNQ Dashboard"
	try
		do shell script "/usr/bin/osascript -l JavaScript " & quoted form of (base & "fetch.js")
	end try
	do shell script "open " & quoted form of (base & "dashboard.html")
end run
APPLESCRIPT

rm -rf "$MAIN_APP" "$KEYS_APP"
osacompile -o "$KEYS_APP" "$DIR/keys.applescript"
osacompile -o "$MAIN_APP" "$DIR/main.applescript"

# App icons
if sips -s format icns "$DIR/icon.png" --out "$DIR/applet.icns" >/dev/null 2>&1; then
  for app in "$MAIN_APP" "$KEYS_APP"; do
    cp "$DIR/applet.icns" "$app/Contents/Resources/applet.icns"
    rm -f "$app/Contents/Resources/Assets.car"
    /usr/libexec/PlistBuddy -c "Delete :CFBundleIconName" "$app/Contents/Info.plist" >/dev/null 2>&1 || true
    codesign --force --deep -s - "$app" >/dev/null 2>&1 || true
    touch "$app"
  done
fi

# ---- refresh every 15 minutes in the background
cat > "$AGENT" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$AGENT_ID</string>
  <key>ProgramArguments</key>
  <array><string>/usr/bin/osascript</string><string>-l</string><string>JavaScript</string><string>$DIR/fetch.js</string></array>
  <key>StartInterval</key><integer>900</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>$DIR/refresh-errors.log</string>
</dict>
</plist>
PLIST
launchctl bootout "gui/$(id -u)/$AGENT_ID" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$AGENT"

say "Done. Opening SYNQ Dashboard…"
echo "It's in $APPS. Drag it to your Dock to keep it handy."
echo "Check your keys any time with:"
echo "  osascript -l JavaScript \"$DIR/fetch.js\" --test"
open "$MAIN_APP"
