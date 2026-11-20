#!/usr/bin/env python3
"""Pricing calculator: unit economics, LTV, CAC payback, break-even, and A/B sample size.

Standard library only.

Usage:
  pricing_calc.py analyze CONFIG.json      analyze tiers from a JSON config
  pricing_calc.py analyze --example        print an example config and analyze it
  pricing_calc.py samplesize --baseline 0.04 --mde 0.25 [--alpha 0.05] [--power 0.8]

Config fields (money in one currency):
  currency               e.g. "USD"
  fixed_monthly_costs    rent, software, insurance... per month
  payment_fee_pct        e.g. 0.029 for 2.9%
  payment_fee_fixed      e.g. 0.30 per transaction
  cac                    customer acquisition cost (optional)
  monthly_churn          subscription churn per month, e.g. 0.06 (needed for LTV of subscriptions)
  purchases_per_customer expected lifetime purchases for one_time tiers (default 1)
  tiers: list of
    name, price, billing ("one_time" | "monthly" | "annual"),
    variable_cost          cost to deliver one purchase (one_time) or one billing period
    mix                    expected share of sales, e.g. 0.6 (optional; normalized)
"""
import argparse
import json
import math
import sys
from statistics import NormalDist

EXAMPLE = {
    "_note": "EXAMPLE ONLY - every number here is an [Assumption]; replace with real figures.",
    "currency": "USD",
    "fixed_monthly_costs": 2500,
    "payment_fee_pct": 0.029,
    "payment_fee_fixed": 0.30,
    "cac": 40,
    "monthly_churn": 0.08,
    "purchases_per_customer": 2,
    "tiers": [
        {"name": "Basic (2h session)", "price": 90, "billing": "one_time", "variable_cost": 25, "mix": 0.5},
        {"name": "Standard (4h + mix)", "price": 220, "billing": "one_time", "variable_cost": 60, "mix": 0.35},
        {"name": "Premium (8h + mix + master)", "price": 450, "billing": "one_time", "variable_cost": 120, "mix": 0.15},
        {"name": "Artist membership", "price": 149, "billing": "monthly", "variable_cost": 45, "mix": 0},
    ],
}


def fmt(x, cur=""):
    if x is None:
        return "n/a"
    if isinstance(x, float) and math.isinf(x):
        return "∞"
    return f"{cur}{x:,.2f}"


def analyze(cfg):
    cur = {"USD": "$", "EUR": "€", "GBP": "£", "MXN": "MX$"}.get(cfg.get("currency", "USD"), "")
    fee_pct = float(cfg.get("payment_fee_pct", 0))
    fee_fixed = float(cfg.get("payment_fee_fixed", 0))
    fixed = float(cfg.get("fixed_monthly_costs", 0))
    cac = cfg.get("cac")
    churn = cfg.get("monthly_churn")
    ppc = float(cfg.get("purchases_per_customer", 1))
    tiers = cfg.get("tiers", [])
    if not tiers:
        raise SystemExit("config has no tiers")

    rows, warnings = [], []
    for t in tiers:
        price = float(t["price"])
        vc = float(t.get("variable_cost", 0))
        billing = t.get("billing", "one_time")
        fees = price * fee_pct + fee_fixed
        margin = price - vc - fees
        margin_pct = margin / price if price else 0
        if margin <= 0:
            warnings.append(f"'{t['name']}' loses money on every sale ({fmt(margin, cur)}).")
        # Lifetime value (gross margin based)
        if billing == "monthly":
            ltv = margin / churn if churn else None
            monthly_margin = margin
        elif billing == "annual":
            annual_churn = 1 - (1 - churn) ** 12 if churn else None
            ltv = margin / annual_churn if annual_churn else None
            monthly_margin = margin / 12
        else:
            ltv = margin * ppc
            monthly_margin = None
        ltv_cac = (ltv / cac) if (ltv is not None and cac) else None
        if billing == "one_time":
            payback = "first sale" if (cac is not None and margin >= cac) else (
                f"{math.ceil(cac / margin)} purchases" if (cac and margin > 0) else "n/a")
        else:
            payback = f"{cac / monthly_margin:.1f} months" if (cac and monthly_margin and monthly_margin > 0) else "n/a"
        if ltv_cac is not None and ltv_cac < 3:
            warnings.append(f"'{t['name']}' LTV:CAC is {ltv_cac:.1f} (common rule of thumb is ≥3).")
        rows.append({
            "name": t["name"], "billing": billing, "price": price, "variable_cost": vc, "fees": fees,
            "margin": margin, "margin_pct": margin_pct, "ltv": ltv, "ltv_cac": ltv_cac, "payback": payback,
            "mix": float(t.get("mix", 0)),
        })

    print(f"## Unit economics ({cfg.get('currency', 'USD')})\n")
    print("| Tier | Billing | Price | Var. cost | Pay. fees | Margin | Margin % | LTV | LTV:CAC | CAC payback |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        print(f"| {r['name']} | {r['billing']} | {fmt(r['price'], cur)} | {fmt(r['variable_cost'], cur)} | "
              f"{fmt(r['fees'], cur)} | {fmt(r['margin'], cur)} | {r['margin_pct']*100:.1f}% | {fmt(r['ltv'], cur)} | "
              f"{'n/a' if r['ltv_cac'] is None else f'{r['ltv_cac']:.1f}'} | {r['payback']} |")

    mixed = [r for r in rows if r["mix"] > 0]
    if mixed:
        total = sum(r["mix"] for r in mixed)
        avg_price = sum(r["price"] * r["mix"] for r in mixed) / total
        avg_margin = sum(r["margin"] * r["mix"] for r in mixed) / total
        print(f"\n**Blended (by mix, {len(mixed)} tiers):** avg price {fmt(avg_price, cur)}, "
              f"avg margin {fmt(avg_margin, cur)} ({avg_margin / avg_price * 100:.1f}%)")
        if fixed and avg_margin > 0:
            be = math.ceil(fixed / avg_margin)
            print(f"**Break-even:** {be} sales/month to cover {fmt(fixed, cur)} fixed costs "
                  f"(= {fmt(fixed, cur)} ÷ {fmt(avg_margin, cur)})")
            if cac:
                be_cac = avg_margin - cac / ppc
                if be_cac > 0:
                    print(f"**Break-even incl. CAC** (CAC spread over {ppc:g} purchases): "
                          f"{math.ceil(fixed / be_cac)} sales/month")
                else:
                    print("**Break-even incl. CAC:** not reachable — CAC exceeds margin per purchase.")
    if warnings:
        print("\n**Warnings**")
        for w in warnings:
            print(f"- {w}")
    print("\n_All results inherit the labels of their inputs ([Provided]/[Estimate]/[Assumption])._")


def samplesize(baseline, mde, alpha=0.05, power=0.8):
    """Visitors per variant for a two-sided two-proportion z-test. mde is relative lift (0.2 = +20%)."""
    if not (0 < baseline < 1):
        raise SystemExit("--baseline must be between 0 and 1 (e.g. 0.04 for 4%)")
    p1 = baseline
    p2 = baseline * (1 + mde)
    if not (0 < p2 < 1):
        raise SystemExit("baseline × (1 + mde) must stay between 0 and 1")
    z_a = NormalDist().inv_cdf(1 - alpha / 2)
    z_b = NormalDist().inv_cdf(power)
    p_bar = (p1 + p2) / 2
    n = ((z_a * math.sqrt(2 * p_bar * (1 - p_bar)) + z_b * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / (p2 - p1) ** 2
    n = math.ceil(n)
    print(f"Baseline {p1:.2%} → target {p2:.2%} (relative lift {mde:+.0%}), alpha {alpha}, power {power}")
    print(f"Needed: {n:,} visitors per variant ({2 * n:,} total for A/B).")
    print("If your traffic can't reach this in ~4 weeks, treat the test as directional only.")
    return n


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("analyze")
    a.add_argument("config", nargs="?")
    a.add_argument("--example", action="store_true")
    s = sub.add_parser("samplesize")
    s.add_argument("--baseline", type=float, required=True)
    s.add_argument("--mde", type=float, required=True, help="relative lift to detect, e.g. 0.2")
    s.add_argument("--alpha", type=float, default=0.05)
    s.add_argument("--power", type=float, default=0.8)
    args = ap.parse_args(argv)
    if args.cmd == "analyze":
        if args.example:
            print("```json\n" + json.dumps(EXAMPLE, indent=2) + "\n```\n")
            analyze(EXAMPLE)
        elif args.config:
            with open(args.config) as f:
                analyze(json.load(f))
        else:
            ap.error("give a config path or --example")
    else:
        samplesize(args.baseline, args.mde, args.alpha, args.power)


if __name__ == "__main__":
    main(sys.argv[1:])
