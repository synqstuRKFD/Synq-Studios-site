#!/usr/bin/env python3
"""Flag generic, AI-sounding phrasing in marketing copy.

  ai_tells.py draft.md [more files]      check files
  cat draft.txt | ai_tells.py            check stdin
  ai_tells.py --strict draft.md          exit 1 if anything is flagged (for CI/hooks)

Heuristic only: a flag is a prompt to rewrite with something specific, not a hard error.
"""
import re
import sys

PHRASES = {
    # cliché verbs / hype
    r"\bdelve\b": "delve", r"\bunleash(es|ed|ing)?\b": "unleash", r"\bunlock(s|ed|ing)? (your|the|new)\b": "unlock your…",
    r"\belevate(s|d)?\b": "elevate", r"\bempower(s|ed|ing)?\b": "empower", r"\brevolutioni[sz]e": "revolutionize",
    r"\bsupercharge": "supercharge", r"\bharness(es|ed|ing)? the power\b": "harness the power",
    r"\bembark\b": "embark", r"\bnavigat(e|ing) the (world|landscape|complexities)\b": "navigate the landscape",
    r"\bgame[- ]chang(er|ing)\b": "game-changer", r"\bcutting[- ]edge\b": "cutting-edge",
    r"\bstate[- ]of[- ]the[- ]art\b": "state-of-the-art", r"\bseamless(ly)?\b": "seamless",
    r"\brobust\b": "robust", r"\bleverag(e|es|ed|ing)\b": "leverage", r"\bsynerg": "synergy",
    r"\bbest[- ]in[- ]class\b": "best-in-class", r"\bworld[- ]class\b": "world-class",
    r"\bnext[- ]level\b": "next-level", r"\btake (it|your \w+) to the next level\b": "to the next level",
    r"\btapestry\b": "tapestry", r"\btestament to\b": "testament to", r"\brealm\b": "realm",
    r"\blook no further\b": "look no further", r"\bin today'?s (fast[- ]paced|digital|ever[- ]changing)": "in today's fast-paced…",
    r"\bever[- ]evolving\b": "ever-evolving", r"\bit'?s (important|worth) (to note|noting)\b": "it's worth noting",
    r"\bwhether you'?re a\b": "whether you're a…", r"\bdive (deep|into)\b": "dive into",
    r"\bboasts?\b": "boasts", r"\bnestled\b": "nestled", r"\bvibrant\b": "vibrant", r"\bbustling\b": "bustling",
    r"\bunparalleled\b": "unparalleled", r"\belevated experience\b": "elevated experience",
    r"\bcrafted with (care|passion)\b": "crafted with passion", r"\bpassionate about\b": "passionate about",
    r"\bone[- ]stop[- ]shop\b": "one-stop shop", r"\bwe'?ve got you covered\b": "we've got you covered",
    r"\bfurthermore\b": "furthermore", r"\bmoreover\b": "moreover", r"\bin conclusion\b": "in conclusion",
    r"\bin the world of\b": "in the world of", r"\bwhen it comes to\b": "when it comes to",
    r"\bnot (just|only) (a|an)? ?\w+[,;]? (it'?s|but)\b": "not just X, it's Y",
    r"\bimagine a world\b": "imagine a world", r"\bthe possibilities are endless\b": "possibilities are endless",
    # Spanish equivalents
    r"\bde vanguardia\b": "de vanguardia", r"\b(al|a otro|a un nuevo) (siguiente )?nivel\b": "al siguiente nivel",
    r"\bsin igual\b": "sin igual", r"\bpotenciar\b": "potenciar", r"\bexperiencia (única|inigualable)\b": "experiencia única",
}


def check(text, name="<stdin>"):
    flags = []
    for i, line in enumerate(text.splitlines(), 1):
        for pat, label in PHRASES.items():
            for m in re.finditer(pat, line, re.IGNORECASE):
                flags.append((i, label, m.group(0)))
        if line.count("—") >= 2:
            flags.append((i, "em-dash overuse", f"{line.count('—')} em dashes"))
        if line.count("!") >= 2:
            flags.append((i, "exclamation overuse", f"{line.count('!')} '!'"))
    # rule-of-three adjective lists: "fast, simple, and powerful"
    for m in re.finditer(r"\b(\w+), (\w+),? and (\w+)\b", text):
        if all(w.lower().endswith(("ful", "ive", "less", "ing", "ous", "able", "ible")) for w in m.groups()):
            line = text[: m.start()].count("\n") + 1
            flags.append((line, "triple-adjective list", m.group(0)))
    sents = [s for s in re.split(r"[.!?]+\s", text) if s.strip()]
    long_sents = [s for s in sents if len(s.split()) > 30]
    print(f"== {name}: {len(flags)} flags, {len(sents)} sentences, {len(long_sents)} over 30 words")
    for line, label, hit in sorted(flags):
        print(f"  line {line}: [{label}] \"{hit}\"")
    return len(flags) + len(long_sents)


def main():
    args = [a for a in sys.argv[1:] if a != "--strict"]
    strict = "--strict" in sys.argv
    total = 0
    if args:
        for p in args:
            with open(p, encoding="utf-8") as f:
                total += check(f.read(), p)
    else:
        total += check(sys.stdin.read())
    if total == 0:
        print("Clean: nothing flagged.")
    sys.exit(1 if (strict and total) else 0)


if __name__ == "__main__":
    main()
