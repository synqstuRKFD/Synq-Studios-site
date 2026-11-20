#!/usr/bin/env python3
"""<AUTOMATION NAME> — <one line: what it does>.

Safe by default: runs as a DRY RUN and only prints planned actions.
Pass --apply to execute. Consequential actions (send/publish/delete/spend) additionally
require --confirm-consequential, which should only be used with the owner's approval.

Example (template demo — organizes files by extension):
  python3 automation_template.py ~/Downloads                  # dry run
  python3 automation_template.py ~/Downloads --apply          # move files
"""
import argparse
import json
import logging
import shutil
import sys
from datetime import datetime
from pathlib import Path

STATE_FILE = ".automation-state.json"  # remembers processed items => idempotent re-runs

log = logging.getLogger("automation")


def load_state(root: Path) -> dict:
    try:
        return json.loads((root / STATE_FILE).read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {"processed": []}


def save_state(root: Path, state: dict) -> None:
    (root / STATE_FILE).write_text(json.dumps(state, indent=2))


def plan(root: Path, state: dict) -> list[dict]:
    """Build the list of actions. Pure: never changes anything."""
    actions = []
    for f in sorted(root.iterdir()):
        if not f.is_file() or f.name.startswith(".") or str(f) in state["processed"]:
            continue
        ext = f.suffix.lower().lstrip(".") or "no-extension"
        dest = root / ext / f.name
        if dest.exists():
            actions.append({"type": "skip", "src": str(f), "reason": "destination exists"})
        else:
            actions.append({"type": "move", "src": str(f), "dest": str(dest), "consequential": False})
    return actions


def execute(action: dict) -> None:
    if action["type"] == "move":
        Path(action["dest"]).parent.mkdir(parents=True, exist_ok=True)
        shutil.move(action["src"], action["dest"])


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--apply", action="store_true", help="execute actions (default: dry run)")
    ap.add_argument("--confirm-consequential", action="store_true",
                    help="also execute send/publish/delete/spend actions (owner approval required)")
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.INFO,
                        format="%(asctime)s %(levelname)s %(message)s")

    root = a.folder.expanduser().resolve()
    if not root.is_dir():
        log.error("not a folder: %s", root)
        return 2
    # Secrets come from the environment only, e.g.: token = os.environ.get("SERVICE_TOKEN")
    state = load_state(root)
    actions = plan(root, state)
    mode = "APPLY" if a.apply else "DRY RUN"
    log.info("%s — %d planned actions in %s", mode, len(actions), root)

    done = skipped = held = failed = 0
    for act in actions:
        if act["type"] == "skip":
            log.info("skip %s (%s)", act["src"], act["reason"]); skipped += 1; continue
        if act.get("consequential") and not a.confirm_consequential:
            log.warning("HELD for approval: %s", act); held += 1; continue
        if not a.apply:
            log.info("would %s %s -> %s", act["type"], act["src"], act.get("dest", "")); continue
        try:
            execute(act)
            state["processed"].append(act.get("dest", act["src"]))
            log.info("did %s %s", act["type"], act["src"]); done += 1
        except Exception as e:  # keep going, report at the end
            log.error("failed %s: %s", act, e); failed += 1

    if a.apply:
        state["last_run"] = datetime.now().isoformat(timespec="seconds")
        save_state(root, state)
    log.info("summary: %d done, %d skipped, %d held for approval, %d failed%s",
             done, skipped, held, failed, "" if a.apply else " (dry run — nothing changed)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
