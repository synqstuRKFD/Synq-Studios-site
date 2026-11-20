#!/usr/bin/env python3
"""Validate the Claude skills system structure.

Checks every .claude/skills/*/SKILL.md and .claude/agents/*.md:
- YAML frontmatter present, `name` + `description` set
- skill name: lowercase letters/digits/hyphens, <= 64 chars, matches its folder
- description <= 1024 chars and not trivially short
- files referenced in backticks under the skill (scripts/, references/, assets/) exist
- bundled Python scripts compile; .claude/settings.json is valid JSON
Exit 1 on any error. Standard library only.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors, warnings = [], []


def frontmatter(path: Path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append(f"{path}: missing YAML frontmatter")
        return {}, text
    fields = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            fields[k.strip()] = v.strip()
    return fields, text[m.end():]


def check_skill(d: Path):
    sk = d / "SKILL.md"
    rel = sk.relative_to(ROOT)
    if not sk.exists():
        errors.append(f"{d.relative_to(ROOT)}: no SKILL.md")
        return
    fm, body = frontmatter(sk)
    name, desc = fm.get("name", ""), fm.get("description", "")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", name):
        errors.append(f"{rel}: invalid name '{name}'")
    if name != d.name:
        errors.append(f"{rel}: name '{name}' != folder '{d.name}'")
    if not (50 <= len(desc) <= 1024):
        errors.append(f"{rel}: description length {len(desc)} (want 50-1024)")
    if len(body.splitlines()) > 500:
        warnings.append(f"{rel}: body over 500 lines; move detail into references/")
    for ref in set(re.findall(r"`((?:scripts|references|assets)/[\w./-]+)`", body)):
        if not (d / ref).exists():
            errors.append(f"{rel}: references missing file {ref}")
    for py in d.rglob("*.py"):
        try:
            compile(py.read_text(encoding="utf-8"), str(py), "exec")
        except SyntaxError as e:
            errors.append(f"{py.relative_to(ROOT)}: does not compile: {e}")
    return name


def check_agent(f: Path):
    fm, body = frontmatter(f)
    rel = f.relative_to(ROOT)
    if fm.get("name") != f.stem:
        errors.append(f"{rel}: name '{fm.get('name')}' != file '{f.stem}'")
    if len(fm.get("description", "")) < 50:
        errors.append(f"{rel}: description too short")
    if not body.strip():
        errors.append(f"{rel}: empty system prompt")
    return fm.get("name")


def main():
    skills = sorted(p for p in (ROOT / ".claude/skills").iterdir() if p.is_dir())
    agents = sorted((ROOT / ".claude/agents").glob("*.md"))
    snames = [check_skill(d) for d in skills]
    anames = [check_agent(a) for a in agents]
    settings = ROOT / ".claude/settings.json"
    if settings.exists():
        try:
            json.loads(settings.read_text())
        except json.JSONDecodeError as e:
            errors.append(f".claude/settings.json: invalid JSON: {e}")
    # project-team must have every agent it delegates to
    team = (ROOT / ".claude/skills/project-team/SKILL.md")
    if team.exists():
        for role in ["researcher", "planner", "designer", "developer", "tester", "reviewer", "business-analyst"]:
            if role not in anames:
                errors.append(f"project-team expects agent '{role}' in .claude/agents/")
    print(f"Skills ({len(skills)}): {', '.join(n for n in snames if n)}")
    print(f"Agents ({len(agents)}): {', '.join(n for n in anames if n)}")
    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print("OK — structure valid." if not errors else f"FAILED — {len(errors)} error(s).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
