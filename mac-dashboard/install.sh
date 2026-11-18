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
#   /Applications/SYNQ Dashboard Keys.app            paste or change your Square / GoatCounter / YouTube keys
#   ~/Library/LaunchAgents/com.synqstudios.dashboard.plist   refreshes the numbers every 15 minutes
# Keys are stored in your macOS Keychain (service "synq-dashboard"), never in a file.

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
  for a in square goatcounter youtube; do security delete-generic-password -s synq-dashboard -a "$a" >/dev/null 2>&1 || true; done
  say "SYNQ Dashboard removed (apps, numbers and saved keys)."
  exit 0
fi

say "Installing SYNQ Dashboard…"
mkdir -p "$DIR" "$APPS" "$HOME/Library/LaunchAgents"
for f in fetch.js dashboard.html icon.png; do
  curl -fsSL "$RAW/$f?$(date +%s)" -o "$DIR/$f"
done

# ---- "SYNQ Dashboard Keys" app: asks for each key and saves it in the Keychain
cat > "$DIR/keys.applescript" <<'APPLESCRIPT'
on askKey(acct, title, help)
	set current to ""
	try
		set current to do shell script "security find-generic-password -s synq-dashboard -a " & acct & " -w"
	end try
	if current is "" then
		set stateLine to "Not connected yet."
	else
		set stateLine to "Already connected. Leave the box empty to keep the key you have."
	end if
	set r to display dialog title & return & return & help & return & return & stateLine default answer "" with hidden answer buttons {"Skip", "Save"} default button "Save" with title "SYNQ Dashboard Keys"
	set v to text returned of r
	if button returned of r is "Save" and v is not "" then
		do shell script "security add-generic-password -U -s synq-dashboard -a " & acct & " -w " & quoted form of v
	end if
end askKey

on run
	askKey("square", "1 of 3 · Square (money and bookings)", "Paste your Square PRODUCTION access token. Get it at developer.squareup.com → your app → Credentials (switch to Production).")
	askKey("goatcounter", "2 of 3 · Website stats (GoatCounter)", "Paste your GoatCounter API key. Get it at synqstudiosrkfd.goatcounter.com → Settings → API → New API key (tick “Read statistics”).")
	askKey("youtube", "3 of 3 · YouTube", "Paste your YouTube Data API key. Get it at console.cloud.google.com → APIs & Services → Credentials → Create credentials → API key.")
	do shell script "touch " & quoted form of (POSIX path of (path to home folder) & "Library/Application Support/SYNQ Dashboard/.keys-asked")
	display notification "Keys saved. Open SYNQ Dashboard to see your numbers." with title "SYNQ Dashboard"
end run
APPLESCRIPT

# ---- "SYNQ Dashboard" app: asks for keys the first time, refreshes the numbers, opens the page
cat > "$DIR/main.applescript" <<APPLESCRIPT
on run
	set base to POSIX path of (path to home folder) & "Library/Application Support/SYNQ Dashboard/"
	try
		do shell script "test -e " & quoted form of (base & ".keys-asked")
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
open "$MAIN_APP"
