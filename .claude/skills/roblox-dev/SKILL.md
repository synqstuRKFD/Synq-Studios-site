---
name: roblox-dev
description: Roblox Studio and Luau game development — gameplay systems, player progression, DataStore persistence, multiplayer, gamepasses and developer products with server-side purchase validation, UI, performance, anti-exploit, analytics and ethical retention, plus evaluating game concepts against verifiable demand. Use whenever the user mentions Roblox, Luau, Roblox Studio, Rojo, an obby/tycoon/simulator/RPG on Roblox, or says "create a Roblox game prototype".
---

# Roblox Game Development

Server-authoritative, data-safe, and honest about demand. Never promise player counts or Robux revenue.

## Ground rules

- **The client is hostile.** Anything that grants currency, items, damage, position-critical outcomes or purchases is decided on the server. LocalScripts handle input, UI, effects.
- **Data loss is the worst bug.** Use the `PlayerData` pattern (session locking, `UpdateAsync`, retries, autosave, `BindToClose`) — or a maintained library such as ProfileStore/ProfileService (check its current status first).
- **APIs change.** Before relying on an API detail, limit, or policy (DataStore limits, MemoryStore, AnalyticsService events, paid random items rules, age/content guidelines, revenue share), check create.roblox.com docs and DevForum announcements via `recent-research`. Don't rely on memory.

## Project layout (Rojo-friendly)

```
src/
  server/              -> ServerScriptService
    Main.server.luau
    PurchaseHandler.server.luau
  shared/              -> ReplicatedStorage/Shared
    Config.luau        (product IDs, tuning values)
    Remotes.luau
  serverModules/       -> ServerStorage/Modules
    PlayerData.luau
    RemoteGuard.luau
  client/              -> StarterPlayer/StarterPlayerScripts
    UI.client.luau
```

## Reference implementations (in `references/`)

| File | What it does |
|---|---|
| `PlayerData.luau` | Session-locked DataStore profiles: load with lock + retries, `UpdateAsync` saves that refuse if another server owns the lock, autosave, release on leave, `BindToClose` flush, default-data reconciliation |
| `PurchaseHandler.server.luau` | `ProcessReceipt` for developer products: idempotent via `PurchaseId` stored in the same profile save as the grant; returns `PurchaseGranted` only after a successful save; gamepass ownership checked server-side with caching and `PromptGamePassPurchaseFinished` |
| `RemoteGuard.luau` | Wraps `RemoteEvent` handlers with per-player rate limiting and argument type/range validation |

Copy them into the project and adapt the IDs/values. Status: code-reviewed only — **not yet compiled, linted, or run in Roblox Studio** (see `claude-system/TESTING.md`). Lint them with Selene/luau-lsp and playtest before shipping.

## Systems checklist

- **Progression**: XP/level curve in `Config`, server-computed; rewards granted by server; show next goal in UI.
- **Multiplayer**: server owns state; replicate via attributes/ValueObjects or remotes; handle join-in-progress and leave mid-round.
- **Monetization**: gamepasses (permanent perks), developer products (consumables), Premium payouts, private servers. Price testing via Roblox's tools where available. Paid random items: follow current Roblox policy (odds disclosure etc. — verify).
- **UI**: scale with `UIScale`/`UIAspectRatioConstraint`, test phone/tablet/console in Device Emulator, gamepad support for console.
- **Performance**: StreamingEnabled for large maps; avoid per-frame server loops; pool parts/effects; limit physics parts; profile with MicroProfiler and the Developer Console.
- **Anti-exploit**: validate every remote (types, ranges, cooldowns, distance/line-of-sight sanity), server-side cooldowns, never trust client-sent prices or amounts, log anomalies instead of instantly banning.
- **Analytics**: AnalyticsService funnels/economy/custom events (check current API), plus your own DataStore-free counters; define the 3–5 metrics that matter (D1/D7 retention, session length, conversion) before launch.
- **Retention (ethical)**: daily rewards, clear goals, social features, regular updates. No manipulative mechanics aimed at kids, no misleading purchase prompts.

## Game concept evaluation

When recommending concepts, use only demand evidence you can show: current Roblox charts/Discover sorts, visible concurrent players on comparable experiences (with date seen), DevForum/creator discussion, YouTube/TikTok creator coverage. For each concept: target audience, core loop (30-second / 5-minute / session), comparable experiences (with links and date checked), differentiator, scope for a 2–4 week prototype, monetization fit, risks. Label all player/revenue figures as observed snapshots, never projections.

## Testing

- Syntax/lint: `selene` (std = roblox) and/or `luau-lsp analyze` with Roblox type definitions if installed; `StyLua` for formatting.
- Studio: Play Solo, then **Start Server with 2–3 players** (Test tab) to test replication and purchases; test DataStores in a published place with Studio API access enabled; developer product purchases in Studio are test purchases (no Robux charged).
- Write the manual test steps for the user when you can't run Studio — and say that you didn't.

## Toolchain (optional, see `claude-system/INSTALL.md`)

Rojo (file sync), Rokit (toolchain manager), Selene (lint), StyLua (format), luau-lsp (types), Roblox Studio's built-in MCP server (lets Claude read/edit an open place — powerful; review its permissions first).
