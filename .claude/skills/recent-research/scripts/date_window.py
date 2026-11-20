#!/usr/bin/env python3
"""Print an exact research date window plus search-friendly month terms.

  date_window.py                 last 30 days ending today
  date_window.py --days 7        last 7 days
  date_window.py --since 2026-10-01 [--until 2026-10-31]
  date_window.py --today 2026-11-20   override "today" (for testing)
"""
import argparse
from datetime import date, timedelta


def window(today, days=30, since=None, until=None):
    end = until or today
    start = since or (end - timedelta(days=days))
    if start > end:
        raise SystemExit("start date is after end date")
    months, d = [], date(start.year, start.month, 1)
    while d <= end:
        months.append(d.strftime("%B %Y"))
        d = date(d.year + (d.month == 12), d.month % 12 + 1, 1)
    return start, end, months


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--since", type=date.fromisoformat)
    ap.add_argument("--until", type=date.fromisoformat)
    ap.add_argument("--today", type=date.fromisoformat, default=date.today())
    a = ap.parse_args()
    start, end, months = window(a.today, a.days, a.since, a.until)
    print(f"Window: {start.isoformat()} → {end.isoformat()} ({(end - start).days} days)")
    print("Month terms for queries: " + ", ".join(f'"{m}"' for m in months))
    print(f"Google-style filter: after:{start.isoformat()} before:{(end + timedelta(days=1)).isoformat()}")


if __name__ == "__main__":
    main()
