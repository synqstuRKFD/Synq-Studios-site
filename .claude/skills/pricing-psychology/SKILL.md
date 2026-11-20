---
name: pricing-psychology
description: Pricing strategy, psychological pricing and conversion optimization. Use whenever the user asks what to charge, wants to improve or raise prices, design tiers/packages/bundles/subscriptions, add upsells or cross-sells, plan discounts, reduce churn, improve conversions, or check margins, CAC, LTV or break-even — including short asks like "improve my pricing" or "is $X too cheap".
---

# Psychological Pricing & Conversions

Produce at least three priced strategies with real math, then ethical experiments to choose between them with real customers.

## Inputs to collect (use labeled assumptions for gaps, don't stall)

- Product/service, who buys it, and what they use today instead
- Current price(s) and sales volume, if any [Provided]
- Variable cost per sale/session/unit (materials, labor hours × rate, software per seat, payment fees)
- Fixed monthly costs (rent, software, insurance)
- Customer acquisition cost, or ad spend ÷ new customers
- For subscriptions: monthly churn
- Capacity limits (hours per week, inventory) — capacity changes the best strategy

Label every number **[Provided] / [Quoted] / [Estimate] / [Assumption]**.

## Calculator (always use it — no mental math)

`scripts/pricing_calc.py` computes per-tier margin, LTV, LTV:CAC, CAC payback, blended margin and break-even. It also sizes A/B tests.

```bash
python3 .claude/skills/pricing-psychology/scripts/pricing_calc.py analyze config.json
python3 .claude/skills/pricing-psychology/scripts/pricing_calc.py analyze --example   # see the config format
python3 .claude/skills/pricing-psychology/scripts/pricing_calc.py samplesize --baseline 0.04 --mde 0.25
```

Write the user's numbers into a JSON config (same shape as `--example`), run it, and paste the table into the answer.

## Strategy toolkit (pick ≥3 that fit; explain why each fits)

- **Good / Better / Best tiers** — the top tier anchors; the middle is the one you want most people to pick. 3 tiers usually beats 2 or 5.
- **Anchoring** — show the premium option or the cost of the alternative (hiring an engineer, DIY time) first. The anchor must be a real, purchasable option.
- **Decoy** — a tier positioned so the target tier looks clearly better. Must still be a real offer someone could reasonably want and that you will deliver.
- **Bundling** — combine items customers already buy together; price below the sum but above the cost of delivering it.
- **Subscription / membership** — only when value recurs. Offer annual at roughly 2 months free; keep cancellation as easy as sign-up.
- **Value-based** — price from the customer's outcome (e.g. what a finished, release-ready song is worth to an artist), not from your cost.
- **Packages vs. hourly** — fixed packages reduce buyer anxiety and reward your efficiency.
- **Upsell / cross-sell** — offered at the moment of relevance (e.g. mixing after recording), one offer at a time.
- **Charm vs. round prices** — .99/.97 endings signal "deal"; round numbers signal premium/quality. Match the brand.
- **Discounts** — prefer conditional ones (prepay, off-peak, bundle, referral) over blanket % off; set an end date and honor it.
- **Retention** — onboarding, check-ins, loyalty credits, pause-instead-of-cancel.

## Ethics (hard rules)

No fake scarcity or fake countdown timers, no fake "was" prices, no hidden/drip fees revealed at checkout, no pre-checked add-ons, no hard-to-cancel subscriptions, no different prices based on protected traits. Disclose total price up front. If a tactic only works by misleading, drop it.

## Experiments

For each experiment specify: hypothesis, variant(s), primary metric (conversion, revenue per visitor, or margin per customer — not just clicks), guardrail metric (refunds, complaints, churn), sample size from `samplesize`, duration (≥1 full business cycle, usually 2+ weeks), and decision rule written **before** the test. Low-traffic businesses: use sequential price tests (change price for new customers for a period) or ask-based tests (offer tiers in quotes) and say the result is directional, not statistically significant.

## Output format

1. Current economics (table from the calculator, or "unknown" items)
2. Strategy A / B / C — price points, rationale, psychology used, calculator table, risks
3. Recommendation and why
4. Experiments (table)
5. Page/offer copy changes (hand to `marketing-content` for full copy)
6. Assumptions list
