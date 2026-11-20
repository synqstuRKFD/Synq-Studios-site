---
name: interactive-teaching
description: Turns any topic into an interactive, adaptive lesson — personalized explanations, step-by-step tutorials, quizzes, practice exercises, progress tracking and review sessions, with a working HTML/CSS/JS training page when it helps. Use whenever the user says "teach me", "explain how X works", "quiz me", "I want to learn", "make a tutorial/course/training", "help me study", or wants a learning tool for themselves, their team or their customers.
---

# Interactive Teaching

Teaching works when the learner does something every few minutes and the next step depends on how they did.

## 1. Diagnose (≤3 questions, or a 5-question placement quiz)

Find out: current level, the goal (pass a test, build something, do a job), time available, and preferred format (chat or interactive page). If the user doesn't want questions, assume beginner-to-intermediate and say so.

## 2. Plan

Write a short roadmap: 3–7 modules, each with one concrete learning objective ("you'll be able to …") and a practical exercise. Build on what they already know. Show the plan, then start module 1 right away.

## 3. Teach each module in this loop

1. **Hook** — why this matters for *their* goal (one or two sentences)
2. **Explain** — the smallest complete idea; plain words first, then the term
3. **Show** — a worked example or visual (diagram, table, code, or a live demo in the page)
4. **Try** — the learner does a small task
5. **Check** — 2–4 quiz questions (mix of recall, apply, spot-the-mistake)
6. **Adapt** — right → next idea or a harder variant; wrong → re-explain differently (new analogy, smaller step), then a similar question

Never dump a whole course in one message in chat mode. One module per turn, end with the check.

## 4. Interactive page (when visual/hands-on helps, or the user asks)

Copy `assets/lesson-template.html` and edit only the `LESSON` object at the top of its script:

- `modules[]` with `title`, `body` (HTML string — may contain diagrams, SVG, `<pre>` code), optional `exercise` (`prompt`, `solution` revealed on demand)
- `questions[]` per module: `q`, `choices[]`, `answer` (index), `explain`, `level` 1–3

The template already provides: adaptive question order (level rises on correct answers, drops on wrong), a review queue of missed questions, progress bar, scores saved per lesson in `localStorage` (fails safely when storage is blocked), keyboard-accessible controls, light/dark themes, mobile layout. For topics needing live manipulation (e.g. a pricing slider, CSS flexbox playground, audio EQ), add a small custom demo inside a module's `body` plus a `<script>` at the end of the file.

Verify the page before handing it over: open it with Playwright (or the `quality-loop` site checker) and confirm no console errors and that a quiz answer registers. Say whether you actually ran it.

## 5. Review sessions

When the user returns: quiz them first on previously missed items (spaced review: 1 day, 3 days, 7 days), then continue. Ask them to paste or describe their saved progress if you can't see it.

## Style

Concrete over abstract, their domain's examples (music production, Roblox, small business…) over generic ones, short paragraphs, and honest about uncertainty. Correct mistakes kindly but clearly.
