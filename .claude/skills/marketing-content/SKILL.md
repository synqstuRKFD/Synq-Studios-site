---
name: marketing-content
description: Marketing strategy and content creation in a natural, human voice — ad concepts, social media plans and calendars, video/TikTok/Reels scripts, sales copy, website and landing-page copy, campaigns, promotions and SEO recommendations. Use whenever the user wants to write, rewrite or plan anything that promotes a business, product, game or service, including bilingual (English/Spanish) content.
---

# Marketing & Content

Specific beats clever. Write like a person who knows the customer, not like a brochure.

## Before writing

Get (or assume and label): who it's for, the one thing they should do next (book, buy, follow, sign up), the offer and price, proof you actually have (real reviews, client names with permission, numbers), the channel, and the brand voice. Reuse positioning from `business-intel` work if it exists.

## Voice rules

- Lead with the customer's situation or outcome, not the company.
- Concrete details over adjectives: "mixing in a treated room with Yamaha HS8s" beats "state-of-the-art facility".
- Short sentences. Contractions. Talk like the audience talks (including Spanglish if that's the audience — ask).
- One idea per post/ad; one call to action.
- Cut filler and AI tells. Run the checker on every draft:
  `python3 .claude/skills/marketing-content/scripts/ai_tells.py draft.md` (or pipe text in). Fix everything it flags unless there's a reason.
- Spanish copy: write it natively for the audience (regional vocabulary), don't translate word-for-word.

## Honesty rules

No invented testimonials, reviews, stats, awards, client logos, or "as seen on". No fake urgency. Paid partnerships/affiliates disclosed (#ad / "paid partnership"). Before/after or results claims must be typical or labeled. Respect platform ad policies (verify current ones for the platform).

## Formats

**Ad concept** — Angle · Hook (first 2 seconds / first line) · Body · Visual direction · CTA · Audience/targeting idea · What it tests.

**Social plan / calendar** — table: Date · Platform · Format (Reel, carousel, story, post, Short) · Hook · Content outline · CTA · Asset needed · Status. Mix: ~40% value/education, ~30% behind-the-scenes/people, ~20% proof/results, ~10% direct offer — adjust to what performs.

**Video script** — table: Time · Shot/visual · On-screen text · Voiceover/dialogue · Sound. Hook in the first 1–2 seconds; payoff before 15–30s for short-form; captions always.

**Landing page** — Hero (outcome headline, subhead, primary CTA, proof element) → Problem → Offer/what you get → How it works (3 steps) → Proof (real) → Pricing/packages → FAQ (real objections) → Final CTA. Provide copy + notes for design.

**Sales email/DM** — subject/opener under 8 words, personal first line, one ask.

**Campaign** — goal + metric, audience, offer, channels, timeline, budget split [Estimate], creative list, tracking (UTMs, conversion events), review date.

## SEO

- Start from search intent, not keywords: what would the customer type when they need this? Group by intent (local "recording studio near me / Rockford", service, price, how-to).
- Don't invent search volumes. Use Google Search Console data if the user has it; otherwise Google autocomplete/"People also ask"/Trends (relative only) and label as qualitative.
- On-page: unique title (≈50–60 chars) and meta description (≈140–160), one H1, descriptive headings, internal links, alt text, fast images, `LocalBusiness` structured data, matching name/address/phone everywhere.
- Local: Google Business Profile completeness, categories, photos, review requests (asking is fine; incentivizing reviews usually isn't — check the platform's policy).
- Content: pages that answer real questions customers ask (pricing, what to bring, how long a song takes).

Deliver copy ready to paste, plus 2–3 alternative hooks/headlines for testing.
