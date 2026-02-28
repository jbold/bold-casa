+++
title = "Jidoka Trust Levels: When AI Agents Pull the Andon Cord"
date = 2026-02-26
description = "Applying Toyota's jidoka principle to AI agent autonomy. A trust-level framework from full human control to full agent autonomy, with the critical insight: the agent must be able to stop itself."
[taxonomies]
tags = ["product-design", "ai-infrastructure", "agentic", "trust", "jidoka"]
[extra]
og_image = "/blog/jidoka-trust-levels/01-loom-to-ai.png"

[extra.nosh]
type = "essay"
language = "en"
authors = [{ name = "John Rembold", url = "https://bold.casa" }]

[extra.nosh.content]
body = "Deep dive into jidoka (autonomation) applied to AI agents. Defines five trust levels from manual to full autonomy, explores transition design, and argues that the ability to stop is more important than the ability to act."
key_findings = [
    "Jidoka (autonomation) is automation with a human touch: the machine stops itself when something goes wrong",
    "Five trust levels: Manual, Prompted, Guarded, Supervised, Autonomous",
    "Trust levels should be per-task, not per-agent: the same agent may operate at Level 4 for file reads and Level 1 for financial transactions",
    "The critical design question is not 'how much can the agent do?' but 'can the agent stop itself?'",
    "Transition between levels requires earned trust through demonstrated competence, not configuration flags"
]
+++


In 1896, Sakichi Toyoda invented an automatic loom that did something no loom had done before: it stopped itself when a thread broke.

<!-- more -->

This wasn't a minor improvement. Before Toyoda's loom, a single broken thread could ruin yards of fabric before anyone noticed. Factories employed workers whose entire job was watching looms for defects. Toyoda's insight wasn't about making looms faster: it was about making them *trustworthy*. A machine that knows when it's failing and stops itself is fundamentally different from one that runs blind.

Toyota later codified this as *jidoka*: 自働化: "automation with a human touch." The machine detects abnormality. It stops. It signals. A human investigates, resolves, and the machine resumes. The human's judgment is preserved where it matters most: at the point of failure.

I've been building AI agent systems and working on enterprise products in healthcare, cloud infrastructure, and adtech, and I'm increasingly convinced that jidoka is the most important design pattern for the AI age. Not because AI systems break like looms: they break in far more interesting ways. But because the core problem is identical: **how do you design a system where automation and human judgment coexist, and where trust is earned incrementally rather than assumed?**

The highest-leverage design work in any AI product isn't the model, the prompt engineering, or the UI. It's the trust architecture: the system that determines what the agent is allowed to do, when it must stop and ask, and how it earns the right to do more.

---

<img src="/blog/jidoka-trust-levels/01-loom-to-ai.png" alt="From loom to AI: the Jidoka principle" />

## The Six Levels

<img src="/blog/product-design-agentic-era/03-trust-calibration.png" alt="Trust calibration: Jidoka for the AI age — six levels from full manual to full autonomy" />

In the [parent article](https://bold.casa/blog/product-design-agentic-era/), I introduced a trust calibration framework with six levels. Here, I want to go deep on each one: not just what the agent does, but what the human does, what the interface looks like, what the permission model requires, and what the audit trail captures.

These aren't theoretical. They're design specifications.

### Level 0: Full Manual

**What the agent does:** Nothing. The system is entirely human-operated.

**What the human does:** Everything: data entry, processing, review, decision-making, execution.

**What the UI looks like:** Traditional software. Forms, dashboards, manual workflows. No AI indicators, no confidence scores, no suggestions.

**Permission model:** No agent permissions exist. The system may not even have an agent component deployed.

**Audit trail:** Standard application logging. User actions, timestamps, data changes.

**Example:** A hospital's intake process before any AI integration. Nurses manually transcribe patient information from faxed referral documents into the EHR. Every field is hand-entered, every decision is human.

**Why it matters:** Level 0 is your baseline. Every AI product starts here in the user's mind, whether or not the product has AI capabilities from day one. Users are doing the work manually. They have workflows, heuristics, and muscle memory. If your Level 1 doesn't respect those existing patterns, adoption dies on contact.

---

### Level 1: Assistive

**What the agent does:** Extracts, organizes, and presents information. Makes no decisions. Changes no state.

**What the human does:** Everything they did at Level 0, but with better-organized inputs. The agent is a research assistant: it fetches and arranges, but the human drives.

**What the UI looks like:** Side panels, extraction summaries, highlighted text, organized data views. Clear visual separation between "agent extracted this" and "system of record says this." No action buttons on agent output: the human must manually transfer information.

**Permission model:** Read-only. The agent can access source documents and display results. It cannot write to any system of record, trigger any workflow, or modify any data.

**Audit trail:** What the agent extracted, from which sources, at what timestamp. What the human did with the extraction (copied, ignored, corrected). Extraction accuracy metrics over time.

**Example:** A financial analyst reviewing quarterly earnings. The agent extracts key figures from 10-K filings, organizes them by category, highlights year-over-year changes. The analyst reviews every number, cross-references against their own calculations, and manually enters figures into their model. The agent never touches the spreadsheet.

**Design insight:** Level 1 is where trust begins forming. The critical metric isn't extraction accuracy: it's *perceived* accuracy. If the agent is right 95% of the time but the user catches it being wrong on something obvious in the first week, trust formation stalls. Design for early wins: prioritize accuracy on the fields users check first.

---

### Level 2: Suggestive

**What the agent does:** Proposes specific actions with confidence indicators. "I think this field should be 'Type 2 Diabetes' (confidence: 0.94)." Presents options when uncertain. Still changes no state without human approval.

**What the human does:** Reviews proposals, approves or rejects each one, corrects errors. The cognitive load shifts from "figure out the answer" to "verify this answer." This is a meaningful reduction, but the human remains the decision-maker for every action.

**What the UI looks like:** Approval queues. Each proposed action has an accept/reject/edit interface. Color-coded confidence: green (high), yellow (medium), red (low: agent is explicitly flagging uncertainty). Batch approval for high-confidence routine items. Individual review for anything flagged.

**Permission model:** Propose-only. The agent can suggest state changes but cannot execute them. Every action requires explicit human approval. The system must make it *impossible* for approved actions to execute without the human's deliberate click: not just unlikely, impossible.

**Audit trail:** Every proposal: what was proposed, confidence score, what the human decided (approved/rejected/modified), time to decision, final value vs. proposed value. This is the data that enables transition to Level 3.

**Example:** An agent reviewing incoming customer support tickets. It proposes a category, priority, and suggested response for each ticket. The support rep sees: "Category: Billing (0.91) | Priority: Medium (0.87) | Suggested response: [draft]." They can accept the category with one click, bump the priority, and edit the response before sending. Nothing goes to the customer without human approval.

**Design insight:** Level 2 is where you learn whether your trust levels are calibrated correctly. The approval/rejection ratio tells you everything. If humans approve 99% of proposals without editing, you're ready for Level 3 on those task types. If they're editing 40%, your agent isn't ready and the approval workflow is creating friction without adding value. The audit trail at Level 2 is your most valuable dataset.

---

### Level 3: Supervised Autonomy

**What the agent does:** Handles routine actions automatically based on rules derived from Level 2 approval patterns. Escalates exceptions: anything outside established patterns, below confidence thresholds, or matching known edge-case signatures.

**What the human does:** Reviews exceptions. Spot-checks routine completions on a sampling basis. Defines and adjusts the rules that determine what's "routine" vs. "exception." The human's role shifts from "approve every action" to "manage the boundary between automatic and escalated."

**What the UI looks like:** Two distinct zones. An **activity feed** showing what the agent did automatically (scannable, low-attention). An **exception queue** requiring active review (high-attention, similar to Level 2's approval interface). Dashboard showing automation rate, exception rate, accuracy metrics. Clear "override" controls to pull any automated action back for review.

**Permission model:** Conditional write access. The agent can execute actions that meet defined criteria (confidence above threshold, task type in approved list, no anomaly flags). All other actions require human approval. The criteria must be explicit, auditable, and adjustable: not learned implicitly.

**Audit trail:** Full action log with automated vs. escalated classification. For automated actions: the rule that authorized automation, the confidence score, any anomaly checks performed. For exceptions: same data as Level 2. Periodic accuracy reports comparing automated actions against ground truth (from spot-checks).

**Example:** A code review agent in a development pipeline. For PRs that only modify test files, update documentation, or make formatting changes: and where the diff is under 50 lines and all CI checks pass: the agent auto-approves with a "bot-approved" label. For PRs touching production logic, modifying security-sensitive files, or exceeding complexity thresholds, the agent posts a detailed review comment and flags for human reviewer. The engineering lead adjusts thresholds weekly based on the accuracy dashboard.

**Design insight:** Level 3 is where jidoka lives most naturally. The agent runs autonomously on routine work. When it detects something abnormal: the thread breaks: it stops and pulls the andon cord. The human investigates. This is Toyota's pattern translated directly. The design challenge is getting the anomaly detection right. Too sensitive, and the exception queue floods with false positives (alert fatigue). Too loose, and bad actions slip through (trust erosion). This calibration is ongoing design work, not a one-time setting.

---

### Level 4: Monitored Autonomy

**What the agent does:** Handles the vast majority of the workflow independently. Makes complex decisions, chains multi-step actions, handles most exceptions that Level 3 would have escalated. Escalates only true edge cases: novel situations with no pattern match, high-stakes decisions above defined thresholds, or situations where the agent's own uncertainty model flags genuine ambiguity.

**What the human does:** Monitors aggregate metrics rather than individual actions. Reviews periodic reports. Investigates anomalies flagged by statistical process control (deviation from expected patterns). Handles the rare escalation. Focuses primarily on system tuning: adjusting thresholds, updating rules, expanding the agent's authorized scope based on performance data.

**What the UI looks like:** Operations dashboard, not task queue. Charts showing throughput, accuracy trends, exception rates, confidence distributions. Drill-down capability into any individual action. Alert system for statistical anomalies ("exception rate jumped 3x in the last hour" or "confidence scores trending down on document type X"). The human interacts with the *system*, not with individual tasks.

**Permission model:** Broad write access with audit. The agent can execute complex, multi-step workflows within its authorized domain. Hard boundaries still exist: financial thresholds, irreversible actions, cross-system writes above certain impact levels. The permission model is defined by *what the agent cannot do* rather than what it can: a whitelist has become a blacklist with guardrails.

**Audit trail:** Complete action history with full provenance chain. Statistical process control data. Performance metrics against ground truth (sampled). Model drift detection. Every action is reconstructable: if a human needs to understand why the agent made a decision six months ago, the audit trail tells the full story.

**Example:** A healthcare document processing system handling incoming referrals for a large hospital network. The agent receives faxed documents, extracts patient demographics, clinical history, referring provider information, and insurance details. It cross-references against existing patient records, flags potential duplicates, routes to the appropriate department based on clinical content, and pre-populates the intake form in the EHR. For 85% of referrals, this is fully automated. The remaining 15%: illegible documents, conflicting patient identifiers, unusual clinical presentations: are escalated. The intake coordinator monitors a dashboard, reviews escalations, and runs a weekly accuracy audit on a random 5% sample of automated completions.

**Design insight:** Level 4 requires a fundamental UI shift. The human is no longer a participant in the workflow: they're a supervisor of the system. If your interface still looks like a task queue, you've failed the transition. The biggest risk at Level 4 isn't agent error: it's human complacency. When the system works well 95% of the time, the 5% of escalations get rubber-stamped. This is "human in the loop theater" manifesting at a higher level. Design against it: require meaningful interaction on escalations (not just "approve"), rotate what gets escalated, and include occasional "known-answer" test cases to keep human reviewers calibrated.

---

### Level 5: Full Autonomy

**What the agent does:** Operates independently. Handles all routine work, most exceptions, and makes judgment calls within its authorized domain. Maintains its own performance monitoring. Self-escalates only for truly novel situations or decisions with irreversible consequences above defined thresholds.

**What the human does:** Sets policy. Reviews system performance periodically (weekly, monthly). Investigates incidents. Adjusts the system's operating parameters based on business changes, regulatory updates, or performance drift. The human's relationship to the system is governance, not operation.

**What the UI looks like:** Governance interface. Policy configuration. Performance reports. Incident investigation tools. Compliance audit views. The operational UI may not exist for the human at all: it exists for the agent. The human interface is strategic, not tactical.

**Permission model:** Full operational authority within defined domain boundaries. Hard limits on irreversible actions, cross-domain operations, and financial thresholds remain. The permission model is policy-based and auditable: a human could reconstruct exactly what the agent is and isn't authorized to do at any point in time.

**Audit trail:** Comprehensive, immutable, and independently verifiable. Full provenance for every decision. Performance metrics against defined SLAs. Anomaly detection with automated alerting. Regulatory compliance reporting. The audit trail at Level 5 isn't just for debugging: it's a legal and compliance artifact.

**Example:** Honestly? Very few systems should operate at Level 5 today, and I'm skeptical about most claims that they do. The closest real examples are high-frequency trading systems operating within defined risk parameters, or mature CI/CD pipelines that deploy to production without human approval. Even these have hard stops: risk limits, rollback triggers, circuit breakers.

For regulated industries: healthcare, finance, energy: Level 5 may never be appropriate for core decision-making workflows. It might be appropriate for well-bounded operational tasks: log analysis, routine system maintenance, standard report generation. The key insight is that Level 5 is not the goal. The right level is the one that optimizes for the actual constraint in the system, which often isn't human review speed.

**Design insight:** The biggest mistake teams make with Level 5 is treating it as the destination. It's not. The optimal trust level depends on the cost of errors, the maturity of the system, regulatory requirements, and user expectations. A well-designed Level 3 system often outperforms a poorly designed Level 5 system, because the human-in-the-loop catches errors that the fully autonomous system propagates.

---

<img src="/blog/jidoka-trust-levels/02-transition-design.png" alt="Transition design patterns for trust calibration" />

## Transition Design

The levels are useful as a framework, but the hardest design problem isn't any individual level: it's the transitions between them.

### Per-User Trust Progression

Different users earn different trust levels with the system based on their experience and accuracy. A new hire starts at Level 1: the system shows everything, suggests nothing. After two weeks of demonstrated accuracy, the system begins making suggestions (Level 2). After a month with high approval rates, routine tasks automate (Level 3).

This mirrors how trust works between humans. A new employee gets more oversight. A veteran gets more autonomy. The system should be designed to learn trust at the individual level.

**Design requirement:** User-specific trust profiles, tracked over time, with explicit criteria for level transitions. The user should be able to see their own trust level and understand what drives it.

### Per-Task Trust

Not all tasks are equal. Categorizing an email is lower-stakes than authorizing a payment. Within the same system, the same user might operate at Level 4 for categorization and Level 2 for financial decisions.

**Design requirement:** Task taxonomy with risk classification. Trust levels assigned per task type, adjustable based on accumulated performance data for that specific task-user combination.

### Per-Confidence Trust

The agent's own uncertainty should dynamically adjust the trust level for individual actions. A high-confidence extraction (0.97) might proceed automatically at Level 3. The same field extracted at 0.62 confidence should auto-downgrade to Level 2 (present for approval) or even Level 1 (present but don't suggest).

**Design requirement:** Confidence-to-level mapping that's transparent and adjustable. The agent must be well-calibrated: when it says 0.95, it should be right 95% of the time. Calibration is itself a design and engineering challenge that requires ongoing measurement.

### The Ratchet Problem

Trust goes up slowly and drops fast. This is true between humans, and it should be true in trust-calibrated systems. If the agent makes a significant error at Level 3, the system should drop back to Level 2 for that task type: and the re-earning of Level 3 should take longer than the original progression.

This feels punitive, but it's correct. Toyoda's loom didn't get a "three strikes" policy. One broken thread, full stop. The cost of rebuilding trust is always higher than the cost of building it initially, and the system should reflect that asymmetry.

**Design requirement:** Asymmetric trust transitions: fast downgrade, slow upgrade. Incident severity weighting. Cool-down periods after trust downgrades before re-evaluation.

---

## Anti-Patterns

### The "Just Automate It" Fallacy

"We're spending $500K/year on manual document processing. Let's deploy AI and eliminate 80% of that cost."

This is a business case, not a design plan. Teams that jump to Level 4 or 5 without building through Levels 1-3 fail predictably. Users don't trust the system. Edge cases aren't understood. The audit trail doesn't exist. When the first visible error occurs: and it will: there's no trust reservoir to draw from, and the entire deployment is at risk.

**The jidoka principle:** You don't start with full automation. You start with automation that stops and signals, and you earn the right to reduce human intervention through demonstrated reliability.

### "Human in the Loop" Theater

The system is nominally at Level 2 or 3: humans approve every action. But the UI makes approval so frictionless (one click, no context) that humans approve 99.8% of proposals in under two seconds. They're not reviewing. They're clicking.

This is worse than Level 4, because it has all the costs of human involvement (delay, labor) with none of the benefits (actual judgment). It creates a false sense of safety while providing no real oversight.

**The fix:** Design approval interfaces that require *engagement*, not just confirmation. Show relevant context by default. Require the reviewer to identify the key decision point, not just click "approve." Randomly insert test cases where the correct answer is "reject" to measure actual review quality.

### The Frozen Pilot

The system launched at Level 1 eighteen months ago. It works. Users like the extraction. Nobody ever designed the transition to Level 2. There's no approval/rejection data to analyze because the system never proposed anything. The pilot is "successful" but captures a fraction of its potential value.

**The fix:** Design the level transitions *before* you ship Level 1. Include data collection for transition decisions from day one. Set explicit criteria: "When extraction accuracy exceeds 90% on field X for 30 days, we enable suggestions for that field."

### Over-Automation of Edge Cases

The agent handles 90% of cases well. Instead of routing the remaining 10% to humans, the team spends six months engineering the agent to handle edge cases: diminishing returns, compounding complexity, and growing fragility. The effort spent getting from 90% to 95% exceeds the cost of having humans handle the 10%.

**The jidoka insight:** The loom doesn't try to fix the broken thread. It stops and signals. Some tasks are better handled by humans, permanently. The design skill is knowing where that boundary lives and accepting it.

---

<img src="/blog/jidoka-trust-levels/03-toyota-principles.png" alt="Toyota's deeper principles applied to AI agents" />

## Toyota's Deeper Principles

Jidoka doesn't operate in isolation within the Toyota Production System. Several complementary principles apply directly to AI trust design.

### Andon Cord → Agent Escalation

Toyota's andon cord: a physical cord any worker can pull to stop the production line: is both a mechanism and a cultural statement. It says: quality problems are everyone's responsibility, and stopping to fix a problem is more valuable than continuing to produce defects.

In agent systems, the escalation mechanism is the andon cord. But it only works if the culture supports it. If agents are penalized for escalating (measured on automation rate rather than accuracy), they'll suppress uncertainty. If humans are frustrated by escalations (too many, too trivial), they'll stop reviewing carefully.

**Design the incentives around escalation, not just the mechanism.**

### Poka-Yoke → Guardrails and Structured Outputs

Poka-yoke: error-proofing: is Toyota's principle of making mistakes physically impossible rather than relying on vigilance. A USB connector that only fits one way. A car that won't shift out of park unless the brake is pressed.

For AI agents, poka-yoke manifests as:
- Structured output schemas that make malformed responses impossible
- Input validation that catches data quality issues before the agent processes them
- Hard guardrails that prevent the agent from taking certain actions regardless of confidence
- Type systems and state machines that make illegal state transitions unrepresentable

The best guardrails aren't rules the agent follows: they're constraints that make violations structurally impossible.

### Respect for People → Genuine Human Authority

Toyota's "respect for people" pillar is often misunderstood as being nice to workers. It's actually about respecting human judgment and creating systems where human intelligence is applied to problems that require it: not wasted on tasks machines can handle.

In trust-calibrated AI systems, this means the human's review isn't a rubber stamp. When the system escalates to a human, it's because the human's judgment genuinely adds value. The escalation interface should provide full context and make the human's decision *meaningful*, not perfunctory.

If you've designed a system where human review adds no value: where humans approve everything without exception: either your agent is ready for a higher trust level, or your review interface has failed.

### Kaizen → Trust Level Evolution

The trust levels themselves should improve over time. The thresholds should get more precise. The edge case detection should get smarter. The human review process should get more efficient.

This requires measurement, feedback, and deliberate iteration: the same continuous improvement cycle Toyota applies to manufacturing. Schedule periodic reviews of your trust calibration. Ask: Are the right things being escalated? Is the human review actually catching errors? Are there tasks stuck at a level below their potential?

---

## First Principles for Trust Design

1. **Earn trust through transparency, not assertion.** Show your work. Confidence scores, provenance chains, reasoning traces. Users who can see *why* the agent decided something trust the system faster than users who are told to trust it.

2. **Design the transition before you ship the level.** Every trust level should include the data collection and success criteria needed to progress to the next level. A Level 1 deployment without a Level 2 transition plan is an expensive pilot that goes nowhere.

3. **Asymmetric trust dynamics are correct.** Trust builds slowly and breaks fast. Design for this explicitly. Quick downgrades, slow upgrades, cool-down periods.

4. **The human's time is the system's most expensive resource.** Every human review should add genuine value. If it doesn't, either automate it (raise the trust level) or fix the review interface (make engagement meaningful). Wasted human attention is the worst form of waste.

5. **Measure calibration, not just accuracy.** An agent that's right 90% of the time and *knows* it's right 90% of the time is more trustworthy than one that's right 95% of the time but claims 99% confidence. Well-calibrated uncertainty is the foundation of trust design.

6. **Design for the error, not just the happy path.** The trust architecture reveals itself when things go wrong. How does the system behave when the agent makes a confident but incorrect decision? When the human reviewer misses an error? When the data quality degrades? The failure modes define the trust design more than the success modes.

7. **The right level is the one that optimizes for the actual constraint.** Level 5 is not the goal. The goal is a system where the bottleneck has shifted from processing to decision-making: where human attention is applied to the highest-value judgments, and everything else flows. Sometimes that's Level 3 forever.

---

## Conclusion

Toyoda's loom was revolutionary not because it was faster or cheaper than other looms. It was revolutionary because it changed the relationship between the machine and the human. The human was no longer a monitor watching for defects. The human was a problem-solver, called upon only when their judgment was needed.

That's the design challenge for every AI product being built today. Not "how do we automate more?" but "how do we design the relationship between agent capability and human judgment so that both are applied where they create the most value?"

The trust levels are a framework for making that design explicit, measurable, and improvable. Start conservative. Earn the right to automate. Stop when the thread breaks. Signal for help. Resume when the problem is solved.

Jidoka. Automation with a human touch. It was the right design pattern in 1896, and it's the right design pattern now.

---

## References

- Ohno, T.: *Toyota Production System: Beyond Large-Scale Production* (1988)
- Norman, D.: *The Design of Everyday Things* (1988)
- Liker, J.: *The Toyota Way* (2004)
- Rembold, J.: ["Product Design in the Agentic Era"](https://bold.casa/blog/product-design-agentic-era/) (2026)
- Anthropic Engineering: ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025)
- Parasuraman, R. et al.: "A Model for Types and Levels of Human Interaction with Automation," *IEEE Transactions on Systems, Man, and Cybernetics* (2000)
- SAE International: J3016: Taxonomy and Definitions for Terms Related to Driving Automation Systems (2021)
- Lee, J.D. & See, K.A.: "Trust in Automation: Designing for Appropriate Reliance," *Human Factors* (2004)

---

*Part 2 of the "Design in the Agentic Era" series.*


*This is Part 2 of the Design in the Agentic Era series. See also: [Part 1: Product Design in the Agentic Era](/blog/product-design-agentic-era/) · [Part 3: Bimodal Affordances](/blog/bimodal-affordances/) · [Part 4: Agent-to-Agent Affordances](/blog/agent-to-agent-affordances/) · [Part 5: Agent Proprioception](/blog/agent-proprioception/)*
