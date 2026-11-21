#!/bin/bash
# One-line installer: downloads SYNQ AutoClipper into ~/SYNQ-AutoClipper and sets it up.
set -e
BASE="https://raw.githubusercontent.com/synqsturkfd/synq-studios-site/claude/magical-dirac-422l4b/marketing-agency/clipping/autoclipper"
DIR="$HOME/SYNQ-AutoClipper"
mkdir -p "$DIR/campaigns"
cd "$DIR"
for f in clipper.py clip setup_mac.sh README.md CLAUDE.md campaigns/dylan_page.json; do
  curl -fsSL "$BASE/$f" -o "$f"
done
chmod +x clip setup_mac.sh
echo "Downloaded to $DIR"
./setup_mac.sh
