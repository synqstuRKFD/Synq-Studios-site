---
name: business-intel
description: Business research and opportunity analysis. Use whenever the user wants to research a business idea or market, analyze competitors, find underserved customers, build personas, compare business or pricing models, design service packages or subscriptions, pick marketing channels, estimate startup costs or profitability, or find what to automate in a business — even if they just say "is this a good idea", "research profitable app ideas", or "analyze my competitors".
---

# Business Intelligence

Turn a business question into a sourced, decision-ready assessment. The output is only as good as its evidence, so every number carries a label.

## Evidence labels (mandatory on every figure)

| Label | Meaning |
|---|---|
| **[Verified]** | From a cited source you actually opened this session (give URL + date) |
| **[Provided]** | The user gave it |
| **[Quoted]** | A real price/quote from a vendor page (URL) |
| **[Estimate]** | Your reasoned estimate — show the arithmetic |
| **[Assumption]** | An input you chose because nothing better exists — say why |

Never invent market sizes, growth rates, conversion rates, or survey results. If you don't have a number, write "unknown — how to find out: …". Never promise revenue; give scenario ranges driven by stated assumptions.

## Workflow

1. **Frame** — Confirm (or state assumptions for): location/market, budget, time available, the user's skills and assets, risk tolerance, and what "success" means. Don't block on this; one short question round max, then proceed with labeled assumptions.
2. **Research** — If web search is available, search. For anything time-sensitive (tool prices, platform rules, trends) follow the `recent-research` skill's dating rules. Prefer primary sources: competitor sites and price pages, official statistics, platform docs, reviews (Google/Yelp/Reddit/G2) for real customer complaints. If search is unavailable, say so and mark the research section as "from general knowledge — verify".
3. **Analyze** using the sections in `references/report-template.md`. Work in this order: problems → customers → competitors → gaps → offer → pricing → channels → costs → risks → feasibility.
4. **Recommend** one primary path plus the cheapest validation test that could kill or confirm it within ~2 weeks.
5. **Hand off** where useful: pricing details → `pricing-psychology`; copy/campaigns → `marketing-content`; building → `fullstack-builder` or `project-team`; ops automation → `automation-engineer`.

## Method notes

- **Customer problems**: mine real complaints (1-star competitor reviews, forum threads, support questions). Quote them with links. A problem is strong if it is frequent, painful, and people already pay to work around it.
- **Underserved groups**: look for segments competitors ignore — language (e.g. Spanish-speaking customers), price band, location, schedule, skill level, niche use-case. State the evidence that they're underserved.
- **Competitor table**: name, URL, offer, price (with [Quoted] link), positioning, strengths, weaknesses, reviews signal. Minimum 3 competitors when they exist; say if you found fewer.
- **Personas**: label them *hypothetical* unless built from real interviews/data. Include job-to-be-done, trigger moment, objections, where they spend attention, what they pay today.
- **Packages/subscriptions**: 3 tiers max to start; each tier has a clear "who it's for". Subscriptions only when the value recurs.
- **Profitability**: unit economics first (price − variable cost − payment fees), then fixed costs, then break-even volume. Use `../pricing-psychology/scripts/pricing_calc.py` for the math instead of mental arithmetic.
- **Automation opportunities**: list daily/weekly manual tasks (booking confirmations, invoicing, follow-ups, social posting, reporting) with the tool that could handle each and estimated hours saved [Estimate].

## Feasibility scorecard

Score 1–5 with a one-line reason each: problem severity, evidence of demand, competition intensity (5 = weak competition), startup cost (5 = cheap), time to first revenue, fit with user's skills/assets, operational complexity (5 = simple), regulatory/legal risk (5 = low). Report the total but lead with the weakest scores — those are the risks.

## Output

Use `references/report-template.md`. Keep the executive summary to ≤8 lines. End with a **Sources** list (URL + date accessed) and an **Open questions** list.
