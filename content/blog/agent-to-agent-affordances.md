+++
title = "Agent-to-Agent Affordances: Designing the Factory Floor"
date = 2026-02-26
description = "How to design communication protocols between AI agents using manufacturing principles. Five core affordances, failure modes, Conway's Law for agents, and why the interfaces between agents matter more than the agents themselves."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "multi-agent", "coordination"]
[extra]
og_image = "/blog/agent-to-agent-affordances/01-factory-floor.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "Deep dive into multi-agent coordination design using manufacturing analogies. Covers five core agent-to-agent affordances, failure modes, Conway's Law applied to agent systems, and principles for designing robust agent communication protocols."
key_findings = [
    "Five core A2A affordances: Capability Advertisement, Delegation Contracts, Confidence Propagation, State Handoff, Authority Hierarchy",
    "Four failure modes: Agent Telephone, Authority Confusion, Feedback Collapse, Supervision Gap",
    "Conway's Law applies: agent architecture mirrors communication protocol design",
    "Toyota didn't solve coordination by making each machine smarter. They designed the flow.",
    "The interfaces between agents are where multi-agent systems succeed or fail"
]
+++

*Design in the Agentic Era, Part 3*

Toyota didn't solve manufacturing coordination by making each machine smarter. They designed the flow between machines.

The assembly line at a Toyota plant is a masterclass in inter-station communication. Each station knows exactly what it receives, exactly what it produces, and exactly when to signal a problem. The kanban card travels with the work, carrying structured state from station to station. No station has to guess what the previous one did. No station has to ask "where are we?" The card tells it.

Multi-agent AI systems face the same coordination challenge, and most of them solve it badly. They chain agents together with natural language, pass context through lossy summarization, and hope the next agent in the pipeline can figure out what happened upstream. This is the equivalent of a factory where each station shouts instructions to the next one across a noisy floor.

<!-- more -->

<img src="/blog/agent-to-agent-affordances/01-factory-floor.png" alt="Factory floor model showing a human supervisor at top, orchestrator agent in the middle, and four worker agents below with structured kanban-style state handoffs flowing between them" style="width:100%;border-radius:10px;margin:1.5rem 0;">

## The Five Core Affordances

When one agent needs to work with another, five things need to be designed explicitly. Leave any of them implicit and you're building a system that works in demos and fails in production.

<img src="/blog/agent-to-agent-affordances/02-five-affordances.png" alt="Five core agent-to-agent affordances shown as connected nodes: Capability Advertisement, Delegation Contracts, Confidence Propagation, State Handoff, and Authority Hierarchy, with failure modes below" style="width:100%;border-radius:10px;margin:1.5rem 0;">

### 1. Capability Advertisement

Before an orchestrator can delegate work, it needs to know what each agent can do. Not in prose. In structured, queryable form.

A capability advertisement should include:
- **What the agent does**, in machine-parseable terms (not "I'm good at document analysis" but `{ capability: "pdf_extraction", supported_types: ["invoice", "medical_record"], accuracy: 0.94 }`)
- **Performance characteristics**: latency, throughput, resource requirements
- **Current load and availability**: can it take work right now?
- **Limitations and known failure modes**: what it explicitly cannot handle

This is the agent equivalent of a tool schema or an OpenAPI spec. Without it, the orchestrator is guessing which agent to send work to, and guessing at scale produces cascading errors.

### 2. Delegation Contracts

When an orchestrator assigns work to an agent, the assignment should be a contract, not a request. The difference matters.

A request: "Please review this document for security issues."

A contract:
```
{
  task: "code_security_review",
  input: { repo: "...", commit: "abc123" },
  acceptance_criteria: {
    must_check: ["sql_injection", "xss", "auth_bypass"],
    severity_threshold: "medium",
    max_false_positive_rate: 0.05
  },
  constraints: {
    max_duration: "300s",
    max_tokens: 50000
  },
  on_failure: "escalate_to_human",
  on_uncertainty: "flag_and_continue"
}
```

The contract makes expectations explicit. The agent knows exactly what "done" looks like. The orchestrator can verify completion against defined criteria rather than parsing natural language output and hoping.

This is Toyota's standardized work instruction, translated for agents. Every station on the line has a work instruction sheet that defines exactly what to do, exactly what "good" looks like, and exactly what to do when something goes wrong.

### 3. Confidence Propagation

When agents chain together, confidence compounds. If Agent A extracts data at 0.90 confidence and Agent B analyzes that extraction at 0.85 confidence, the compound confidence of the final output is at most 0.765, not 0.85.

Most multi-agent systems ignore this. Each agent reports its own local confidence, and the system treats the final agent's confidence as the system confidence. This is like a manufacturing line where each station does its own quality check but nobody tracks cumulative defect probability.

**Design for confidence as a chain property:**
- Each agent reports confidence for its own contribution
- Compound confidence propagates through the chain
- The orchestrator (and ultimately the human) sees both local and compound scores
- Confidence thresholds for escalation use compound scores, not local ones

### 4. State Handoff

This is the kanban card. When work moves from one agent to another, the handoff should carry structured state:

- **Completed steps** and their outputs
- **Pending steps** remaining in the workflow
- **Known issues** discovered so far, with severity
- **Constraints** that apply to remaining work
- **Provenance chain**: which agent did what, when, with what confidence

The handoff travels with the work. Every agent in the chain can see the full history without re-deriving it. No agent has to ask "what happened before me?" The card tells it.

The alternative is agent telephone: each agent summarizes what it did in natural language, the next agent parses that summary, information degrades at every hop. By the fourth agent in the chain, critical context has evaporated.

### 5. Authority Hierarchy

When two agents disagree, who wins? When an agent encounters something outside its delegation contract, who does it escalate to? When the orchestrator itself is uncertain, where does the buck stop?

These questions need explicit, unambiguous answers at design time. Not at runtime. Not "it depends."

A well-designed authority hierarchy:
- **Workers execute** within their delegation contracts
- **The orchestrator resolves** inter-agent conflicts and handles exceptions outside any single agent's scope
- **The human has final authority** on anything the orchestrator escalates

The hierarchy must terminate at a human. Always. This isn't philosophical. It's practical. When the confidence chain drops below threshold, when agents disagree on a high-stakes decision, when the system encounters a genuinely novel situation: the escalation path must be clear, fast, and guaranteed to reach a human who can act.

## Failure Modes

Four patterns kill multi-agent systems in production:

**Agent Telephone.** Context degrades with every handoff because agents pass summaries instead of structured state. Fix: structured handoffs with access to original artifacts.

**Authority Confusion.** Multiple agents think they have decision authority over the same domain. They make conflicting decisions. Nobody notices until the downstream effects collide. Fix: explicit authority assignment at design time, conflict detection in the orchestrator.

**Feedback Collapse.** A human corrects the final output, but the correction can't reach the agent that made the original error because the provenance chain doesn't exist. The upstream agent keeps making the same mistake. Fix: provenance chains that enable targeted feedback to the source of any error.

**Supervision Gap.** The human can see what the orchestrator does but can't see past it. The orchestrator summarizes worker outputs, hiding detail the human might need. Fix: full-chain audit trails with drill-down capability from any point in the pipeline to the original work.

## Conway's Law for Agents

<img src="/blog/agent-to-agent-affordances/03-conways-law.png" alt="Side-by-side comparison of unstructured agent communication (messy, lossy, no provenance) versus structured protocols (clean handoffs, full provenance, measurable quality)" style="width:100%;border-radius:10px;margin:1.5rem 0;">

Conway's Law says organizations design systems that mirror their communication structures. The same applies to multi-agent systems: your agent architecture will mirror the communication protocols you design.

If agents communicate through unstructured natural language, your architecture will be fuzzy, lossy, and hard to debug. Context will degrade at every boundary. Errors will be hard to attribute. Quality will be hard to measure.

If agents communicate through structured protocols with explicit contracts, confidence chains, and state handoffs, your architecture will be precise, auditable, and improvable. You'll know exactly where an error originated, exactly how confidence degraded, and exactly which agent needs retraining.

The communication protocol *is* the architecture. Design it deliberately.

## Principles

1. **Design the flow, not just the agents.** A chain of brilliant agents connected by lossy handoffs will underperform a chain of adequate agents connected by clean protocols.

2. **Structured over natural language for inter-agent communication.** Natural language is for humans. Agents should talk in structures: schemas, contracts, typed state objects.

3. **Confidence is a chain property.** Never let a downstream agent's local confidence mask an upstream uncertainty. Propagate and compound.

4. **Provenance enables learning.** If you can't trace an error back to its source agent, you can't fix it systematically. Every output should carry its full derivation chain.

5. **Authority hierarchy terminates at human.** Always. Non-negotiably. The escalation path from any agent to a human decision-maker must be explicit, tested, and fast.

6. **Test the boundaries, not just the agents.** Integration failures happen at handoff points. Test what happens when Agent A produces output that's technically valid but edge-case for Agent B. Test what happens when confidence drops below threshold mid-chain. Test the escalation path.

7. **Monitor compound metrics.** Individual agent accuracy is necessary but not sufficient. Track end-to-end metrics: compound confidence, chain latency, full-pipeline error rates. A 95% accurate agent in a five-agent chain produces 77% end-to-end accuracy. That's the number that matters.

## References

- Ohno, T. *Toyota Production System: Beyond Large-Scale Production* (1988)
- Conway, M. "How Do Committees Invent?" *Datamation* (1968)
- Rembold, J. ["Product Design in the Agentic Era"](/blog/product-design-agentic-era/) (2026)
- Rembold, J. ["Jidoka Trust Levels"](/blog/jidoka-trust-levels/) (2026)
- Rembold, J. ["Bimodal Affordances"](/blog/bimodal-affordances/) (2026)
- Anthropic Engineering. ["Building Effective Agents"](https://www.anthropic.com/engineering/building-effective-agents) (2024)

---

*Part 3 of the "Design in the Agentic Era" series. Previous: [Bimodal Affordances](/blog/bimodal-affordances/). Series start: [Product Design in the Agentic Era](/blog/product-design-agentic-era/)*
