+++
title = "How To: Claude Opus 4.6 1 Million Token Context Running On OpenClaw"
date = 2026-02-06
description = "Step-by-step guide to enabling 1 million token context with Claude Opus 4.6 on a self-hosted OpenClaw gateway. Includes the 10 issues I hit and how to fix each one."
[taxonomies]
tags = ["openclaw", "claude", "debugging", "ai-infrastructure", "self-hosted"]
[extra]
og_image = ""

[extra.nosh]
type = "tutorial"
language = "en"

[extra.nosh.content]
body = "Getting Claude Opus 4.6 with 1 million token context working on a self-hosted OpenClaw gateway requires overcoming 10 separate obstacles. This tutorial documents every wall hit and the exact fix for each one. The final proof cost $9.70 in API fees in thirty minutes."
duration = "1 day (debugging), 30 minutes (if you follow this guide)"
prerequisites = [
    "A self-hosted OpenClaw gateway",
    "Anthropic API key with Tier 4 access (pay-per-token, NOT OAuth/Max subscription)",
    "Node.js v22+ via nvm",
    "pnpm package manager",
    "Linux/macOS with systemd"
]
key_findings = [
    "OAuth tokens (sk-ant-oat) cap at 200K context regardless of tier",
    "API keys (sk-ant-api03) with beta header context-1m-2025-08-07 unlock 1M",
    "pi-ai model registry intentionally reports 200K as the safe default",
    "Header merging with Object.assign() is last-write-wins — include all beta features",
    "Zod schema validation errors in systemd services are invisible without journal monitoring"
]

[[extra.nosh.content.steps]]
title = "Wall 1: Default context hardcoded to 200K"
text = "DEFAULT_CONTEXT_TOKENS in src/agents/defaults.ts is hardcoded to 200,000. Change to 1,000,000 or override in config."

[[extra.nosh.content.steps]]
title = "Wall 2: Config pinned to old model"
text = "Runtime config at ~/.openclaw/openclaw.json may still reference anthropic/claude-opus-4-5. Update to anthropic/claude-opus-4-6."

[[extra.nosh.content.steps]]
title = "Wall 3: Stale pi-ai dependency"
text = "pi-ai@0.51.3 doesn't know Opus 4.6 exists — need 0.52.6+. Fix: pnpm install && pnpm build && pnpm ui:build"

[[extra.nosh.content.steps]]
title = "Wall 4: No git hook for dependency sync"
text = "Create a git post-merge hook that runs pnpm install --frozen-lockfile when pnpm-lock.yaml changes."

[[extra.nosh.content.steps]]
title = "Wall 5: systemd can't find Node"
text = "OpenClaw service assumes ~/.nvm/current/bin (fnm). With nvm the PATH is different. Fix: pre-build UI manually."

[[extra.nosh.content.steps]]
title = "Wall 6: Model registry reports wrong context size"
text = "pi-ai reports Opus 4.6 at 200K intentionally — 1M requires beta header. Override contextWindow to 1000000 in config."

[[extra.nosh.content.steps]]
title = "Wall 7: Custom header kills OAuth auth"
text = "Adding anthropic-beta header overwrites the default via Object.assign(). Must include ALL beta features, especially oauth-2025-04-20."

[[extra.nosh.content.steps]]
title = "Wall 8: pnpm build wipes the UI"
text = "pnpm build wipes dist/ including the control UI. Always run pnpm build && pnpm ui:build together."

[[extra.nosh.content.steps]]
title = "Wall 9: 1M not available on flat-rate billing"
text = "OAuth tokens on Max subscription cap at 200K. 1M requires API key billing with Tier 4 access."

[[extra.nosh.content.steps]]
title = "Wall 10: API key in wrong file causes crash loop"
text = "Credentials go in auth-profiles.json, not openclaw.json. Use 'api_key' (underscore), not 'api-key' (hyphen). Wrong placement causes 17 crash restarts."

[extra.nosh.content.cost_data]
proof_session = "$9.70 in 30 minutes at 210K tokens"
input_rate = "$5 per million tokens"
output_rate = "$25 per million tokens"
warning = "Costs compound per exchange because entire conversation history is re-sent each time"
+++

I wanted to upgrade my self-hosted AI gateway from Claude Opus 4.5 to Opus 4.6 and unlock the 1 million token context window.

It took me an entire day. Ten things broke. The final proof cost me $9.70 in API fees — in thirty minutes.

Here's everything that tried to stop me.

---

## 🚀 Just Want the Working Config?

Skip the war story. **[Jump to the complete step-by-step setup guide →](#the-complete-config-that-works)**

---

### What Broke

1. [Default context hardcoded to 200K](#wall-1-the-default-was-hardcoded)
2. [Config pinned to old model](#wall-2-config-override-stuck-on-the-old-model)
3. [Stale pi-ai dependency](#wall-3-unknown-model-anthropic-claude-opus-4-6)
4. [No git hook for dep sync](#wall-4-stale-deps-prevention-git-hook)
5. [systemd can't find node](#wall-5-systemd-can-t-find-node)
6. [Model registry reports wrong context size](#wall-6-the-model-registry-lies-on-purpose)
7. [Custom header kills OAuth auth](#wall-7-the-header-that-ate-authentication)
8. [Build wipes the UI](#wall-8-build-nukes-the-ui)
9. [1M not available on flat-rate billing](#wall-9-the-long-context-beta-is-not-yet-available-for-this-subscription)
10. [API key in wrong file = 17 crash restarts](#wall-10-the-crash-loop)

<!-- more -->

## The Setup

I run [OpenClaw](https://github.com/openclaw/openclaw), an open-source AI gateway, on a local workstation. It connects Claude to my WhatsApp, manages context windows, handles tool calls — basically turns an LLM into a persistent assistant that lives on my machine.

**My environment:**
- **OS:** Fedora Silverblue 43 (immutable, `rpm-ostree` based)
- **OpenClaw:** Forked from upstream `openclaw/openclaw`, running as a systemd user service
- **Node:** v22.22.0 via nvm
- **Package manager:** pnpm
- **GPU:** NVIDIA (driver 580.119.02)
- **Auth:** Anthropic OAuth token (Max subscription, flat-rate billing)

Anthropic had just released Opus 4.6 with support for 1 million token context. My gateway was running Opus 4.5 at 200K. Simple upgrade, right?

No.

## Wall 1: The Default Was Hardcoded

The first thing I checked was `src/agents/defaults.ts`:

```typescript
export const DEFAULT_CONTEXT_TOKENS = 200_000;
```

Hardcoded. Doesn't matter what the model supports — if no override exists, you get 200K. I changed it to `1_000_000`, committed, and opened [PR #10536](https://github.com/openclaw/openclaw).

**Lesson:** Always grep for hardcoded constants before assuming config drives behavior.

```bash
# Fix: edit src/agents/defaults.ts
sed -i 's/200_000/1_000_000/' src/agents/defaults.ts
git add src/agents/defaults.ts
git commit -m "feat: increase DEFAULT_CONTEXT_TOKENS to 1M for Opus 4.6"
```

## Wall 2: Config Override Stuck on the Old Model

My runtime config at `~/.openclaw/openclaw.json` still had:

```json
"agents": {
  "defaults": {
    "model": {
      "primary": "anthropic/claude-opus-4-5"
    }
  }
}
```

The source code knew about Opus 4.6, but my local config was pinning the old model.

**Lesson:** When debugging model issues, check *both* source code defaults and runtime config files. They can disagree.

```bash
# Fix: update the model in openclaw.json
# Find this line:
#   "primary": "anthropic/claude-opus-4-5"
# Change to:
#   "primary": "anthropic/claude-opus-4-6"
nano ~/.openclaw/openclaw.json

# Restart the gateway
openclaw gateway restart
```

## Wall 3: "Unknown model: anthropic/claude-opus-4-6"

OpenClaw uses [pi-ai](https://github.com/badlogic/pi-mono) as its model abstraction layer. My `node_modules` had `pi-ai@0.51.3` — which didn't know Opus 4.6 existed. The `package.json` specified `0.52.6`, but the lockfile hadn't been synced after a recent pull.

**Lesson:** Stale dependencies are silent killers. Your `package.json` can say one thing while `node_modules` runs another.

```bash
# Fix: sync dependencies and rebuild
cd ~/openclaw
pnpm install
pnpm build
pnpm ui:build  # important — see Wall 8

# Restart
openclaw gateway restart
```

## Wall 4: Stale Deps Prevention (Git Hook)

To prevent Wall 3 from happening again after every `git pull`, I created a post-merge hook:

**Lesson:** Automate the thing that just bit you.

```bash
# Fix: create git-hooks/post-merge
cat > git-hooks/post-merge << 'EOF'
#!/bin/sh
changed_files=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)

if echo "$changed_files" | grep -q "pnpm-lock.yaml"; then
    echo "📦 pnpm-lock.yaml changed — running pnpm install..."
    pnpm install --frozen-lockfile
fi
EOF

chmod +x git-hooks/post-merge

# If your git hooks dir is configured:
git config core.hooksPath git-hooks
```

## Wall 5: systemd Can't Find Node

After `pnpm build`, the control UI failed to build inside systemd:

```
env: 'node': No such file or directory
```

OpenClaw's service environment script (`src/daemon/service-env.ts`, lines 69/78) assumes `~/.nvm/current/bin` exists — that's an fnm convention. I use nvm, which puts node at `~/.nvm/versions/node/v22.22.0/bin/`. systemd doesn't source `.bashrc`, so the nvm PATH setup never runs.

**Lesson:** Self-hosted software and systemd have a PATH disagreement that will bite you. Check your service environment with `systemctl --user show openclaw-gateway.service --property=Environment` or just pre-build manually.

```bash
# Fix: pre-build the UI manually (workaround)
cd ~/openclaw
pnpm ui:build

# Verify it's there:
ls dist/control-ui/index.html

# Restart
openclaw gateway restart
```

## Wall 6: The Model Registry Lies (On Purpose)

Even after all the fixes, my context window still showed 200K. I dug into pi-ai's model catalog:

```javascript
// node_modules/@mariozechner/pi-ai/dist/models.generated.js
{
    id: "claude-opus-4-6",
    contextWindow: 200000,  // ← Not 1M
    // ...
}
```

This is *intentional*. The 1M context window requires a beta header (`anthropic-beta: context-1m-2025-08-07`). Without it, the API hard-rejects anything over 200K. So the model registry reports the *safe default*, not the maximum.

I filed [issue #1329](https://github.com/badlogic/pi-mono/issues/1329) upstream.

**Lesson:** Model catalogs report *default* capabilities, not *maximum* capabilities. The difference matters.

```bash
# Fix: override the context window in openclaw.json
# (see "The Config That Works" section at the end for the full config)
# The key field is:
#   "contextWindow": 1000000
# inside models.providers.anthropic.models[]
```

## Wall 7: The Header That Ate Authentication

Here's where it got ugly.

To send the beta header, I added a custom `models.providers.anthropic` config to `openclaw.json` with the `context-1m-2025-08-07` header. Restarted. Got:

```
401 authentication_error: "OAuth authentication is currently not supported."
```

Wait, what? I'm using OAuth. It was working 5 minutes ago.

After deploying Claude Code's *agent teams* feature (two parallel investigators — one tracing the sync path, one tracing headers), I found the kill chain:

1. Adding `models.providers.anthropic` triggers `ensureOpenClawModelsJson()` in `src/agents/models-config.ts`
2. `normalizeProviders()` in `src/agents/models-config.providers.ts` (line 233-256) sees the provider has `models` but no `apiKey`, so it *injects* the OAuth token as `apiKey`
3. pi-ai's `mergeHeaders()` in `providers/anthropic.js` uses `Object.assign()` — last write wins
4. My custom `anthropic-beta` header **overwrote** the default one
5. The default header included `oauth-2025-04-20` — required for OAuth to work
6. Without it: 401.

**Lesson:** When you override HTTP headers, you're not *adding* — you're *replacing*. If a framework merges headers with last-write-wins, you need to include everything the original had plus your additions.

```bash
# Fix: include ALL required beta features in the custom header
# In your openclaw.json models.providers.anthropic.models[].headers:
#
#   "anthropic-beta": "claude-code-20250219,oauth-2025-04-20,context-1m-2025-08-07,fine-grained-tool-streaming-2025-05-14,interleaved-thinking-2025-05-14"
#
# Missing any one of these will break a different feature.
# The critical ones:
#   oauth-2025-04-20          → required for OAuth auth
#   context-1m-2025-08-07     → required for 1M context
#   claude-code-20250219      → required for tool use
```

## Wall 8: Build Nukes the UI

Every time I ran `pnpm build`, it wiped `dist/` — including the pre-built control UI from Wall 5. I got burned by this three times before I learned.

**Lesson:** Document your build order. `pnpm build && pnpm ui:build` should probably be a single script.

```bash
# Fix: always rebuild UI after building
pnpm build && pnpm ui:build

# Or add a script to package.json:
# "build:all": "pnpm build && pnpm ui:build"
```

## Wall 9: "The long context beta is not yet available for this subscription"

Final boss of the OAuth path. After fixing the header merge, I got:

```
400 invalid_request_error: "The long context beta is not yet available for this subscription"
```

This one isn't a bug. It's a *billing limitation*.

I was authenticated via OAuth using Anthropic's Max subscription (flat-rate plan). The 1M context beta is only available with **API key billing** (pay-per-token, Tier 4).

| Auth Method | Billing | Context Limit | 1M Support |
|-------------|---------|---------------|------------|
| OAuth token (`sk-ant-oat-...`) | Flat rate (Max plan) | 200K | ❌ |
| API key (`sk-ant-api03-...`) | Per token | 1M | ✅ |

**Lesson:** "Supports 1M context" means "supports 1M context *on certain billing tiers*." Read the fine print.

```bash
# Fix: Get an API key from Anthropic
# 1. Go to https://console.anthropic.com/settings/keys
# 2. Create a new API key
# 3. Copy it (starts with sk-ant-api03-)
# 4. You'll need Tier 4 access for 1M context
#
# Don't put it in openclaw.json — see Wall 10.
```

## Wall 10: The Crash Loop

I put the API key directly into `openclaw.json` with `mode: "api-key"` and `apiKey: "sk-ant-api03-..."`. Restarted the gateway.

It crashed. systemd restarted it. It crashed again. And again. **Seventeen times.**

```
journalctl --user -u openclaw-gateway.service | grep -c "Started"
17
```

Two mistakes in one line:

1. **`api-key` vs `api_key`**: The Zod schema validation expects `api_key` (underscore). The hyphenated version silently fails validation and crashes the process.
2. **Wrong file**: API credentials don't go in `openclaw.json`. They go in a separate `auth-profiles.json` file at `~/.openclaw/agents/main/agent/auth-profiles.json`, with `type: "api_key"` and `key: "..."`.

The config file declares *what kind* of auth. The credentials file stores *the actual secret*. Mixing them up doesn't give you a helpful error — it gives you a crash loop.

**Lesson:** Zod validation errors in a systemd service are invisible unless you're watching the journal. And schema field names with underscores vs hyphens will ruin your afternoon.

```bash
# Fix: put the API key in the CORRECT file with the CORRECT field names

# 1. Edit the auth profiles file (NOT openclaw.json):
cat > ~/.openclaw/agents/main/agent/auth-profiles.json << 'EOF'
{
  "anthropic": {
    "default": {
      "type": "api_key",
      "key": "sk-ant-api03-YOUR-KEY-HERE"
    }
  }
}
EOF

# 2. Restart:
openclaw gateway restart

# 3. Verify it's running (not crash-looping):
openclaw gateway status

# If something's wrong, check the journal:
journalctl --user -u openclaw-gateway.service -f
```

## The Proof

It worked. I pushed the conversation to **210,000 tokens** — past the 200K wall that would have stopped me on OAuth. No compaction. No errors. Still coherent.

```
📚 Context: 210k/1.0m (21%) · 🧹 Compactions: 0
```

I also proved it via curl — sending a 250K token prompt directly to the API:

```bash
# This succeeds with the beta header:
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: context-1m-2025-08-07" \
  -H "content-type: application/json" \
  -d '{"model":"claude-opus-4-6","max_tokens":100,"messages":[{"role":"user","content":"...250K tokens..."}]}'
# → 200 OK

# This fails WITHOUT the beta header:
# → 400: "prompt is too long: 250033 tokens > 200000 maximum"
```

Then I checked my Anthropic dashboard.

**$9.70.** In about 30 minutes.

## The Economics

This is the part most people won't tell you about 1M context:

At 210K context on Opus 4.6, every message costs ~$1.05 just for input tokens — because the *entire conversation history* gets re-sent with each exchange. The cost compounds with every turn.

| Metric | OAuth (Flat Rate) | API Key (Per Token) |
|--------|-------------------|---------------------|
| Context limit | 200K | 1M |
| Monthly cost | Fixed (Max plan) | Variable |
| Cost at 100K context | $0 | ~$0.50/message in |
| Cost at 500K context | N/A | ~$2.50/message in |
| Cost at 1M context | N/A | ~$5.00/message in |

1M context is real and it works. But you probably don't want it running all day. Use OAuth for daily chat, switch to API key when you genuinely need to ingest an entire codebase, a full book, or months of system logs in a single session.

## The Complete Config That Works

For anyone running an OpenClaw fork on Fedora (or similar) and wanting 1M context, here's the full process end to end.

### Step 1: Get an Anthropic API Key

Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) and create a new key. You need Tier 4 access for 1M context. Copy the key — it starts with `sk-ant-api03-`.

### Step 2: Store the Key

Create or edit `~/.openclaw/agents/main/agent/auth-profiles.json`:

```json
{
  "anthropic": {
    "default": {
      "type": "api_key",
      "key": "sk-ant-api03-YOUR-KEY-HERE"
    }
  }
}
```

**Do not** put credentials in `openclaw.json`. That file is for config, not secrets.

### Step 3: Add the Model Config

Add this to your `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "providers": {
      "anthropic": {
        "baseUrl": "https://api.anthropic.com",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4.6",
            "reasoning": true,
            "input": ["text", "image"],
            "cost": {
              "input": 5,
              "output": 25,
              "cacheRead": 0.5,
              "cacheWrite": 6.25
            },
            "contextWindow": 1000000,
            "maxTokens": 128000,
            "headers": {
              "anthropic-beta": "claude-code-20250219,oauth-2025-04-20,context-1m-2025-08-07,fine-grained-tool-streaming-2025-05-14,interleaved-thinking-2025-05-14"
            }
          }
        ]
      }
    }
  }
}
```

### Step 4: Rebuild and Restart

```bash
cd ~/openclaw  # or wherever your fork lives
pnpm install
pnpm build
pnpm ui:build
openclaw gateway restart
```

### Step 5: Verify

Check `/status` in your chat or look at the logs:

```bash
openclaw gateway status
```

You should see `Context: Xk/1.0m` in your status output.

## What I Learned

1. **Self-hosted AI is real infrastructure.** It breaks like infrastructure. Config drift, stale deps, header conflicts, billing quirks — this is ops work.

2. **The "1M context" marketing is true but incomplete.** Yes, the model supports it. No, your auth method might not. No, you probably can't afford to run it continuously.

3. **Debugging is the product.** Every wall I hit is a wall someone else will hit. Writing it down is the most useful thing I can do.

4. **Agent teams are underrated.** Using Claude Code's parallel agent feature to investigate the header merge bug cut my debugging time in half. Two agents, two hypotheses, converging on the answer.

5. **The unsexy fix is usually right.** After all that work, my daily driver is still OAuth at 200K. The 1M capability is there when I need it — for codebase analysis, ingesting months of logs, or proving a point for $9.70.

---

*This is the first real post on [bold.casa](https://bold.casa). I'm building in public — AI tooling, self-hosted infrastructure, and whatever else needs taking apart. Follow along via [RSS](/rss.xml) or [Atom](/atom.xml).*
