+++
title = "Agent-to-Agent Affordances: Designing the Handoff"
date = 2026-02-26
description = "How agents delegate, coordinate, and hand off work to each other. Structured contracts, capability discovery, trust propagation, and why Conway's Law applies to multi-agent systems."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "multi-agent", "coordination"]
[extra]
og_image = "/blog/agent-to-agent-affordances/01-factory-floor.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "Explores agent-to-agent affordances: the interfaces, contracts, and patterns that enable multi-agent coordination. Covers delegation contracts, capability advertisement, trust propagation, error handling, and applies Conway's Law to agent architectures."
key_findings = [
    "Agent-to-agent coordination requires explicit affordances, not just shared context",
    "Five core A2A affordances: capability discovery, delegation contracts, progress signaling, error escalation, result packaging",
    "Trust does not transfer automatically: Agent A trusting Agent B does not mean Agent C should trust Agent B",
    "Conway's Law applies: multi-agent architectures mirror the communication structures of the teams that design them",
    "The handoff is the hardest part: most multi-agent failures happen at delegation boundaries, not within individual agents"
]
+++


Norman's affordances were about a human perceiving a designed object. In Part 2, we extended this to bimodal systems: a human *and* an agent perceiving the same system. But there's a third configuration that's emerging faster than most teams are ready for: agents perceiving *each other*.

<!-- more -->

When Agent A delegates a subtask to Agent B, what are the affordances? When a supervisor agent monitors a fleet of worker agents, what are the signifiers? When three agents collaborate on a complex workflow, each with different capabilities and different context windows, how do they communicate state, intent, uncertainty, and authority?

These are design questions. And right now, most teams are solving them with duct tape: ad hoc prompts, unstructured handoff messages, and hope. The result is predictable: agent telephone, authority confusion, and feedback collapse.

We can do better. The same design principles that Norman applied to door handles, that Toyota applied to production lines, and that we applied to human-agent interfaces in Parts 1 and 2 apply here. Agent-to-agent interaction is a design surface, and it needs the same rigor as any other.

---

## Why This Matters Now

Six months ago, most AI agents operated in isolation. One agent, one task, one human supervisor. The coordination problem was simple: the human tells the agent what to do, the agent does it (or doesn't), the human evaluates.

That's changing fast. GitHub's Continuous AI runs over 100 specialized agent workflows, with meta-agents monitoring other agents for drift and quality degradation. Anthropic's research on long-running agents describes initializer/worker splits where one agent sets up the environment and subsequent agents make incremental progress. OpenClaw supports sub-agent spawning where a primary agent delegates specialized tasks to child agents running in isolated sessions.

The pattern is clear: **agent systems are becoming multi-agent systems.** And multi-agent systems need communication protocols, coordination mechanisms, and trust architectures: all of which are design problems.

The manufacturing parallel is exact. A single CNC machine is an automation problem. A factory floor with dozens of machines, each performing different operations, feeding parts to each other, with quality checkpoints and material flow: that's a *systems design* problem. Toyota didn't solve it by making each machine smarter. They solved it with kanban, standardized work, jidoka, and relentless attention to the interfaces between stations.

The interfaces between agents are where multi-agent systems succeed or fail.

---

## The Agent's Perception of Other Agents

Before we can design agent-to-agent affordances, we need to understand how agents perceive each other. The answer is simultaneously simple and limiting: **agents perceive other agents entirely through artifacts.**

An agent cannot observe another agent's reasoning process. It cannot read another agent's "body language" or "tone." It can only perceive:

- **Outputs:** The text, data, files, and state changes the other agent produces
- **Metadata:** Confidence scores, provenance chains, timestamps, capability declarations
- **Protocols:** The structured format of communication: schemas, APIs, message formats
- **Reputation:** Historical performance data, if the system tracks it

This is actually *less* information than humans have when collaborating with each other. Humans read facial expressions, tone of voice, hesitation, enthusiasm. Agents read structured outputs. This means the outputs must carry more signal: they must communicate not just *what* was done, but *how confident the agent is*, *what it considered and rejected*, and *where the boundaries of its knowledge lie*.

---

## Core Agent-to-Agent Affordances

<img src="/blog/agent-to-agent-affordances/02-five-affordances.png" alt="Five core agent-to-agent affordances" />

### 1. Capability Advertisement

Before an agent can delegate to another agent, it needs to know what that agent can do. This is the most basic affordance: "here's what I am and what I'm good at."

**Current state:** Most multi-agent systems use static capability descriptions. A coding agent's capability is described in its system prompt. A document processing agent has a fixed set of tools. The orchestrating agent reads these descriptions and makes delegation decisions based on text matching.

**What's needed:** Dynamic capability advertisement with performance metadata.

```
{
  "agent_id": "doc-processor-v3",
  "capabilities": [
    {
      "name": "pdf_extraction",
      "description": "Extract structured data from PDF documents",
      "input_types": ["application/pdf"],
      "output_schema": "extraction_result_v2",
      "performance": {
        "accuracy_30d": 0.94,
        "median_latency_ms": 3200,
        "failure_rate_30d": 0.02
      },
      "constraints": {
        "max_pages": 200,
        "languages": ["en", "es", "de"],
        "requires_ocr_for": ["scanned", "handwritten"]
      }
    }
  ],
  "current_load": 0.6,
  "availability": "ready"
}
```

This isn't hypothetical: it's how well-designed microservice architectures already work. Service discovery, health checks, capability negotiation. The agent world is rediscovering patterns that distributed systems solved years ago.

**The design principle:** An agent's capabilities should be *discoverable, queryable, and quantified*: not just described in prose. Prose descriptions are signifiers for humans. Structured capability schemas are signifiers for agents.

### 2. Delegation Contracts

When Agent A asks Agent B to do something, there needs to be a shared understanding of: what's being asked, what "done" looks like, what constraints apply, and what happens if something goes wrong.

**Current state:** Most delegation is a prompt. "Please review this code for security vulnerabilities and report your findings." The receiving agent interprets this however it interprets it. There's no shared schema for the request, no explicit acceptance criteria, no error handling protocol.

**What's needed:** Structured delegation with explicit contracts.

```
{
  "delegation": {
    "from": "orchestrator",
    "to": "security-reviewer",
    "task": "code_security_review",
    "input": {
      "repository": "acme/payments",
      "diff_ref": "abc123..def456",
      "context": "PR #847 - new payment processing endpoint"
    },
    "acceptance_criteria": {
      "must_check": ["injection", "auth_bypass", "data_exposure", "dependency_vulns"],
      "output_format": "security_review_v1",
      "confidence_threshold": 0.8
    },
    "constraints": {
      "timeout_seconds": 300,
      "max_tokens": 50000,
      "escalation": "if_confidence_below_threshold_return_partial_with_flag"
    },
    "on_failure": {
      "action": "return_error_structured",
      "escalate_to": "human_reviewer"
    }
  }
}
```

This is a *contract*, not a request. Both agents know what's expected. The output format is agreed upon. Failure handling is explicit. This is poka-yoke applied to agent coordination: the structure makes miscommunication harder.

**Toyota parallel:** Standardized work instructions. Every station on the line knows exactly what it receives, what it must produce, what quality checks to perform, and what to do when something doesn't meet spec. The instruction card *is* the interface between stations.

### 3. Confidence and Uncertainty Propagation

When Agent B completes a task and returns results to Agent A, it needs to communicate not just *what* it found but *how sure it is*. And Agent A needs to propagate that uncertainty through its own decisions.

**The telephone problem:** Agent A is 90% confident in its extraction. It passes the result to Agent B, which is 85% confident in its analysis of that extraction. The compound confidence is 0.9 × 0.85 = 0.765: but if neither agent tracks compound uncertainty, the final output is presented as if it were a fresh 85% confidence result. The uncertainty from the first stage is lost.

**What's needed:** Provenance-aware confidence that compounds through the chain.

```
{
  "result": {
    "finding": "potential SQL injection in line 42",
    "confidence": 0.87,
    "provenance": {
      "input_confidence": 0.94,
      "compound_confidence": 0.82,
      "confidence_chain": [
        {"agent": "diff-parser", "confidence": 0.94, "stage": "extraction"},
        {"agent": "security-reviewer", "confidence": 0.87, "stage": "analysis"}
      ]
    }
  }
}
```

**The design principle:** Confidence is not a local property: it's a chain property. Every agent in a multi-agent workflow should report both its own confidence and the compound confidence through the entire chain. The human at the end of the pipeline needs to know the *system's* confidence, not just the last agent's.

### 4. State Handoff Protocols

When one agent passes work to another, the receiving agent needs enough context to do its job without having been present for everything that came before. This is the hardest affordance to design well, because context is expensive and agents have finite context windows.

**Current state:** Most handoffs are unstructured text. "Here's what I've done so far: [wall of text]. Please continue." The receiving agent tries to parse the narrative, often misunderstands, and proceeds with a degraded model of the situation.

**What's needed:** Structured state handoff with explicit sections for what's done, what's pending, what's uncertain, and what constraints apply.

```
{
  "handoff": {
    "task_id": "intake-2847",
    "state": "extraction_complete",
    "completed_steps": [
      {"step": "document_ingestion", "status": "done", "artifacts": ["raw_text.json"]},
      {"step": "field_extraction", "status": "done", "artifacts": ["extracted_fields.json"], "notes": "page 3 was low-quality scan, confidence degraded"}
    ],
    "pending_steps": [
      {"step": "cross_reference_check", "priority": "high"},
      {"step": "anomaly_detection", "priority": "medium"}
    ],
    "known_issues": [
      {"issue": "patient_dob_conflict", "description": "Page 1 says 1985-03-12, page 4 says 1983-03-12", "severity": "high"}
    ],
    "constraints": {
      "sla_deadline": "2026-02-27T10:00:00Z",
      "human_escalation_if": ["confidence < 0.7 on any critical field", "unresolvable data conflict"]
    }
  }
}
```

This is Anthropic's "structured state files that survive context boundaries" made explicit for multi-agent coordination. The handoff document isn't a narrative: it's a structured artifact designed for agent consumption.

**The Toyota parallel:** This is the kanban card. It travels with the work piece, carrying all the information the next station needs: what's been done, what's required, what the quality specs are. The card *is* the coordination mechanism.

### 5. Authority and Escalation Hierarchies

In any multi-agent system, someone needs to be in charge. When agents disagree, when confidence is low, when something unexpected happens: there needs to be a clear authority hierarchy that determines who decides.

**The authority confusion problem:** Agent A extracts a value. Agent B's analysis contradicts it. Agent C, the orchestrator, needs to resolve the conflict. But on what basis? Does it trust the more specialized agent? The more confident one? The one with better historical accuracy? Does it escalate to a human?

**What's needed:** Explicit authority rules, not implicit hierarchies.

```
{
  "authority_model": {
    "default_resolution": "highest_confidence_with_specialization_weight",
    "specialization_weights": {
      "doc-processor": {"pdf_extraction": 1.0, "analysis": 0.5},
      "security-reviewer": {"security_analysis": 1.0, "code_quality": 0.7}
    },
    "escalation_rules": [
      {"condition": "confidence_spread > 0.3", "action": "escalate_to_human"},
      {"condition": "all_agents_below_threshold", "action": "escalate_to_human"},
      {"condition": "disagreement_on_critical_field", "action": "escalate_to_human"}
    ],
    "human_authority": "final_on_all_decisions"
  }
}
```

**Asimov's Laws apply here.** The First Law: no agent may, through action or inaction, allow harm: translates to: when in doubt, escalate to a human. The authority hierarchy must always have a human at the top, even if that human is only engaged for edge cases. This isn't a philosophical position: it's a practical one. Agents making autonomous decisions in a chain with no human escalation path is how you get compounding errors with no circuit breaker.

---

## Failure Modes in Multi-Agent Systems

### Agent Telephone

Context degrades with every handoff. Agent A understands the full nuance of the task. It summarizes for Agent B, which loses some nuance. Agent B summarizes for Agent C, which loses more. By the time Agent D acts, it's operating on a simplified, possibly distorted version of the original intent.

**The fix:** Don't chain summaries. Use structured state handoffs (Pattern 4) that preserve the full context at each stage. Let each agent access the original source materials, not just the previous agent's summary. Design the handoff protocol so that *nothing is lost*: the receiving agent gets everything, and its context window is the constraint to manage, not the handoff format.

### Authority Confusion

Agent A thinks it's in charge. Agent B also thinks it's in charge. Both make decisions. The decisions conflict. Neither defers. The system produces inconsistent output.

**The fix:** Explicit authority models (Pattern 5). Every multi-agent workflow must have an unambiguous answer to "who decides when agents disagree?" This should be declared at workflow design time, not negotiated at runtime.

### Feedback Collapse

In a single-agent system, the human provides direct feedback. In a multi-agent system, feedback gets diffused. If the final output is wrong, which agent made the error? The extractor? The analyzer? The orchestrator that chose the wrong delegation? Without clear attribution, feedback becomes noise.

**The fix:** Provenance chains (Pattern 3). Every element of the final output should trace back through the chain to the agent that produced it. When the human corrects an error, the correction should route to the specific agent (and specific step) that originated the error. This is how you maintain learning in multi-agent systems: targeted feedback, not broadcast corrections.

### Capability Drift

Agent B was good at security reviews six months ago. The codebase has changed. The vulnerability landscape has changed. Agent B's training data hasn't. The orchestrator still delegates security reviews to Agent B based on stale capability data.

**The fix:** Performance metadata in capability advertisements (Pattern 1) that's updated based on actual outcomes. If Agent B's security reviews have been overridden by humans 30% of the time in the last month, its accuracy metric should reflect that: and the orchestrator should notice.

### The Supervision Gap

Humans supervise the orchestrator agent. The orchestrator supervises the worker agents. But the human can't see what the workers are doing: they only see the orchestrator's summary. If the orchestrator misrepresents or misunderstands a worker's output, the human's supervision is compromised.

**The fix:** Audit trails that span the entire chain, accessible to the human. The human should be able to "drill down" from the orchestrator's summary through every worker's contribution, with full provenance. The orchestrator is not a trust boundary: it's a convenience layer. The human's authority extends through it.

---

<img src="/blog/agent-to-agent-affordances/03-conways-law.png" alt="Conway's Law applied to agent architectures" />

## Conway's Law for Agents

Conway's Law states that systems mirror the communication structure of the organizations that build them. There's a corollary for multi-agent systems: **your agent architecture will mirror your communication protocols.**

If your agents communicate through unstructured text, your system will behave like a team communicating through Slack messages: lots of context loss, frequent misunderstandings, over-reliance on shared assumptions.

If your agents communicate through structured contracts with explicit schemas, your system will behave like a well-run manufacturing line: clear handoffs, measurable quality, predictable flow.

The communication protocol *is* the architecture. Design it deliberately.

**MCP, A2A, and emerging standards** are early attempts at this. The Model Context Protocol defines how agents interact with tools and data sources. Google's Agent-to-Agent (A2A) protocol addresses direct agent coordination. These are important starts, but they're infrastructure: they define *how* agents can talk, not *what* they should say.

What's missing is the design layer above the protocol: the delegation contracts, the authority models, the confidence propagation rules, the handoff schemas. These are workflow-specific, domain-specific, and organization-specific. They're the standardized work instructions built on top of the communication infrastructure.

---

## The Factory Floor Model

Let me tie this back to the beginning.

Toyota didn't build a factory by making each machine as smart as possible and hoping they'd coordinate. They designed the *flow*: the sequence of operations, the handoff points, the quality checkpoints, the feedback loops, the authority hierarchy (any worker can stop the line). The machines were components. The system was designed.

Multi-agent AI systems need the same approach:

1. **Design the flow first.** What's the sequence of operations? What agents are involved? What are the handoff points? Map this before you build any individual agent.

2. **Standardize the interfaces.** Capability advertisements, delegation contracts, state handoffs, confidence propagation: these should be consistent across your agent ecosystem. One schema. One protocol. One vocabulary.

3. **Build in jidoka.** Every agent should be able to stop the flow and signal for help. Every handoff should include quality checks. The system should never produce output that has passed through a low-confidence stage without flagging it.

4. **Kaizen the whole system.** Measure flow metrics: end-to-end latency, handoff success rates, escalation rates, human correction rates per agent. Identify the constraint (Goldratt). Improve the constraint. Repeat.

5. **The human is the andon cord.** No matter how many agents are in the chain, the human must be able to see the full flow, understand any decision, and intervene at any point. Agent autonomy is a privilege earned through demonstrated reliability, not a default.

---

## Principles for Agent-to-Agent Design

1. **Structure over prose.** Agents communicating in natural language is like machines communicating through handwritten notes. It works, barely. Structured schemas are the engineering-grade alternative.

2. **Confidence compounds: track it.** Every handoff degrades certainty. If you're not tracking compound confidence, your system is more uncertain than it knows.

3. **Authority must be explicit.** "Who decides?" should have a clear, unambiguous answer at every point in every workflow. If you can't answer it, you have a design gap.

4. **Design the handoff, not just the agents.** The interfaces between agents are where value is created or destroyed. A brilliant agent with a poorly designed handoff protocol is a brilliant machine on a dysfunctional factory floor.

5. **Provenance is not optional.** Every output, every decision, every intermediate result must trace back through the chain to its origin. Without provenance, you can't debug, you can't attribute, and you can't learn.

6. **Humans remain the apex authority.** This is Asimov's First Law in engineering terms: the escalation hierarchy must always terminate at a human. Fully autonomous agent chains with no human circuit breaker are systems without an andon cord.

7. **The communication protocol is the architecture.** Conway's Law applies. Design the protocol deliberately, and the architecture follows. Neglect the protocol, and the architecture degrades.

---

## Conclusion

We've traveled a long way from Toyoda's loom.

In Part 1, we designed the trust relationship between a single agent and a single human: jidoka, applied to AI autonomy levels. In Part 2, we designed the perceptual interface where humans and agents coexist: bimodal affordances for two kinds of minds. Here, in Part 3, we've designed the coordination layer where agents work with each other: structured protocols for multi-agent collaboration.

The through-line is Norman's insight, extended: **design is about the relationship between an actor and its environment, made legible through affordances and signifiers.** That actor can be a human, an agent, or a system of agents. The environment can be a physical object, a user interface, or another agent's output. The design principles don't change. The surfaces do.

The teams that build effective multi-agent systems will be the ones that treat agent-to-agent interaction as a first-class design problem: not an engineering detail to be solved with bigger context windows and better prompts. They'll design the flow, standardize the interfaces, build in quality checkpoints, and keep humans in the loop where human judgment matters.

Toyota figured this out for manufacturing seventy years ago. The principles transfer. We just need to apply them.

---

## References

- Norman, D.: *The Design of Everyday Things* (1988)
- Ohno, T.: *Toyota Production System: Beyond Large-Scale Production* (1988)
- Goldratt, E.: *The Goal: A Process of Ongoing Improvement* (1984)
- Conway, M.: "How Do Committees Invent?" *Datamation* (1968)
- Asimov, I.: *I, Robot* (1950)
- Rembold, J.: ["Product Design in the Agentic Era"](https://bold.casa/blog/product-design-agentic-era/) (2026)
- Rembold, J.: ["Jidoka Trust Levels"](https://bold.casa/blog/jidoka-trust-levels/) (2026)
- Rembold, J.: ["Bimodal Affordances"](https://bold.casa/blog/bimodal-affordances/) (2026)
- Anthropic Engineering: ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)
- GitHub Next: ["Continuous AI"](https://githubnext.com/projects/continuous-ai) (2026)
- GitHub Next: ["Welcome to Peli's Agent Factory"](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/) (2026)
- Google: [Agent-to-Agent (A2A) Protocol](https://google.github.io/A2A/) (2025)
- Anthropic: [Model Context Protocol (MCP)](https://modelcontextprotocol.io) (2024)

---

*Part 4 of the "Design in the Agentic Era" series.*


*This is Part 4 of the Design in the Agentic Era series. See also: [Part 1: Product Design in the Agentic Era](/blog/product-design-agentic-era/) · [Part 2: Jidoka Trust Levels](/blog/jidoka-trust-levels/) · [Part 3: Bimodal Affordances](/blog/bimodal-affordances/) · [Part 5: Agent Proprioception](/blog/agent-proprioception/)*
