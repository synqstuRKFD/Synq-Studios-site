#!/bin/bash
# SYNQ Dashboard installer for macOS.
#
# Install or update:
#   curl -fsSL https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/refs/heads/main/mac-dashboard/install.sh | bash
# Remove:
#   curl -fsSL https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/refs/heads/main/mac-dashboard/install.sh | bash -s -- --uninstall
#
# What it sets up:
#   ~/Library/Application Support/SYNQ Dashboard/   the dashboard page, the data fetcher, and your numbers
#   /Applications/SYNQ Dashboard.app                 opens the dashboard (refreshes the numbers first)
#   /Applications/SYNQ Dashboard Keys.app            opens your private .env file to add or change keys
#   ~/Library/LaunchAgents/com.synqstudios.dashboard.plist   refreshes the numbers every 15 minutes
# Keys live only in ~/Library/Application Support/SYNQ Dashboard/.env (readable by you only).
# Re-running the installer never overwrites a .env you've already filled in.

set -euo pipefail

RAW="https://raw.githubusercontent.com/synqstuRKFD/Synq-Studios-site/refs/heads/main/mac-dashboard"
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
mkdir -p "$DIR/vendor"
for f in fetch.js dashboard.html icon.png logo.png logo-edge.png .env.example vendor/nacl-fast.min.js vendor/scrypt.js vendor/qrcode.js; do
  curl -fsSL "$RAW/$f?$(date +%s)" -o "$DIR/$f"
done
# Private keys file: created once from the template, only you can read it
if [ ! -f "$DIR/.env" ]; then cp "$DIR/.env.example" "$DIR/.env"; fi
# Add the phone-version lines to an existing .env without touching your keys
if ! grep -q '^PHONE_PASSCODE=' "$DIR/.env"; then
  printf '\n# Phone version (optional). Passcode: at least 12 characters, e.g. 4 words.\nPHONE_PASSCODE=\nGITHUB_GIST_TOKEN=\n' >> "$DIR/.env"
fi
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

# ---- "SYNQ Dashboard" app: a real Mac window (built-in WebKit) that stays open with the SYNQ
# icon in the Dock. It asks for keys the first time, refreshes the numbers in the background, and
# opens links in your normal browser. Closing the window quits the app.
cat > "$DIR/main.applescript" <<APPLESCRIPT
use AppleScript version "2.4"
use framework "Foundation"
use framework "AppKit"
use framework "WebKit"
use scripting additions

property theWindow : missing value
property theWeb : missing value
property theTimer : missing value

on run
	set base to POSIX path of (path to home folder) & "Library/Application Support/SYNQ Dashboard/"
	-- First time (no keys filled in yet): open the keys file
	try
		do shell script "grep -Eq '^(GOATCOUNTER_API_KEY|SQUARE_ACCESS_TOKEN|YOUTUBE_API_KEY)=[^[:space:]]' " & quoted form of (base & ".env")
	on error
		do shell script "open -W " & quoted form of "$KEYS_APP"
	end try
	-- Refresh the numbers in the background; the page picks them up on its own
	do shell script "/usr/bin/osascript -l JavaScript " & quoted form of (base & "fetch.js") & " >/dev/null 2>&1 &"
	try
		my showWindow(base)
	on error errMsg number errNum
		-- If the app window can't be made, say why (and save it), then fall back to the browser
		do shell script "echo " & quoted form of ((current date) as text & " | " & errNum & " | " & errMsg) & " >> " & quoted form of (base & "app-errors.log")
		display dialog "The dashboard window couldn't open, so it will open in your browser instead." & return & return & "Send this to Claude:" & return & errMsg & " (" & errNum & ")" buttons {"OK"} default button 1 with title "SYNQ Dashboard" with icon caution
		do shell script "open " & quoted form of (base & "dashboard.html")
		quit
	end try
end run

on showWindow(base)
	set ca to current application
	try
		set dockIcon to ca's NSImage's alloc()'s initWithContentsOfFile:(base & "icon.png")
		if dockIcon is not missing value then ca's NSApplication's sharedApplication()'s setApplicationIconImage:dockIcon
	end try
	set frame to {{0, 0}, {1360, 900}}
	set theWindow to ca's NSWindow's alloc()'s initWithContentRect:frame styleMask:15 backing:2 defer:false
	theWindow's setTitle:"SYNQ Dashboard"
	theWindow's setReleasedWhenClosed:false
	theWindow's setMinSize:{760, 560}
	theWindow's setTitlebarAppearsTransparent:true
	theWindow's setBackgroundColor:(ca's NSColor's colorWithRed:0.027 green:0.016 blue:0.016 alpha:1.0)
	try
		theWindow's setAppearance:(ca's NSAppearance's appearanceNamed:"NSAppearanceNameDarkAqua")
	end try
	theWindow's |center|()
	theWindow's setFrameAutosaveName:"SYNQDashboardWindow"
	set conf to ca's WKWebViewConfiguration's alloc()'s init()
	set theWeb to ca's WKWebView's alloc()'s initWithFrame:frame configuration:conf
	theWeb's setAutoresizingMask:18
	try
		theWeb's setValue:false forKey:"drawsBackground"
	end try
	theWindow's setContentView:theWeb
	set pageURL to ca's NSURL's fileURLWithPath:(base & "dashboard.html")
	set dirURL to ca's NSURL's fileURLWithPath:base
	theWeb's loadFileURL:pageURL allowingReadAccessToURL:dirURL
	theWindow's makeKeyAndOrderFront:me
	ca's NSApplication's sharedApplication()'s activateIgnoringOtherApps:true
	set theTimer to ca's NSTimer's scheduledTimerWithTimeInterval:0.4 target:me selector:"tick:" userInfo:(missing value) repeats:true
end showWindow

-- Twice a second: quit when the window is closed, and open links the page asks for
on tick:t
	if theWindow is missing value then return
	if not ((theWindow's isVisible()) as boolean) and not ((theWindow's isMiniaturized()) as boolean) then
		theTimer's invalidate()
		current application's NSApplication's sharedApplication()'s terminate:(missing value)
		return
	end if
	set u to theWeb's |URL|()
	if u is missing value then return
	set frag to u's fragment()
	if frag is missing value then return
	set frag to frag as text
	if frag starts with "open=" then
		theWeb's evaluateJavaScript:"history.replaceState(null, '', location.pathname)" completionHandler:(missing value)
		set target to (current application's NSString's stringWithString:(text 6 thru -1 of frag))'s stringByRemovingPercentEncoding()
		if target is not missing value then
			set link to current application's NSURL's URLWithString:target
			if link is not missing value then current application's NSWorkspace's sharedWorkspace()'s openURL:link
		end if
	end if
end tick:

-- Clicking the Dock icon brings the window back to the front
on reopen
	if theWindow is not missing value then theWindow's makeKeyAndOrderFront:me
end reopen
APPLESCRIPT

rm -rf "$MAIN_APP" "$KEYS_APP"
osacompile -o "$KEYS_APP" "$DIR/keys.applescript"
osacompile -s -o "$MAIN_APP" "$DIR/main.applescript"

# App icons: build a proper multi-size .icns with iconutil, put it in each app, and also attach it
# to the app file itself (what Finder, Launchpad and the Dock show). Then tell macOS to re-read it.
ICONSET="$DIR/SYNQ.iconset"
rm -rf "$ICONSET" && mkdir -p "$ICONSET"
for sz in 16 32 128 256 512; do
  sips -z $sz $sz "$DIR/icon.png" --out "$ICONSET/icon_${sz}x${sz}.png" >/dev/null 2>&1 || true
  sips -z $((sz*2)) $((sz*2)) "$DIR/icon.png" --out "$ICONSET/icon_${sz}x${sz}@2x.png" >/dev/null 2>&1 || true
done
if iconutil -c icns "$ICONSET" -o "$DIR/applet.icns" 2>/dev/null || sips -s format icns "$DIR/icon.png" --out "$DIR/applet.icns" >/dev/null 2>&1; then
  for app in "$MAIN_APP" "$KEYS_APP"; do
    cp "$DIR/applet.icns" "$app/Contents/Resources/applet.icns"
    rm -f "$app/Contents/Resources/Assets.car"
    /usr/libexec/PlistBuddy -c "Delete :CFBundleIconName" "$app/Contents/Info.plist" >/dev/null 2>&1 || true
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconFile applet" "$app/Contents/Info.plist" >/dev/null 2>&1 || \
      /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string applet" "$app/Contents/Info.plist" >/dev/null 2>&1 || true
    codesign --force --deep -s - "$app" >/dev/null 2>&1 || true
  done
fi
rm -rf "$ICONSET"
for app in "$MAIN_APP" "$KEYS_APP"; do
  osascript -l JavaScript -e 'ObjC.import("AppKit");' \
    -e 'function run(a){ const img = $.NSImage.alloc.initWithContentsOfFile(a[0]); return $.NSWorkspace.sharedWorkspace.setIconForFileOptions(img, a[1], 0); }' \
    "$DIR/icon.png" "$app" >/dev/null 2>&1 || true
  touch "$app"
  /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$app" >/dev/null 2>&1 || true
done
# Refresh the Dock so it drops any old cached icon (it reappears in a second)
killall Dock >/dev/null 2>&1 || true

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
