+++
title = "Bimodal Affordances: Designing for Two Kinds of Minds"
date = 2026-02-26
description = "How to design interfaces that serve both human users and AI agents from the same source of truth. Norman's framework extended, five design patterns, and the accessibility parallel."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "design-patterns"]
[extra]
og_image = "/blog/bimodal-affordances/01-two-minds.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "Deep dive into bimodal interface design for human-agent systems. Extends Norman's framework to dual audiences, defines five design patterns, maps the accessibility parallel, and provides concrete implementation guidance."
key_findings = [
    "Every interface element now has two consumers: humans who perceive visually and agents who parse structurally",
    "Five patterns: Semantic Duality, Progressive vs Full Context, Structured Metadata Shadows, Confidence as First-Class, Bidirectional Signifiers",
    "Norman's affordances, signifiers, mapping, feedback, and conceptual models all extend naturally to dual audiences",
    "The accessibility parallel: designing for the second audience improves the experience for the first",
    "Divergence between human and agent views is the root of all coherence failures"
]
+++

*Design in the Agentic Era, Part 2*

Here's a thought experiment. You're designing a dashboard that shows the status of a document review. A human reviewer will look at it. An AI agent will also consume it, deciding what to process next and how to prioritize its queue.

The human needs a color-coded badge: green for approved, orange for needs review, red for rejected. Clear, scannable, immediate.

The agent needs structured data: `{ status: "needs_review", confidence: 0.73, assigned_to: "agent_4", sla_hours: 4 }`. Parseable, unambiguous, actionable.

Same information. Two completely different perceptual channels. And if they diverge (the badge says "approved" but the structured data says "needs_review"), you have a coherence failure that neither audience can detect on their own.

<!-- more -->

<img src="/blog/bimodal-affordances/01-two-minds.png" alt="Diagram showing the same review status information rendered two ways: a visual badge for human perception and a structured JSON payload for agent parsing, both from the same source of truth" style="width:100%;border-radius:10px;margin:1.5rem 0;">

This is the core challenge of bimodal design: building interfaces that serve two fundamentally different kinds of consumers from a single source of truth.

## Extending Norman's Framework

Don Norman's *The Design of Everyday Things* gave us the vocabulary for human-centered design: affordances, signifiers, mapping, feedback, conceptual models. These concepts were built for a world where the user was always human. They still apply. They just need a second channel.

<img src="/blog/bimodal-affordances/03-norman-mapping.png" alt="Table mapping Norman's five design concepts (affordances, signifiers, mapping, feedback, conceptual model) to their bimodal extensions and agent-specific expressions" style="width:100%;border-radius:10px;margin:1.5rem 0;">

### Affordances Become Bimodal

An affordance is a possible action between an object and a user. A button affords clicking. A text field affords typing. In bimodal design, the question becomes: what does this element afford to *each* audience?

A "Flag for Review" button affords a human the action of escalating a document. For an agent, the same action needs to be available as a callable function with defined parameters, return types, and side effects. If the human can flag but the agent can't (or vice versa), you have an affordance asymmetry that will eventually cause problems.

**Design principle:** Every action available to one audience should have a corresponding action available to the other. The expression differs; the capability should not.

### Signifiers Need Dual Channels

A signifier is a perceivable indicator of an affordance. A door handle signifies "pull here." A grayed-out button signifies "not available."

Humans perceive signifiers visually: color, position, typography, iconography. Agents perceive signifiers structurally: field names, schemas, type annotations, documentation files.

The danger is building signifiers for one audience and assuming the other will figure it out. A beautifully designed UI with no API schema. A comprehensive API with no human-readable documentation. Both are one-channel designs pretending to serve two audiences.

**Design principle:** Every signifier must exist in both channels. Visual indicators need structural equivalents. Structured metadata needs human-readable surface expression.

### Mapping Must Be Coherent

Norman's mapping principle says the relationship between controls and their effects should be intuitive. Light switches should map spatially to the lights they control.

In bimodal design, coherent mapping means: the human's "Approve" button and the agent's `POST /approve` endpoint must produce *identical* state transitions. Same validation rules. Same side effects. Same audit trail entry. If the human approval triggers a notification but the API call doesn't, your mapping has diverged.

This sounds obvious. In practice, it's the most common failure mode. The UI team builds the human flow. The API team builds the agent flow. They drift. Nobody notices until an audit reveals that agent-approved documents skipped a validation step.

**Design principle:** One state machine. Two interfaces into it. Test for parity continuously.

### Feedback Flows Both Ways

When a human clicks "Submit," they expect feedback: a success toast, a loading spinner, an error message. When an agent calls an endpoint, it expects feedback: a status code, a response body, an event emission.

Bimodal feedback means the same event produces appropriate signals for both channels simultaneously. Document approved? The human sees the badge change to green. The agent receives `{ event: "status_change", new_status: "approved", timestamp: "..." }`. Same event, dual expression.

**Design principle:** Every state change should emit feedback in both channels from the same event source.

## Five Bimodal Design Patterns

<img src="/blog/bimodal-affordances/02-patterns.png" alt="Five bimodal design patterns: Semantic Duality, Progressive vs Full Context, Structured Metadata Shadows, Confidence as First-Class Element, and Bidirectional Signifiers, with the accessibility parallel" style="width:100%;border-radius:10px;margin:1.5rem 0;">

### 1. Semantic Duality

One data source, two renderings. The underlying data model is the single source of truth. The human view and the agent view are both projections of that model, optimized for their respective perceptual channels.

This is the foundational pattern. If you get nothing else right, get this right. The moment you have two data sources (one for the UI, one for the API), you've created a divergence vector that will eventually bite you.

### 2. Progressive vs. Full Context

Humans benefit from progressive disclosure: show a summary, let them drill into details. Agents typically want the full payload immediately, because they can parse it cheaply and need complete context for decision-making.

The trick is making sure the human's expanded view matches the agent's full view. If a human drills into a record and sees different data than what the agent received, trust in the system erodes from both sides.

### 3. Structured Metadata Shadows

Every human action should cast a "structured shadow": metadata that captures the action in machine-parseable form. When a human clicks "Flag for Review," the shadow might be: `{ action: "flag_review", triggered_by: "human", sla_hours: 4, audit_event: true }`.

The key constraint: no shadow without a surface. If structured data exists that has no human-visible equivalent, you've created a hidden capability that undermines oversight. Every agent-accessible action must have a human-visible manifestation, even if the human rarely uses it directly.

### 4. Confidence as First-Class Element

In systems where AI agents contribute to decisions, confidence isn't metadata. It's a primary affordance. The interface should treat it accordingly.

For humans: color-coded indicators (green/yellow/red), natural language qualifiers ("high confidence," "please verify"), visual weight that draws attention to uncertain items.

For agents: numerical scores with calibration data, uncertainty intervals, trend information, provenance of the confidence calculation.

How much to expose depends on the [trust level](/blog/jidoka-trust-levels/). At Level 2 (suggestive), humans need granular confidence data to make approval decisions. At Level 4 (monitored autonomy), humans need trend data to spot systemic calibration drift.

### 5. Bidirectional Signifiers

When a human corrects an agent's output, that correction should flow back as a structured learning signal: what was wrong, what's correct, why it was wrong, and the human's confidence in the correction.

This transforms the correction interface from a simple "edit this value" interaction into a training data pipeline. The human is simultaneously fixing the immediate error and improving the system's future performance.

## The Accessibility Parallel

There's a direct parallel to the accessibility movement in web design. For years, designers built for sighted mouse-users and treated screen reader support as an afterthought. Then came a shift: design semantically from the ground up, and both audiences benefit.

The same evolution is happening with AI agents:

**Phase 1:** Design for humans only. Agents scrape UIs, guess at state, and break when layouts change.

**Phase 2:** Build separate agent interfaces. APIs maintained independently from UIs, often diverging in capability and behavior.

**Phase 3:** Bimodal from the ground up. Semantic structure serves both audiences from a shared foundation. The human view and the agent view are projections, not separate systems.

The accessibility insight applies here too: designing for the second audience improves the experience for the first. Semantic structure isn't a tax. When you build a system with clean data models, explicit state machines, and well-defined transitions, the human UI gets better too. Cleaner architecture produces clearer interfaces.

## Implementation Checklist

For teams starting to think bimodally:

1. **Audit your state machines.** Can every state transition be triggered by both a human action and an API call? Do they produce identical results?

2. **Check your signifiers.** Does every visual indicator have a structured equivalent? Does every API field have a human-visible manifestation?

3. **Test for parity.** Write integration tests that perform the same action through both channels and verify identical outcomes.

4. **Design confidence surfaces.** If your system involves AI decisions, confidence needs to be a first-class UI element, not a tooltip.

5. **Build the feedback loop.** Human corrections should produce structured training data, not just fixed values.

6. **Start from the data model.** The schema is the source of truth. Both views project from it. Never build the views first and try to reconcile them later.

## References

- Norman, D. *The Design of Everyday Things*, Revised Edition (2013)
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.2* (2023)
- Rembold, J. ["Product Design in the Agentic Era"](/blog/product-design-agentic-era/) (2026)
- Rembold, J. ["Jidoka Trust Levels"](/blog/jidoka-trust-levels/) (2026)
- Google DeepMind. "Scalable Oversight for AI Systems" (2024)

---

*Part 2 of the "Design in the Agentic Era" series. Previous: [Jidoka Trust Levels](/blog/jidoka-trust-levels/). Next: [Agent-to-Agent Affordances](/blog/agent-to-agent-affordances/)*
