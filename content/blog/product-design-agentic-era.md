+++
title = "Product Design in the Agentic Era"
date = 2026-02-26
description = "First principles for hybrid human-AI product development. Where design surfaces expand beyond pixels, why jidoka is the right model for AI trust, and what irreducible human work looks like when agents build faster than you can spec."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "first-principles"]
[extra]
og_image = "/blog/product-design-agentic-era/01-agent-surfaces.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "A first-principles framework for product design in the agentic era. Covers expanded design surface area (agent identity files, skill definitions, memory systems, eval frameworks), the hybrid pipeline pattern for AI value allocation, trust calibration via Toyota's jidoka, and the irreducible human contributions when agents build faster than humans can specify."
key_findings = [
    "Design surfaces now include agent identity files, skill definitions, memory systems, and eval frameworks",
    "70% of most AI pipelines should be deterministic tooling; the moat is the handoff design between tools, ML, LLM reasoning, and human judgment",
    "Toyota's jidoka (automation with human touch) is the right trust model for AI workflows",
    "When agents build faster than humans spec, design quality becomes the constraint",
    "The irreducible human contributions: problem framing, value hierarchy, boundary design, taste, and eval design"
]
+++

If design permeates every decision in early-stage product development, from business model to data schema to agent behavior to pixel placement, and if agents are augmenting all knowledge work, what is the irreducible human contribution in "product design"?

I've been thinking about this question while building agent runtimes, orchestrating development swarms, and working on enterprise products in healthcare, cloud infrastructure, and adtech. What follows is a working framework. Not a manifesto, but a set of first principles for a discipline being defined in real time.

<!-- more -->

<img src="/blog/product-design-agentic-era/01-agent-surfaces.png" alt="Diagram showing concentric layers of agentic design surfaces: core agent identity files at center, surrounded by declarative knowledge, procedural logic, execution/connectivity, and distribution layers" style="width:100%;border-radius:10px;margin:1.5rem 0;">

## Design Has Always Been Bigger Than Pixels

When I think of "design," my instinct goes to art, graphic design, industrial design. Things I can see and touch. But design permeates every decision. And the canon proves it.

**Don Norman** (*Design of Everyday Things*) defined design as the deliberate arrangement of elements to serve human intent. Affordances, signifiers, mental models: these are cognitive concepts, not aesthetic ones. A well-designed AI workflow communicates "I did this automatically" versus "I need your judgment here" without a tutorial.

**Eli Goldratt** (*Theory of Constraints*) made a design claim about systems: every system has a constraint, and improving anything that isn't the constraint is an illusion of progress. If the bottleneck in a document workflow is weeks of manual processing, then a prettier search interface is waste. The design question is: how do we restructure the entire information flow so the constraint shifts from processing to decision-making?

**Gene Kim** (*The Phoenix Project*) codified three ways: flow, feedback, continuous learning, and four types of work. These are design frameworks for operational systems. **Taiichi Ohno** (*Toyota Production System*) gave us the deepest principle: *jidoka*, automation with a human touch, where machines stop when they detect a problem and signal for help. This is perhaps the most relevant design pattern for AI-augmented workflows.

**Cagan**, **Torres**, and **Singer** brought product discipline: empowered teams, continuous discovery, and appetite-based scoping. All design activities, regardless of whether anyone calls them that.

Good design is seamless, integrated, fluid, intuitive, thoughtful, hidden in the detail. You don't notice good design because it's effortless. Or you *do* notice, when it delights you compared to alternatives that disappointed you. This quality applies equally to a well-shaped API, a data model that makes the right queries easy and the wrong queries hard, and a workflow that guides a human and an agent through a complex decision without confusion about who's responsible.

## The New Design Surface Area

### Traditional Surfaces (Human-Facing)

Visual design, interaction design, information architecture, Norman's affordances. These remain critical and well-understood.

### Agentic Surfaces (Agent-Facing)

When agents are participants in workflows, not just tools invoked by users, every aspect of their operating environment becomes a design surface:

- **Agent identity and knowledge files** (`agent.md`, `identity.md`): Declarative configuration that shapes who the agent is and how it behaves. Persona design for non-human actors.
- **Skill definitions** (`skill.md`): Structured workflows the agent can execute. Capability boundaries expressed as instructions.
- **Hooks and event triggers**: When does the agent activate? Reactive behavior design.
- **Memory systems**: What persists across sessions? What decays? What's shared between agents? Anthropic's research on [effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) demonstrates that structured state files surviving context window boundaries are themselves design artifacts.
- **Plugin / MCP architecture**: Capability grants, permission boundaries, tool-use dispatch.
- **Eval frameworks**: How you measure agent output correctness. In non-deterministic systems, the eval *is* a design decision. It defines what "good" means.

### Bi-Modal Affordances

In hybrid human-AI systems, every interface element needs to be legible to both humans AND agents. This is a new design challenge without established patterns.

A document summary needs visual hierarchy and scannable sections for the human. It simultaneously needs structured JSON with field-level confidence scores for the agent. A "flag for review" button is an affordance for the human; the same action expressed as a state machine transition with a human-in-the-loop gate is an affordance for the agent.

The design challenge is making both layers coherent within the same workflow. The human sees a clean, trustworthy interface. The agent sees structured, actionable data. Neither should be aware of the other's affordance layer unless they need to be.

## Where AI Actually Adds Value (and Where It Doesn't)

This is the most important design question for any AI product.

Traditional ML, OCR, NLP, and data extraction tools are mature, cheap, and well-understood. Python has copious open-source libraries for PDF parsing (`pdfplumber`, `PyMuPDF`), table extraction (`Tabula`, `Camelot`), OCR (`Tesseract`, `EasyOCR`), and NER (`spaCy`). You don't need to burn millions of tokens on tasks these tools handle for free.

**The wrong question:** "How do we use AI to process data?"  
**The right question:** "Where in the workflow does *reasoning over ambiguous information* create value that deterministic tools cannot?"

<img src="/blog/product-design-agentic-era/02-hybrid-pipeline.png" alt="Diagram of the hybrid pipeline pattern showing deterministic tools handling 70% of the pipeline at zero token cost, LLM reasoning handling 30% for ambiguity, with handoff design highlighted as the real moat" style="width:100%;border-radius:10px;margin:1.5rem 0;">

### The Hybrid Pipeline Pattern

The most effective architecture uses the right tool at each stage:

```
Raw Input
  → Extraction             (deterministic tools)
  → Structural Parsing     (rule-based NLP, regex)
  → Entity Extraction      (fine-tuned ML models)
  → Relationship Mapping   (LLM reasoning)
  → Gap/Anomaly Detection  (LLM reasoning)
  → Human Review           (judgment, final authority)
  → Knowledge Store Update (deterministic storage)
```

**The principle:** Use deterministic tools for deterministic tasks. Reserve AI for tasks requiring reasoning, judgment, or synthesis over ambiguous information. Every token burned on a task that `pdfplumber` could handle is waste, both economically and in system reliability.

If 70% of your pipeline is deterministic tooling, your moat isn't "AI." Your moat is the *design of the handoff points* between deterministic processing, ML inference, LLM reasoning, and human judgment. That's architecture. That's product design.

## Trust Calibration

<img src="/blog/product-design-agentic-era/03-trust-calibration.png" alt="Staircase diagram showing trust calibration levels from L0 Full Manual to L5 Full Autonomy, with a jidoka signal pattern showing where automation stops and signals humans" style="width:100%;border-radius:10px;margin:1.5rem 0;">

### Jidoka for the AI Age

In any new AI product, users don't trust the system. In conservative industries, they may actively resist it. The highest-impact design work is not the AI itself. It's the trust architecture around it.

Toyota's *jidoka* provides the model: automation runs until it detects a problem, then stops and signals a human. The human resolves. The machine resumes.

Applied to AI workflows, trust calibration has levels:

**Level 0: Full Manual.** Agent does nothing.  
**Level 1: Assistive.** Agent extracts and organizes. Human decides everything.  
**Level 2: Suggestive.** Agent proposes actions with confidence scores. Human approves or rejects.  
**Level 3: Supervised Autonomy.** Agent handles routine actions automatically. Human reviews exceptions.  
**Level 4: Monitored Autonomy.** Agent handles most of the workflow. Human spot-checks.  
**Level 5: Full Autonomy.** Agent operates independently with audit trail. May never be appropriate for high-stakes regulated work.

The UI, agent behavior, permission model, and audit system all change at each level. The design challenge is building a system that gracefully transitions between levels as trust builds, per user, per workflow type, per data category.

## Two Domains, One Design Problem

We are simultaneously operating in two agent domains:

1. **Software development agents**: writing code, running tests, managing PRs
2. **Non-software agents**: processing documents, analyzing data, managing enterprise workflows

We need advanced thinking around software dev agents to build the next wave of non-software agents. The tooling, patterns, and design surfaces for *building* AI products are themselves being transformed by AI. This creates a recursive challenge: **we must redesign our own product development workflows while simultaneously defining what product development means in the hybrid age.**

### Patterns That Transfer

**From [Anthropic's long-running agent harness](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents):** Structured state files that survive context boundaries apply to any long-running agent workflow, not just coding. The initializer/worker agent split, where one agent sets up the environment and subsequent agents make incremental progress, is a universal orchestration pattern.

**From [GitHub's Continuous AI](https://githubnext.com/projects/continuous-ai) and [Peli's Agent Factory](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/):** Specialized, event-triggered agents outperform monolithic agents. Over 100 workflows in practice. Meta-agents that monitor other agents catch drift and quality degradation. The most valuable Continuous AI tasks are "automatable, repetitive, collaborative, integrated, auditable," the same criteria that define where agent automation creates value in any enterprise workflow.

**From Maggie Appleton's [analysis of Gas Town](https://maggieappleton.com/gastown):** "[Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) churns through implementation plans so quickly that you have to do a LOT of design and planning to keep the engine fed." Design becomes the bottleneck. The biggest failure mode is "vibe design," moving so fast you never stop to think about the shape of the system. And the crucial question: "How close should the code be?" becomes "How close should the agent's reasoning be?" In regulated industries, very close.

## The Double Helix Problem

Every team building AI products faces this: redesigning their own workflows while redefining product development for the hybrid age.

**The Shape Up cycle accelerates.** When agents prototype faster than designers spec, the traditional shape/bet/build cycle breaks down. The designer's role shifts from "specify the solution" to "define the problem space and evaluation criteria."

**Discovery and delivery collapse.** Torres' continuous discovery assumes a gap between understanding the problem and shipping the solution. When an agent goes from insight to working prototype in hours, that gap disappears. The designer's job becomes holding the opportunity solution tree while agents explore the solution space.

**The Theory of Constraints shifts.** In traditional product development, the constraint is engineering bandwidth. With agent-augmented development, the constraint shifts to design quality (can we specify clearly enough?), evaluation rigor (can we assess whether it works?), and domain understanding (do we know the problem deeply enough to direct agents effectively?).

## What the Human Does

The product designer's irreducible contributions in the agentic era:

**Problem framing.** Agents generate solutions. They can't tell you which problems matter.

**Value hierarchy design.** When speed conflicts with accuracy, when automation conflicts with control, deciding which wins requires business context, user empathy, and strategic judgment.

**Boundary design.** Where does the agent stop and the human start? The most consequential design decision in any hybrid system.

**System behavior design.** Data model, permission system, agent orchestration, trust calibration, eval framework, audit trail: all design surfaces. The designer who works across all of these is exponentially more valuable than one who only works in Figma.

**Taste and coherence.** Knowing which of 50 agent-generated variations *feels right* for users who've worked a certain way for decades. Judgment that's hard to formalize.

**Eval design.** What does "correct" look like for non-deterministic AI output? Who defines ground truth? How does the feedback loop where user corrections improve the model actually work?

**Business model design.** Pricing structures create design incentives. Per-document pricing incentivizes batch processing UX. Per-seat pricing incentivizes daily-active-user features. The designer should have a voice because pricing shapes every subsequent design decision.

## First Principles

1. **The constraint determines the design.** Identify the actual bottleneck. Design to relieve it. Everything else is decoration. *(Goldratt)*

2. **Automation with a human touch.** The system runs until it detects a problem, then stops and signals. *(Toyota/Jidoka)*

3. **Use the right tool for each task.** Deterministic tools for deterministic tasks. AI for reasoning over ambiguity. Every misallocated token is waste.

4. **Design for both audiences.** Every interface element in a hybrid system needs affordances for humans AND agents.

5. **Trust is designed, not assumed.** Start conservative. Grant autonomy incrementally. Make every agent decision inspectable.

6. **Design is the bottleneck.** When agents build faster than humans can specify, invest in design quality, evaluation rigor, and domain understanding. *(Appleton)*

7. **Sessions are ephemeral; state must persist.** Design the artifacts that survive context boundaries. *(Anthropic harness pattern)*

8. **Specialize and supervise.** Many focused agents with clear roles outperform one monolithic agent. *(GitHub Continuous AI)*

9. **Design the feedback loop, not just the output.** The eval framework, correction mechanism, and learning pipeline are design surfaces as important as the UI.

10. **Ship to learn, not to finish.** Shape bets, set appetites, let agents explore, evaluate against criteria. *(Singer/Shape Up)*

## What This Means for the Industry

The designers who thrive will be those who think in systems rather than screens, design agent behavior as comfortably as user interfaces, hold the tension between automation and human judgment, and move fluidly between problem framing, solution exploration, and quality assessment.

The designers who struggle will be those who define their role by their tools rather than their judgment, can't engage with data models or agent architectures, and treat design as a phase rather than a continuous activity.

The most valuable product teams will be small groups of high-judgment generalists, each amplified by agents, who can move from problem framing to shipped product without heavy process or handoffs.

Design has always been bigger than any single discipline's claim on it. In the agentic era, the boundaries between "designer," "product manager," "engineer," and "architect" blur further. What matters is the capability: can you frame problems worth solving, specify intent clearly enough for both humans and agents to act on, evaluate whether the result serves the intent, and iterate toward coherence?

That's design. It always has been.

## References

### Books
- Norman, D. *The Design of Everyday Things* (1988)
- Goldratt, E. *The Goal* (1984)
- Kim, G. et al. *The Phoenix Project* (2013)
- Ohno, T. *Toyota Production System* (1988)
- Cagan, M. *Inspired* (2017) / *Empowered* (2020)
- Torres, T. *Continuous Discovery Habits* (2021)
- Singer, R. [*Shape Up*](https://basecamp.com/shapeup) (2019)

### Key Articles
- Appleton, M. ["Gas Town's Agent Patterns, Design Bottlenecks, and Vibecoding at Scale"](https://maggieappleton.com/gastown) (2026)
- Anthropic Engineering. ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)
- GitHub Next. ["Continuous AI"](https://githubnext.com/projects/continuous-ai) (2026)
- GitHub Next. ["Welcome to Peli's Agent Factory"](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/) (2026)
- Yegge, S. ["Welcome to Gas Town"](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) (2026)
- Anthropic. [Claude 4 Prompting Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) (2025)
- Shankar, S. Research on ML evaluation and non-deterministic systems. [shreya-shankar.com](https://shreya-shankar.com)

---

*This document is a living artifact. The frameworks are hypotheses to be tested against real product work, real users, and real constraints.*

---

*Part 1 of the "Design in the Agentic Era" series.*


*This is Part 1 of the Design in the Agentic Era series. See also: [Part 2: Jidoka Trust Levels](/jidoka-trust-levels/) · [Part 3: Bimodal Affordances](/bimodal-affordances/) · [Part 4: Agent-to-Agent Affordances](/agent-to-agent-affordances/) · [Part 5: Agent Proprioception](/agent-proprioception/)*
