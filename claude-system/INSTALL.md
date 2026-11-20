# Installation, recommended tools & troubleshooting

_Tool research done 2026-11-20 from the official repos, docs and package registries. Re-check before installing: versions and commands change. **Nothing below has been installed yet.**_

## What's already available (cloud session audit, 2026-11-20)

| Capability | Status |
|---|---|
| Environment | Claude Code 2.1.329 in a cloud container. Each session starts fresh; only what's committed to the repo persists |
| Terminal, filesystem, git | ✅ Yes |
| Node 22, Python 3.13, npm | ✅ Yes |
| Headless browser (Chromium + Playwright) | ✅ Preinstalled, used by `site_check.cjs` |
| Web search and page fetching | ✅ Available, used for the tool research below |
| Network | Unrestricted outbound (Default environment) |
| GitHub | ✅ GitHub MCP, scoped to this repo (`synqsturkfd/synq-studios-site`) |
| Subagents | ✅ Agent tool available, so the `project-team` roles can run as real subagents |
| Built-in skills already enabled | skill-creator, deep-research, docx/pdf/pptx/xlsx, docs, google-workspace, chrome/built-in browser, computer-use, and others (from your claude.ai account) |
| Roblox Studio | ❌ Not reachable from the cloud. Runs on your computer |
| Your computer (Remote Control) | Not attached in this session |
| Payment, database and analytics connectors (Stripe, Supabase, etc.) | ❌ Not connected |

## Recommended tools, in the safest install order

Install one at a time, verify it works, then move to the next. Every tool here is free to install; account-based services are marked.

### 1. Official Anthropic skills marketplace (low risk)
- **What:** Anthropic's own skills and plugins (document skills, frontend-design, skill-creator, code-review, security-guidance, playwright, context7, stripe, supabase…).
- **Why:** These are maintained, vetted extras that complement the custom skills.
- **Source:** github.com/anthropics/skills (Apache-2.0 for the document skills; other skills have their own licenses). The marketplace is `anthropics/claude-plugins-official`.
- **Install:** inside Claude Code: `/plugin marketplace add anthropics/skills`, then `/plugin install document-skills@anthropic-agent-skills`. For official plugins: `/plugin install <name>@claude-plugins-official`.
- **Permissions:** Plugins can include hooks and MCP servers. The install screen lists them, so read it before confirming.
- **Verify:** `/plugin` → Installed tab, or `claude plugin list`.
- Avoid the old `anthropics/claude-code` marketplace (deprecated). The community marketplace is not reviewed by Anthropic.

### 2. Context7: current library documentation (low risk)
- **What:** Gives Claude up-to-date docs for frameworks and libraries, so code doesn't rely on outdated APIs.
- **Source:** github.com/upstash/context7 (MIT). It's a hosted service run by Upstash.
- **Cost:** Free. An optional free API key raises rate limits.
- **Install:** `/plugin marketplace add upstash/context7`, then `/plugin install context7@context7-marketplace`.
- **Permissions:** Network only. Your library questions are sent to context7.com, so don't put secrets in them.
- **Verify:** `/mcp` shows context7 connected. Then ask "use context7 for the latest Astro docs on content collections".

### 3. Playwright MCP: interactive browser control (medium risk)
- **What:** Lets Claude click through sites: fill in booking forms, test flows, take screenshots.
- **Why:** The bundled `site_check.cjs` already handles automated checks. Add this only if you want Claude to explore sites interactively.
- **Source:** github.com/microsoft/playwright-mcp (Apache-2.0). Free.
- **Install:** `claude mcp add playwright npx @playwright/mcp@<pinned-version>`. Pin a version instead of `@latest`, so new code isn't pulled in on every start.
- **Permissions:** Network, a local browser, and file access limited to the workspace.
- **Security:** The README says it is not a security boundary. Don't use `--allow-unrestricted-file-access` or `--host 0.0.0.0`.
- **Verify:** `claude mcp list`, then "open example.com and take a screenshot".

### 4. Site quality CLIs (low risk)
- **Lighthouse** (GoogleChrome/lighthouse, Apache-2.0): performance, SEO and accessibility scores. Run with `npx lighthouse <url> --quiet --chrome-flags="--headless"`. Needs Chrome.
- **axe-core CLI** (dequelabs, MPL-2.0): deeper accessibility rules. Run with `npx @axe-core/cli <url>`.
- No install scripts were found in their npm packages. **Verify:** run each against https://synqstudios815.com.

### 5. Roblox toolchain, on your computer (low risk)
| Tool | Purpose | License | Install |
|---|---|---|---|
| Rojo (rojo-rbx/rojo) | Syncs files between disk and Studio, so code lives in git | MPL-2.0 | via Rokit, or the Studio plugin + VS Code extension |
| Rokit (rojo-rbx/rokit) | Toolchain manager | MIT | ⚠️ The official quick install is `curl … \| bash`. **Prefer** `cargo install rokit --locked && rokit self-install`, or read the script before running it |
| Selene (Kampfkarren/selene) | Luau linter (`std = "roblox"`) | MPL-2.0 | via Rokit |
| StyLua (JohnnyMorganz/StyLua) | Formatter | MPL-2.0 | `cargo install stylua` or via Rokit |
| luau-lsp (JohnnyMorganz/luau-lsp) | Type checking and autocomplete | MIT | VS Code extension, or `luau-lsp analyze` for CI |

- **Aftman is archived** (July 2025), so don't use it.
- **Verify:** `rojo --version`, `selene --version`, `stylua --version`. Then `selene src/` should run on the Luau files from the `roblox-dev` skill.

### 6. Roblox Studio built-in MCP server (high power: review first)
- **What:** Lets Claude Code read and edit your open Roblox place, run Luau, and insert assets.
- **Source:** Built into Roblox Studio (docs: create.roblox.com/docs/studio/mcp). The older `Roblox/studio-rust-mcp-server` repo was **archived in April 2026**.
- **Install:** Studio → Assistant → Manage MCP Servers → enable it → Quick connect → Claude Code. This needs Claude Code running on the **same computer** as Studio, so it won't work from a cloud session.
- **Permissions:** Roblox warns that clients "can read and modify content in your open Roblox places". Keep backups and use a test place.
- **Verify:** a green indicator in Manage MCP Servers. Then ask Claude to list the children of Workspace.

### 7. Account-based services: only when a project needs them (high risk, real money and data)
- **Stripe MCP** (hosted at `https://mcp.stripe.com`, signed in with OAuth): `claude mcp add --transport http stripe https://mcp.stripe.com/`.
  - Use a **sandbox/test account**. The tools can create refunds and subscriptions.
  - The older `@stripe/mcp` and `@stripe/agent-toolkit` packages are deprecated.
  - Stripe reported that from December 2026 its MCP stops accepting full-access secret keys, so use OAuth.
- **Supabase MCP** (hosted, OAuth): `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"`.
  - Always pin `project_ref`, keep `read_only=true`, and point it at a dev project, not production.
- **GitHub MCP:** already connected in cloud sessions. On your computer, use a fine-grained token with `--read-only` and limited toolsets.

### Skip
- The MCP reference servers (filesystem, git, fetch, memory) duplicate Claude Code's built-in tools.
- Archived MCP servers (old GitHub, Puppeteer, Postgres, Slack, etc.).

## Using the skills on your own computer

```bash
git clone <this repo> && cd Synq-Studios-site     # project-level: works immediately inside this repo
# global (all projects):
mkdir -p ~/.claude/skills ~/.claude/agents
cp -r .claude/skills/* ~/.claude/skills/
cp .claude/agents/*.md ~/.claude/agents/
```

In Claude Code, type `/` to see the skills, and `/agents` to see the subagents.

## Troubleshooting

| Problem | Fix |
|---|---|
| A skill doesn't trigger | Call it directly with `/<skill-name>`. Make sure the folder name matches the `name:` line. Run `python3 claude-system/validate_skills.py`. Skills load at session start, so restart the session after adding one |
| `/agents` doesn't list the team | The files must be in `.claude/agents/*.md` with `name:` matching the filename. Restart the session |
| `site_check.cjs` reports "Playwright not found" | On your computer: `npm i -D playwright && npx playwright install chromium`. In cloud sessions it's preinstalled |
| Research skill says it can't browse | Web search isn't enabled in that environment. Turn it on, or paste sources in |
| An MCP server won't connect | Run `claude mcp list` and `/mcp` to see status and errors. For OAuth servers, sign in again from `/mcp`. Check the network allowlist in the cloud environment settings |
| Claude says it can't read `.env` | That's intentional (`.claude/settings.json`). Put the variable names in `.env.example` instead |
| Luau modules error in Studio | They haven't been run in Studio yet, so playtest them and fix. See TESTING.md |
