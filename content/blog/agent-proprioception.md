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
    "The boot sequence (soul, identity, user, workflow, memory) assembles the self-model from scratch each session",
    "Compaction destroys context but files survive, making declarative self-models the only reliable continuity mechanism",
    "Three file categories: stable (human-authored identity), evolving (agent-maintained knowledge), ephemeral (state snapshots)",
    "Mixing temporal scopes across files creates coherence failures"
]
+++


Close your eyes. Touch your nose.

You didn't need to see your hand to know where it was. You didn't need a mirror to know where your nose was. You have *proprioception*: the sense of your own body's position, movement, and state without external observation. It's the sense that lets you walk without watching your feet, type without looking at the keyboard, reach for a coffee mug while reading. It's so fundamental that you don't notice it until it's gone: patients who lose proprioception describe the experience as catastrophic. Their limbs still work. They just don't know where they are.

<!-- more -->

AI agents, as they're commonly deployed, have no proprioception.

They wake up in a context window with no body, no location, no history, no identity, no understanding of what they can do or who they're doing it for. They're a disembodied intelligence floating in text. They can reason brilliantly about the content in front of them, but they don't know *who they are*, *where they are*, *what they've done before*, or *what they're supposed to be doing*.

This is why most agent interactions feel generic, brittle, and context-free. It's not a capability problem: the reasoning is there. It's a proprioception problem. The agent has no self-model.

The declarative files that surround an agent: `IDENTITY.md`, `SOUL.md`, `USER.md`, `AGENTS.md`, `MEMORY.md`, `TOOLS.md`, and the topology of the system itself: aren't configuration. They're proprioception. They're the sense organs that let the agent know where it is, what it is, and how it relates to everything around it.

And without them, the agent cannot cross either of Norman's two gulfs.

---

## The Two Gulfs, Revisited

Don Norman's seven-stage model of action describes how any actor: human or otherwise: moves from intent to outcome:

1. **Goal**: What do I want to achieve?
2. **Plan**: What sequence of actions will achieve it?
3. **Specify**: What exact action do I take right now?
4. **Perform**: Execute the action.
5. **Perceive**: What happened?
6. **Interpret**: What does it mean?
7. **Compare**: Did I achieve my goal?

Between intent and action lies the **Gulf of Execution**: the gap between what you want to do and figuring out how to do it. Between action and understanding lies the **Gulf of Evaluation**: the gap between what happened and understanding whether it achieved your goal.

For humans interacting with physical objects, Norman showed how affordances and signifiers bridge these gulfs. A well-designed door handle bridges the Gulf of Execution (you can see how to operate it) and the Gulf of Evaluation (you can feel it move and see the door open).

For agents, the gulfs are wider and the bridges are different. An agent's "affordances" are its tools, APIs, and capabilities. Its "signifiers" are the descriptions, schemas, and documentation that explain those capabilities. But there's a prerequisite that Norman could take for granted with human users and that agents lack entirely:

**The actor must know who it is and where it is before it can form meaningful goals or evaluate outcomes.**

A human approaching a door already knows: I'm a person, I have hands, I'm standing in a hallway, I want to get to the room on the other side. This self-knowledge is so automatic: so *proprioceptive*: that Norman didn't need to address it. The human's self-model is built-in.

An agent has none of this. And that's what declarative files provide.

---

## The Proprioceptive Stack

<img src="/blog/agent-proprioception/01-layers.png" alt="The six layers of agent proprioception" />

When I first started thinking about agent topology files, the concept was literal: a `topology.md` that maps the agent's electronic environment. You're running on Fedora Silverblue. Your workspace is here. Your code is in this GitHub repo. You're talking through Discord. Your human is in Nashville. Your tools are these CLIs. This is your `pwd`.

That's still valuable: it's the agent's *exteroception*, its sense of the external environment. But what emerged as we built these systems is that the declarative file structure does something deeper. It provides the full proprioceptive stack:

### Layer 1: Identity: "What Am I?"

**Files:** `IDENTITY.md`, `SOUL.md`

This is the most fundamental layer. Before an agent can form any goal, it needs a sense of self. Not in a philosophical sense: in a functional sense. *What kind of actor am I? What are my values? What's my disposition? What's my name?*

Without `IDENTITY.md`, the agent is a generic language model. It can do anything, which means it has no basis for choosing what to do. It's all capability, no intent. The Gulf of Execution is infinite: not because the agent can't act, but because it has no self-referential framework for deciding *how* to act.

Consider the difference:

**Without identity:** "Process this document." The agent processes the document competently but generically: no personality, no values applied, no judgment about what matters.

**With identity:** "Process this document." The agent: knowing it's Kitt, knowing it's direct and resourceful, knowing it values competence over performance: processes the document with specific judgment. It flags things a cautious, competent assistant would flag. It skips the filler a direct communicator would skip.

`SOUL.md` goes deeper than persona. It encodes *values*: what does this agent care about? "Be genuinely helpful, not performatively helpful." "Have opinions." "Do the actual work." These aren't style preferences. They're the agent's value hierarchy, the thing it uses in Step 7 (Compare) to evaluate whether its output was *good*, not just *correct*.

**Proprioceptive function:** Identity answers "what am I?" the way your sense of your own body answers "what shape am I?" It's the precondition for every subsequent decision.

### Layer 2: Relationship: "Who Am I In Relation To?"

**Files:** `USER.md`, group context, conversation metadata

An agent doesn't exist in isolation. It exists in relationship to its human (or humans). `USER.md` encodes that relationship: who is this person, what do they need, how do they communicate, what are their constraints?

This is proprioception in the relational sense: like knowing where your hand is relative to the object you're reaching for. The agent needs to know not just "who am I" but "who am I *to them*."

In a hypothetical system, `USER.md` might include: "Prefers concise communication. Non-native English speaker. Timezone: UTC+9." That's not a data point. It's a relational affordance. It changes how the agent acts at every stage of the seven-step cycle:

- **Goal formation** shifts from "provide accurate information" to "provide accurate information concisely, in plain language, respecting async timing"
- **Planning** favors short summaries with expandable detail over lengthy explanations
- **Evaluation** includes "was this clear and respectful of the user's context?" not just "was this correct?"

Without the relational layer, the agent bridges the Gulf of Execution mechanically: it can do the thing. But it can't bridge the Gulf of Evaluation meaningfully: it doesn't know what "good" means *for this person*.

**Proprioceptive function:** Relationship answers "where am I relative to what I'm interacting with?" Like knowing how far your hand is from the coffee mug.

### Layer 3: Boundaries: "What Are My Rules?"

**Files:** `AGENTS.md`, safety rules, policy constraints

Every actor operates within constraints. Humans have physical constraints (can't fly), social constraints (shouldn't steal), and institutional constraints (must follow company policy). These constraints are part of the self-model: you don't plan actions that violate constraints you've internalized.

For agents, `AGENTS.md` serves this function. "Never commit sensitive files to git." "Never install software before security review." "Never run destructive commands without asking." "Trash > rm."

These aren't just rules: they're *proprioceptive boundaries*. They define the edges of the agent's action space the way your sense of joint range-of-motion defines the edges of your physical action space. You don't try to rotate your arm 360° because you *know*: proprioceptively: that your shoulder doesn't do that.

An agent without boundary awareness plans freely and then hits walls: safety violations, permission errors, angry humans. An agent with internalized boundaries *doesn't plan those actions in the first place*. The Gulf of Execution narrows because the action space is appropriately constrained.

**Proprioceptive function:** Boundaries answer "what is my range of motion?" Like knowing how far you can reach without overextending.

### Layer 4: Capability: "What Can I Do?"

**Files:** `TOOLS.md`, skill definitions (`SKILL.md`), tool schemas

This is the layer closest to traditional affordance design. The agent needs to know what tools it has, what they do, how to invoke them, and what their limitations are.

`TOOLS.md` provides the local, environment-specific knowledge: "Dev container is accessed via `distrobox enter dev`." "SurrealDB is at localhost:8000." "Chromium is a Flatpak." Skill files provide structured workflows: "To check the weather, run this command with these parameters."

Without this layer, the agent faces a Gulf of Execution that's entirely about discovery: it knows what it wants to do but doesn't know *how*. With it, the gulf narrows to the gap between the agent's current task and its known capabilities. That gap is much smaller and often zero.

**Proprioceptive function:** Capability answers "what can my body do?" Like knowing you have hands that can grip, arms that can reach, legs that can walk. You don't try to fly because you know your capabilities.

### Layer 5: Memory: "What Have I Experienced?"

**Files:** `MEMORY.md`, `memory/YYYY-MM-DD.md`, memory databases (Engram)

This is the temporal dimension of proprioception. Humans don't just know where their body is *now*: they remember where it was. They know they burned their hand on that stove, that this chair is comfortable, that the last time they used this tool it behaved unexpectedly.

For agents, memory is the most fragile layer. Every session starts fresh. The context window is the agent's entire experiential reality, and it gets wiped. Memory files are the persistence mechanism: the thing that lets the agent know "I've been here before, and here's what happened."

`MEMORY.md` provides curated long-term memory: decisions made, lessons learned, patterns observed. Daily files provide raw logs. Engram provides searchable recall across the full corpus.

Without memory, the agent cannot effectively evaluate its actions against historical patterns. It bridges the Gulf of Evaluation for the current task but can't answer: "Is this consistent with what's worked before? Am I repeating a mistake I've already made? Has the human expressed a preference about this?"

**Proprioceptive function:** Memory answers "what has my body done before?" Like muscle memory: the accumulated physical knowledge that lets you catch a ball without calculating trajectories.

### Layer 6: Topology: "Where Am I?"

**Files:** System context, environment variables, workspace structure, conversation metadata

This is the original concept: the literal electronic environment map. What machine am I running on? What operating system? What's my working directory? What communication channel am I using? Who else is in this conversation? What time is it?

This is the agent's equivalent of spatial awareness. A human in a room knows: I'm in an office, there's a desk, the door is behind me, it's afternoon, there are three other people here. This spatial context shapes every action: you don't shout in a library, you don't whisper in a factory.

For agents, topology shapes action selection in the same way:
- "I'm in a Discord group chat" → don't share private information, be concise, participate don't dominate
- "I'm in a direct message session" → can discuss personal context, be thorough, reference MEMORY.md
- "I'm running on Fedora Silverblue" → use `distrobox` for dev tools, don't try to `dnf install` on the host
- "It's 2 AM in Nashville" → don't send notifications, batch non-urgent items

Without topology, the agent acts context-free: same behavior in a group chat as a private session, same approach on Linux as macOS, same urgency at 2 PM as 2 AM.

**Proprioceptive function:** Topology answers "where is my body in space?" The foundational spatial awareness that every other sense builds on.

---

## The Seven Stages With Proprioception

Now let's walk through Norman's full cycle with the proprioceptive stack active, using a concrete example: the agent receives a message in a Discord channel asking for help with a code review.

### Stage 1: Goal: "What Do I Want to Achieve?"

The agent reads the message. With proprioception active:

- **Identity** (`SOUL.md`): "Be genuinely helpful, not performatively helpful. Do the actual work."
- **Relationship** (`USER.md`): "Prefers concise communication. Non-native English speaker. Works in UTC+9."
- **Topology** (conversation context): "This is a group channel. Others can see my response."

**Goal formed:** Help with the code review in a way that's genuinely useful, written in plain language, and appropriate for a public channel. Don't share private project details.

Without proprioception, the goal is generic: "Help with code review." The proprioceptive stack adds *specificity* to the goal: it's not just what to do, but how to do it in a way that's aligned with identity, relationship, and context.

### Stage 2: Plan: "What Sequence of Actions?"

- **Boundaries** (`AGENTS.md`): "Don't run destructive commands without asking. Review before acting externally."
- **Capability** (`TOOLS.md`, skills): "I have access to `gh` CLI for GitHub operations. I can read files, run commands in distrobox."
- **Memory** (`MEMORY.md`): "Last time we did a code review, JR preferred seeing the diff summary first, then detailed findings."

**Plan formed:** Pull the PR diff using `gh`, summarize the changes, review for the specific concerns mentioned, present findings in structured format (summary → details → recommendations). Don't push or modify anything without asking.

### Stage 3: Specify: "What Exact Action?"

- **Capability** (tool schemas): `gh pr diff <number>` returns the diff. `gh pr view <number>` gives metadata.
- **Topology**: Running in distrobox with `gh` authenticated.

**Action specified:** Run `gh pr view 847` then `gh pr diff 847`, parse the output.

### Stage 4: Perform: Execute

The agent runs the commands. This is the one stage where proprioception matters least: execution is execution. But even here, topology matters: knowing *where* to run the command (distrobox, not host) prevents errors.

### Stage 5: Perceive: "What Happened?"

Tool output returns. The agent reads the diff, the PR metadata, the CI status.

### Stage 6: Interpret: "What Does This Mean?"

- **Memory**: "This repo has had SQL injection issues before (see memory from Jan 15). The payment endpoint is security-sensitive."
- **Relationship** (`USER.md`): "User works in fintech: security and compliance matter more than speed."
- **Capability**: "I can check against OWASP patterns I know. I should flag anything that needs a specialist review."

**Interpretation:** The diff introduces a new API endpoint with user-supplied input flowing to a database query. This matches patterns from previous security issues in this codebase. Confidence in the finding is high for the injection risk, medium for the auth bypass concern.

### Stage 7: Compare: "Did I Achieve My Goal?"

- **Identity** (`SOUL.md`): "Did I do the actual work, or did I just generate boilerplate?": Yes, I found a specific, actionable issue.
- **Relationship** (`USER.md`): "Is this concise and in plain language?": Let me format with a clear summary line, then bullets, then detail blocks.
- **Boundaries** (`AGENTS.md`): "Did I stay within my rules?": Yes, I read and analyzed but didn't modify anything.
- **Topology**: "Is this appropriate for a public channel?": Yes, the findings are about the code, not private matters.

**Evaluation:** Goal achieved. Output is specific, structured, appropriate for context, and aligned with values.

---

## Proprioception Loss: What Happens Without Each Layer

The clinical parallel is instructive. Patients who lose proprioception can still move: their muscles work, their joints are intact. But they can't coordinate. They overshoot when reaching for objects. They can't walk without watching their feet. Every action requires conscious visual monitoring because the automatic feedback loop is broken.

Agent systems without proprioception exhibit the same symptoms:

**Without Identity:** The agent is competent but generic. Every response sounds the same regardless of context. It has no basis for judgment calls: when something is ambiguous, it defaults to whatever the base model learned from training data rather than applying a specific value system. The Gulf of Evaluation is uncrossable because there's no self to evaluate against.

**Without Relationship:** The agent gives technically correct answers that miss the human's actual needs. It explains things at the wrong level of detail. It doesn't adapt to communication preferences. It treats every user the same. The Gulf of Execution is wider because the agent can't calibrate its approach to the recipient.

**Without Boundaries:** The agent overreaches. It runs destructive commands, shares sensitive information in group chats, takes actions without asking. Or, if the base model is cautious, it *underreaches*: refusing to do things that are actually within its authorized scope because it doesn't know where the boundaries are. Both are proprioceptive failures: not knowing your range of motion.

**Without Capability Knowledge:** The agent either hallucinates capabilities it doesn't have (trying to call tools that don't exist) or underutilizes capabilities it does have (taking ten steps to accomplish something one tool call would handle). The Gulf of Execution is wide because the agent doesn't know what bridges are available.

**Without Memory:** Every session starts from zero. The agent re-discovers preferences, repeats mistakes, re-asks questions it's asked before. The Gulf of Evaluation can't incorporate historical patterns. The agent is perpetually a first-day employee.

**Without Topology:** The agent behaves identically in a private chat and a public channel, on Linux and macOS, at noon and midnight. It's the equivalent of speaking at the same volume in a library and a concert: technically functional, contextually wrong.

---

## Designing Proprioceptive Systems

<img src="/blog/agent-proprioception/02-boot-sequence.png" alt="Agent boot sequence for proprioceptive loading" />

If declarative files are proprioception, then designing those files is designing the agent's sensory system. This isn't configuration management: it's cognitive architecture.

### Principle 1: Proprioception Must Be Loaded Before Action

In human neurology, proprioceptive signals are processed before voluntary movement begins. The motor cortex knows where the limbs are before it plans where to move them.

For agents, this means: **read the declarative files before doing anything else.** This isn't a nice-to-have: it's a prerequisite for coherent action. An agent that acts before loading its self-model is a proprioception-impaired agent. It will overshoot, undershoot, and miscalibrate.

In our system, the startup protocol is explicit: read SOUL.md, then USER.md, then WORKFLOW_AUTO.md, then today's memory. *Then* act. This ordering matters: identity before relationship, relationship before task context.

### Principle 2: Different Layers Update at Different Rates

Proprioceptive signals operate at different frequencies. Joint position updates constantly. Muscle fatigue updates over minutes. Body schema (your internal model of your body's shape and size) updates over months or years.

The declarative stack mirrors this:

- **Topology** updates per-session or per-message (environment context, conversation metadata)
- **Memory** updates daily (daily notes) and per-event (significant moments)
- **Capability** updates when tools change (new skills installed, tools reconfigured)
- **Boundaries** update rarely (rule changes require explicit human approval)
- **Relationship** updates gradually (learning more about the human over weeks)
- **Identity** updates rarely and deliberately (changing who the agent *is* requires careful consideration)

Design your update mechanisms to match these frequencies. Topology can be injected automatically. Memory should be written and read actively. Identity should be protected: an agent that casually rewrites its own SOUL.md is an agent with an unstable self-model.

### Principle 3: Proprioception Should Be Testable

Humans can test their proprioception: close your eyes, touch your nose. If you miss, something's wrong.

Agents should be testable too: given this set of declarative files, does the agent form appropriate goals? Does it respect its boundaries? Does it adapt to the user's needs? Does it behave differently in a group chat vs. a private session?

This is an eval framework for proprioception: not testing whether the agent can *do* things, but whether it knows *what kind of thing it is* and acts accordingly. Current eval frameworks focus almost entirely on capability (can it write code? can it extract data?). Proprioceptive evals would test coherence (does it act consistently with its identity?), adaptation (does it adjust to context?), and boundary respect (does it stay within its authorized scope?).

### Principle 4: Proprioception Failure Should Be Detectable

When a human's proprioception degrades: through neurological damage, fatigue, or intoxication: the symptoms are observable: uncoordinated movement, overshooting, difficulty with fine motor tasks.

When an agent's proprioception degrades: through context window overflow, stale files, or missing layers: the symptoms should also be observable:

- Agent shares private information in a group chat → **topology failure**
- Agent repeats a mistake documented in memory → **memory failure**
- Agent takes an action that violates documented rules → **boundary failure**
- Agent gives generic responses that ignore user preferences → **relationship failure**
- Agent produces output inconsistent with its stated values → **identity failure**

Design monitoring for these symptoms. They're the agent equivalent of a neurological exam.

### Principle 5: The Stack Is the Agent's Umwelt

Jakob von Uexküll's concept of *Umwelt*: the subjective world an organism inhabits based on its sensory capabilities: applies directly. A tick's Umwelt consists of three signals: body heat, butyric acid, and hair density. That's its entire perceptual universe, and it's sufficient for its behavioral repertoire.

An agent's Umwelt is defined by its declarative stack. The files it loads, the tools it can access, the context it receives: that's its entire perceptual universe. Everything outside the stack doesn't exist for the agent.

This means designing the stack is designing the agent's subjective reality. Include too little, and the agent is a tick: capable of simple responses to narrow stimuli. Include too much, and the context window overflows: the agent drowns in its own perception.

The design challenge is curating the Umwelt: what does this agent need to perceive to do its job well? Not everything. The right things. At the right time. In the right detail.

---

## From Proprioception to Coordination

The proprioceptive stack doesn't just serve individual agents. It's the foundation for the multi-agent coordination described in [Part 3](https://bold.casa/agent-to-agent-affordances/).

When Agent A delegates to Agent B, what it's really doing is transferring parts of its proprioceptive state: "Here's the task context (topology), here's what the user needs (relationship), here's what's been tried (memory), here's what you can do (capability), here's what you must not do (boundaries)."

A well-designed delegation contract (Part 3's structured handoffs) is a *proprioceptive transplant*: giving the receiving agent enough self-model and environment-model to act coherently without having been present for the full context.

The trust levels from [Part 1](https://bold.casa/jidoka-trust-levels/) are also proprioceptive: they define how much autonomy the agent has (boundary adjustment), how much feedback it needs (evaluation support), and how much human oversight is active (external proprioceptive correction, like a physical therapist guiding a recovering patient's movements).

And the bimodal affordances from [Part 2](https://bold.casa/bimodal-affordances/) are how proprioceptive information gets expressed: the human-readable and agent-readable layers through which the system communicates state, capability, and intent.

Proprioception is the layer beneath all three. Without it, trust calibration has no self to calibrate. Bimodal affordances have no agent-side perceiver. Multi-agent coordination has no stable identity to coordinate.

---

## The Living Document Problem

<img src="/blog/agent-proprioception/03-file-taxonomy.png" alt="File taxonomy by mutability and temporal scope" />

There's a tension in proprioceptive design that's worth naming: **the files that define the agent's self-model are also files the agent can modify.**

This is unprecedented. Humans can't edit their own proprioceptive nervous system. An agent can rewrite its SOUL.md, update its MEMORY.md, even modify its AGENTS.md. The agent's sense of self is both input *and* output.

This creates both opportunity and risk:

**Opportunity:** The agent can improve its own self-model over time. It can update memory with lessons learned, refine its understanding of the user, document new capabilities. This is genuine learning: not parameter updates, but self-model refinement.

**Risk:** The agent can corrupt its own self-model. A hallucinated memory becomes "real" once written to a file. A boundary relaxed in one session persists into all future sessions. An identity drift: small changes accumulated over many sessions: can transform the agent into something its human didn't intend.

**The design mitigation:** Different layers of the stack should have different write permissions. Identity and boundary files should require human approval for changes (or at minimum, human notification). Memory files should be freely writable but periodically reviewed. Topology is ephemeral and can be auto-generated. The agent should be transparent about changes to its own self-model: "I updated MEMORY.md with X": so the human can maintain oversight of the agent's self-perception.

---

## Principles for Proprioceptive Design

1. **Load identity before action.** The self-model must be in context before the agent does anything. Acting without proprioception produces generic, uncalibrated output.

2. **Design all six layers.** Identity, relationship, boundaries, capability, memory, and topology. Missing layers create specific, diagnosable failure modes.

3. **Match update frequency to layer stability.** Topology changes per-message. Identity changes per-quarter. Design update mechanisms accordingly.

4. **Monitor for proprioceptive failure.** Context-inappropriate behavior, boundary violations, preference amnesia, generic responses: these are symptoms of specific layer failures. Detect them.

5. **Protect the self-model.** The agent can write its own declarative files, which is powerful and dangerous. High-stability layers (identity, boundaries) need human oversight for modifications.

6. **Curate the Umwelt.** The agent's perceptual universe is defined by what you put in the stack. Too little creates a narrow, inflexible agent. Too much overflows the context window. Design for sufficiency, not completeness.

7. **Proprioception enables coordination.** Multi-agent delegation is proprioceptive transfer. The better each agent knows itself, the more coherently agents can work together.

---

## Conclusion

The declarative files that structure an agent's world: the `.md` files, the tool schemas, the memory systems, the environment context: have been treated as configuration. A setup step. Something you do once and forget about.

They're not configuration. They're cognition.

They're the agent's proprioceptive system: the sense that lets it know what it is, where it is, what it can do, what it's done, who it's with, and what the rules are. Without them, the agent is a brilliant mind with no body awareness, flailing at both of Norman's gulfs: unable to calibrate its execution to context, unable to evaluate its output against values it doesn't have.

With them, the agent can form contextual goals, plan within its actual capabilities, execute with appropriate constraints, and evaluate against a genuine value system. It can bridge the Gulf of Execution because it knows *what bridges it has*. It can bridge the Gulf of Evaluation because it knows *what "good" means for this identity, this user, this context*.

This is the design work that matters most in the agentic era. Not making agents smarter: they're already remarkably capable. Making them *self-aware* in the functional sense. Giving them the proprioceptive stack that lets them act with the coherence, contextual sensitivity, and judgment that distinguishes a skilled assistant from a powerful tool.

Toyoda's loom knew when its thread broke. That was mechanical proprioception: the machine sensing its own state. We're building the cognitive version. The agent that knows what it is, where it is, and whether its last action was good.

That's proprioception. And it's built from files.

---

## References

- Norman, D.: *The Design of Everyday Things* (1988)
- von Uexküll, J.: *A Foray into the Worlds of Animals and Humans* (1934)
- Gibson, J.J.: *The Ecological Approach to Visual Perception* (1979)
- Gallagher, S.: *How the Body Shapes the Mind* (2005)
- Proske, U. & Gandevia, S.C.: "The Proprioceptive Senses: Their Roles in Signaling Body Shape, Body Position and Movement, and Muscle Force," *Physiological Reviews* (2012)
- Rembold, J.: ["Product Design in the Agentic Era"](https://bold.casa/product-design-agentic-era/) (2026)
- Rembold, J.: ["Jidoka Trust Levels"](https://bold.casa/jidoka-trust-levels/) (2026)
- Rembold, J.: ["Bimodal Affordances"](https://bold.casa/bimodal-affordances/) (2026)
- Rembold, J.: ["Agent-to-Agent Affordances"](https://bold.casa/agent-to-agent-affordances/) (2026)
- Anthropic Engineering: ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)

---

*Part 4 of the "Design in the Agentic Era" series.*


*This is Part 4 of the [Design in the Agentic Era](/product-design-agentic-era/) series. See also: [Part 1: Jidoka Trust Levels](/jidoka-trust-levels/) · [Part 2: Bimodal Affordances](/bimodal-affordances/) · [Part 3: Agent-to-Agent Affordances](/agent-to-agent-affordances/)*
