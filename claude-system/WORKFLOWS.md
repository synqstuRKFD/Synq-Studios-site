# Workflows & prompt templates

Type these as normal requests. The matching skills load automatically. To force a skill, start with `/<skill-name>`. Fill in the `<…>` parts; anything you leave out will be assumed, and the assumption will be labeled.

---

## "Build me a complete website."
**Runs:** project-team → (researcher ∥ business-analyst) → planner → designer → developer → tester → reviewer, using fullstack-builder and quality-loop.
**You get:** `project-notes/<slug>/` with research, spec, design, test report, review, business notes; working code; run instructions; open issues.
**Approval points:** the spec, before a big build. Any deploy, domain purchase, or live payment setup.

```
Build me a complete website for <business>. Audience: <who>. Goal: <bookings / sales / leads>.
Must have: <pages/features>. Languages: <EN/ES>. Budget for hosting/tools: <$>/month.
Existing assets: <logo, photos, copy, current site URL>. Deadline: <date>.
```

## "Research profitable app ideas."
**Runs:** business-intel + recent-research.
**You get:** 3–5 ideas, each with evidence of demand (sources with dates), competitors, startup costs, risks, feasibility score, and the cheapest validation test.

```
Research profitable <app / online business / service> ideas for someone with <skills>, <hours/week>,
and <$ budget>, targeting <market/location>. Only use sources from the last <N> months for trends.
Rank by feasibility for me, not by hype.
```

## "Create a Roblox game prototype."
**Runs:** roblox-dev (+ project-team for a full build) + recent-research for current demand and platform rules.
**You get:** a concept evaluation (with comparable experiences and the dates they were checked), core loop, a Rojo-ready file structure, server-authoritative scripts, a monetization plan, and Studio test steps.

```
Create a Roblox game prototype: <genre/idea>. Target players: <age/audience>. Scope: <2-week prototype>.
Monetization: <gamepasses / dev products / none yet>. I use <Studio only / Rojo + VS Code>.
```

## "Analyze my competitors."
**Runs:** business-intel (competitor table, gaps, positioning) → optionally pricing-psychology and marketing-content.

```
Analyze my competitors for <business> in <area>. Known competitors: <names/URLs or "find them">.
My prices: <list>. What I do differently: <…>. I want: positioning gaps, price comparison, quick wins.
```

## "Improve my pricing."
**Runs:** pricing-psychology (and the calculator script).
**You get:** current economics, at least three strategies with calculated margins and break-even, a recommendation, ethical experiments with sample sizes, and copy changes.

```
Improve my pricing. Offer: <services/products + current prices>. Costs per sale: <labor/materials/fees>.
Fixed monthly costs: <$>. Sales per month: <n>. Capacity: <hours/week>. Customer acquisition: <how/cost>.
```

## "Research trends from the last 30 days."
**Runs:** recent-research.
**You get:** the exact date window, dated and sourced findings marked Verified, Reported, Signal or Inference, then what it means for you and actions.

```
Research <topic> trends from the last 30 days. Focus on <angle>. I care about <decision this informs>.
```

## "Review and fix my project."
**Runs:** quality-loop (+ reviewer agent).
**You get:** commands that were actually run and their output; blockers fixed and verified; an entry in `QUALITY-LOG.md` listing unresolved issues.

```
Review and fix <path / the whole repo>. Priorities: <bugs / mobile layout / speed / security / SEO>.
Don't change: <anything off-limits>. Deploying needs my OK.
```

---

## More templates

**Teach me**
```
Teach me <topic>. I'm <level>; goal: <what I want to be able to do>. <N> minutes a day.
Make it an interactive page / keep it in chat.
```

**Automate a task**
```
Automate <task>. Today I do it by <steps>, <how often>, taking <time>. Inputs: <files/apps>.
Output should be <…>. Anything that sends, posts, deletes or spends must wait for my approval.
```

**Marketing content**
```
Write <a 2-week Instagram/TikTok plan / 3 ad concepts / a landing page / a 30-second video script>
for <offer> aimed at <audience>, in <EN/ES/both>. Voice: <casual/premium/...>. Real proof I have: <reviews, numbers>.
```

**Combined: launch an offer**
```
I want to launch <offer>. Research the competition, set pricing with 3 options, write the landing
page and a 2-week social plan, build the page on the site, and test it. Ask me before publishing.
```
