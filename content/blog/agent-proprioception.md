+++
title = "Agent Proprioception: How Declarative Files Build the Self-Model"
date = 2026-02-26
description = "How agents build identity, continuity, and self-awareness through declarative files. The boot sequence, the compaction problem, file taxonomy, and why the files are the firmware."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "identity", "memory"]
[extra]
og_image = "/blog/agent-proprioception/01-layers.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "Deep dive into agent self-models built from declarative files. Covers the proprioception metaphor, boot sequence design, the compaction problem, file taxonomy by mutability and temporal scope, and practical patterns for agent identity and continuity."
key_findings = [
    "Agent identity lives in files, not weights. The context window is RAM; the files are firmware.",
    "The boot sequence (soul → identity → user → workflow → memory) assembles the self-model from scratch each session",
    "Compaction destroys context but files survive, making declarative self-models the only reliable continuity mechanism",
    "Three file categories: stable (human-authored identity), evolving (agent-maintained knowledge), ephemeral (state snapshots)",
    "Mixing temporal scopes across files creates coherence failures"
]
+++

*Design in the Agentic Era, Part 4*

Proprioception is the sense that tells you where your body is in space without looking. Close your eyes, touch your nose. You can do it because your nervous system maintains a continuous model of your body's position, orientation, and state. Without proprioception, every movement would require visual confirmation. You'd be functional but clumsy, constantly checking.

AI agents have a proprioception problem. A language model wakes up in a fresh context window with no sense of who it is, who it's helping, what it was doing, or what it knows. It's a brain in a jar. Functional, but disconnected from everything that would make it useful in context.

The solution isn't in the model weights. It's in the files.

<!-- more -->

<img src="/blog/agent-proprioception/01-layers.png" alt="Concentric rings showing agent design surfaces from identity at the core through declarative knowledge, procedural logic, execution, and distribution, with a proprioception mapping showing five key questions each file layer answers" style="width:100%;border-radius:10px;margin:1.5rem 0;">

## The Self-Model Problem

When you talk to a vanilla language model, you're talking to a statistical pattern matcher with no persistent identity. It has no name unless you give it one. No memory of yesterday. No understanding of your preferences. No awareness of what it was doing five minutes ago if the context window resets.

This is fine for one-shot queries. It's catastrophic for agents that operate continuously, maintain relationships with specific humans, and need to resume work across session boundaries.

The fix is declarative files that the agent reads at boot time to reconstruct its self-model. Not fine-tuning. Not system prompts alone (though those help). Files on disk that the agent can read, update, and rely on as the ground truth of who it is.

This matters because context windows are temporary. They fill up. They get compacted. The session ends. But files survive. An agent that stores its identity, knowledge, and state in files can wake up fresh and reassemble itself in seconds. An agent that relies only on conversation history loses everything when that history is summarized or truncated.

## The Boot Sequence

<img src="/blog/agent-proprioception/02-boot-sequence.png" alt="Timeline showing six boot steps from Wake (no identity) through Soul, Identity, User, Workflow, and Memory files, ending at Ready state, with a comparison of agents with and without proprioception below" style="width:100%;border-radius:10px;margin:1.5rem 0;">

Every session, the agent wakes up blank and reads a sequence of files to build its self-model. The order matters:

**1. Soul.** Values, voice, tone, boundaries. "Be genuinely helpful, not performatively helpful. Have opinions. Be resourceful before asking." This is the deepest layer: it shapes *how* the agent approaches everything else.

**2. Identity.** Name, persona, creature type, vibe. This seems cosmetic but it's not. An agent with a name and a defined personality produces more consistent, more characterful output than one operating as "AI Assistant." Identity creates coherence across interactions.

**3. User context.** Who is this agent helping? What are their preferences, constraints, communication style? This is the relationship definition. It shapes every response, every decision about what to prioritize, every judgment about when to push back vs. accommodate.

**4. Workflow state.** What was this agent doing before the session boundary? A compact handoff document (under 500 tokens) that answers three questions: who am I, where am I, what was I working on. Written by the pre-compaction self for the post-compaction self. A shift change report.

**5. Memory.** Long-term curated knowledge (what's worth keeping forever) plus recent daily logs (what happened recently). The agent reads today's and yesterday's logs for immediate context, plus a curated memory file for durable knowledge.

**6. Ready.** The agent now has a self-model. It knows who it is, who it's helping, what it knows, and what it was doing. It can resume work without asking the human to repeat themselves.

The entire boot sequence takes a few thousand tokens. That's the cost of proprioception: a small fixed budget at the start of every session that buys coherent, contextual behavior for the entire interaction.

## The Compaction Problem

Context windows have finite capacity. When a long conversation fills the window, something has to give. The system compacts: it summarizes the conversation history, discarding detail to make room for new interaction.

Compaction is the agent equivalent of amnesia. Everything in the conversation context, including identity signals established through interaction, gets compressed into a summary that may or may not preserve the important bits.

Without declarative files, compaction is devastating. The agent loses its personality. It loses the thread of what it was working on. It reverts to generic behavior. The human has to re-establish context from scratch.

With declarative files, compaction is a minor disruption. The files survive. The boot sequence runs. The self-model reassembles. The agent picks up where it left off, maybe missing some conversational nuance but retaining everything structural: identity, knowledge, active task state.

This is why the workflow handoff document matters so much. When context is about to compact, the agent writes a quick state snapshot. Post-compaction, it reads that snapshot and resumes. The human might not even notice the boundary.

**The design principle:** Anything that must survive compaction belongs in a file, not in conversation history. Conversation is volatile. Files are durable.

## File Taxonomy

<img src="/blog/agent-proprioception/03-file-taxonomy.png" alt="Three-row taxonomy of declarative files organized by mutability (human-authored stable, agent-maintained evolving, ephemeral auto-overwritten) with temporal scope mapping on the right" style="width:100%;border-radius:10px;margin:1.5rem 0;">

Not all declarative files are equal. They differ on three dimensions:

### By Mutability

**Human-authored, stable.** Soul, identity, user context, operating protocols. The human writes these. The agent reads them. The agent might suggest changes but shouldn't modify them unilaterally. These files define the agent's operating parameters the way a constitution defines a government's. Changing them is a deliberate act.

**Agent-maintained, evolving.** Long-term memory, tool notes, proactive task checklists. The agent updates these as it learns. The human reviews them occasionally. These are the agent's growing knowledge base, curated from experience.

**Ephemeral, auto-overwritten.** Workflow state, daily logs, timestamp trackers. The agent overwrites these each cycle. They're state snapshots, not history. Nobody expects them to be preserved.

### By Temporal Scope

**Permanent.** Soul and identity files survive everything. They define the agent across all contexts, all sessions, all compaction events. Change them only when the agent's fundamental character needs to change.

**Long-lived.** User context, curated memory, tool notes. These evolve over weeks and months. The agent consolidates daily experience into durable knowledge. Old entries get pruned or updated as context shifts.

**Session-scoped.** Workflow state and daily logs. These capture what's happening right now. They get overwritten next session. Their value is immediate, not archival.

**Query-triggered.** Some knowledge doesn't load at boot. It lives in a memory system (vector database, graph store) and gets retrieved on demand when relevant. This is the agent's long-term recall: not always present, but available when needed.

### The Separation Principle

Each file should have one temporal scope and one mutability level. Mixing them creates problems.

If you put active task state in the curated memory file, the memory file gets polluted with ephemeral details that don't belong there. If you put identity information in the workflow file, it gets overwritten every session. If you let the agent modify soul files without review, identity drifts unnoticed.

**Stable files define who you are. Evolving files track what you know. Ephemeral files capture what you're doing.** Keep them separate.

## Design Patterns

### The Handoff Protocol

Before compaction (or at any natural break point), the agent writes a concise handoff document: who am I, where am I, what was I working on. Target: under 500 tokens. This is a shift change report, not a journal entry.

The handoff protocol turns compaction from a catastrophic event into a routine boundary. The pre-compaction self leaves a note for the post-compaction self. Continuity is maintained through the file, not through the context window.

### Memory Consolidation

Daily log files accumulate raw experience. Periodically, the agent reviews recent logs and distills durable insights into the long-term memory file. What happened today? What's worth remembering next month? What lessons apply broadly?

This mirrors how human memory works: short-term experience consolidates into long-term knowledge during sleep. For agents, the consolidation happens during heartbeat cycles or dedicated maintenance windows.

### The Bootstrap File

When an agent is first created, it needs a one-time setup document: who are you, what's your purpose, what should you do first. The agent reads this file, follows its instructions, sets up its workspace, and then deletes it. A birth certificate that self-destructs after use.

### Security Boundaries

Some files contain sensitive context (personal information, relationship details, private knowledge). These should load only in appropriate contexts. An agent operating in a public group chat shouldn't load its human's private memory file. The boot sequence needs conditional logic: *if* private context, *then* load personal files. Otherwise, operate with the public subset of the self-model.

## The Firmware Metaphor

The most useful way to think about declarative files: **the files are the firmware. The context window is just RAM.**

RAM is fast but volatile. It's where active computation happens. When power cycles (compaction), everything in RAM is lost.

Firmware persists across power cycles. It defines the device's core behavior. It's slower to update but much more reliable as a source of truth.

An agent's self-model should live in firmware (files), not RAM (context). The context window is the workspace where the agent thinks, plans, and acts. The files are where identity, knowledge, and state actually live.

This has a practical design implication: **if you find yourself explaining something to an agent repeatedly across sessions, that information belongs in a file.** If the agent keeps losing track of who it is after compaction, its identity files are insufficient. If it can't resume work, its handoff protocol is broken.

The files are the product. The conversation is just the interface.

## References

- Norman, D. *The Design of Everyday Things*, Revised Edition (2013)
- Anthropic Engineering. ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)
- Rembold, J. ["Product Design in the Agentic Era"](/blog/product-design-agentic-era/) (2026)
- Rembold, J. ["Jidoka Trust Levels"](/blog/jidoka-trust-levels/) (2026)
- Rembold, J. ["Bimodal Affordances"](/blog/bimodal-affordances/) (2026)
- Rembold, J. ["Agent-to-Agent Affordances"](/blog/agent-to-agent-affordances/) (2026)

---

*Part 4 of the "Design in the Agentic Era" series. Previous: [Agent-to-Agent Affordances](/blog/agent-to-agent-affordances/). Series start: [Product Design in the Agentic Era](/blog/product-design-agentic-era/)*
