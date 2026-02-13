+++
title = "Agent Memory Part 2: Hybrid Search, Graph Recall, and Memory Consolidation"
date = 2026-02-13
description = "We built the 'What's Next' — hybrid BM25+vector search, graph-aware recall, auto-ingest, and extractive memory consolidation. 107 tests, zero frameworks."
[taxonomies]
tags = ["openclaw", "surrealdb", "embeddings", "gpu", "self-hosted", "ai-infrastructure", "memory", "graph-database"]
[extra]
og_image = ""

[extra.nosh]
type = "tutorial"
language = "en"

[extra.nosh.content]
body = "Part 2 of building a local AI agent memory system. Adds hybrid search (BM25 + vector + graph fusion with RRF), graph-aware recall with concept traversal, auto-ingest from markdown files, and extractive memory consolidation — all running locally, no LLM API calls, no frameworks."
duration = "3-4 hours"
prerequisites = [
    "Part 1 completed (SurrealDB + embedding server running)",
    "NVIDIA GPU with 8GB+ VRAM",
    "Python 3.11+",
    "Familiarity with SurrealQL basics"
]
key_findings = [
    "Reciprocal Rank Fusion (RRF) outperforms any single retrieval modality for agent memory recall",
    "Graph traversal adds context that pure vector search misses — related concepts, temporal chains, decision trails",
    "Extractive consolidation (no LLM calls) is fast, deterministic, and good enough for memory compaction",
    "Auto-ingest with content hashing means only changed sections get re-embedded — efficient and idempotent",
    "107 tests across 4 modules, all passing. This is production code, not a notebook demo"
]

[[extra.nosh.content.steps]]
title = "Build hybrid search with RRF fusion"
text = "Combine vector similarity, BM25 keyword search, and graph boost into a single ranked result set."

[[extra.nosh.content.steps]]
title = "Build graph-aware recall"
text = "Traverse concept graphs and temporal chains to find contextually rich memories."

[[extra.nosh.content.steps]]
title = "Build auto-ingest pipeline"
text = "Watch markdown files, chunk by section, embed via GPU, upsert into SurrealDB with concept auto-linking."

[[extra.nosh.content.steps]]
title = "Build memory consolidation"
text = "Merge old daily notes into distilled long-term entries using extractive summarization — no LLM required."

[[extra.nosh.content.steps]]
title = "Wire it all into OpenClaw"
text = "Event-driven architecture: ingest on session start, consolidation on heartbeat, search on demand."

[extra.nosh.content.cost_data]
total = "$0 — all local inference, no LLM calls"
embedding_model = "Qwen3-Embedding-4B (Apache 2.0, free)"
database = "SurrealDB (BSL 1.1, free for self-hosted)"
hardware_used = "NVIDIA RTX 5070 Ti Mobile (12GB VRAM)"
llm_calls = "Zero — consolidation uses extractive methods"
+++

*This is Part 2. If you haven't read it yet, start with [Part 1: Zero-Cost AI Agent Memory →](/blog/local-gpu-memory-for-ai-agents/)*

In [Part 1](/blog/local-gpu-memory-for-ai-agents/), I gave my AI agent, Kit, semantic memory — local GPU embeddings, SurrealDB, and a thin OpenAI-compatible server. The post ended with a "What's Next" section listing four features I hadn't built yet.

This post is the receipt. All four are done. 107 tests passing. No frameworks. No LLM API calls for any of it.

Here's what the "What's Next" became:

| Promised | Built | Lines of Code |
|----------|-------|---------------|
| Hybrid search | BM25 + vector + graph fusion with RRF | 238 |
| Graph-aware recall | Concept traversal + temporal chains | 311 |
| Auto-ingest | Markdown chunker + content-hashed upserts | 309 |
| Memory consolidation | Extractive summarization + concept dedup | 408 |

---

## The Motivation

After Part 1, Kit could search memories by semantic similarity. Ask "WhatsApp fix" and it'd find the right daily note. But pure vector search has blind spots:

**It misses keywords.** Ask for "RTX 5070 Ti" and vector search returns vaguely related hardware discussions instead of the exact entry mentioning that GPU. BM25 keyword search nails this.

**It has no concept of relationships.** Vector search returns isolated documents. It can't tell you "this decision led to that consequence" or "these three memories all reference the same project." That requires a graph.

**It drowns in old data.** Three weeks of daily notes and the important decisions are buried under routine logs. You need consolidation — compacting old entries into distilled summaries without losing the signal.

**It doesn't stay current.** Every time Kit writes a new memory file, someone had to manually re-embed it. Real memory needs to auto-ingest.

SurrealDB already had all the primitives — BM25 indexes, vector indexes, graph relations. I just needed to wire them together.

<!-- more -->

---

## Hybrid Search: Three Signals, One Ranking

The core insight: no single retrieval method is best for everything. Keywords catch exact terms. Vectors catch meaning. Graph relations catch context. The trick is combining them.

### Reciprocal Rank Fusion (RRF)

RRF is embarrassingly simple and surprisingly effective. Given ranked lists from multiple search methods, score each result by:

```
RRF_score = Σ 1 / (k + rank_i)
```

Where `k` is a constant (we use 60, the standard from the original paper) and `rank_i` is the result's position in each ranked list. Results that appear high in multiple lists get the highest combined score.

### The Three Search Modalities

**Vector search** — embed the query with Qwen3, cosine similarity against stored embeddings:

```python
def vector_search(query: str, top_k: int = 10) -> list[dict]:
    emb = get_embedding(query)
    sql = f"""
        SELECT id, title, content, tags, kind,
               vector::similarity::cosine(embedding, {json.dumps(emb)}) AS score
        FROM memory
        WHERE embedding != NONE
        ORDER BY score DESC
        LIMIT {top_k}
    """
    return surreal_query(sql)
```

**BM25 search** — full-text keyword search with English stemming:

```python
def bm25_search(query: str, top_k: int = 10) -> list[dict]:
    escaped = query.replace("'", "\\'")
    sql = f"""
        SELECT id, title, content, tags, kind,
               search::score(1) AS score
        FROM memory
        WHERE content @1@ '{escaped}'
        ORDER BY score DESC
        LIMIT {top_k}
    """
    return surreal_query(sql)
```

**Graph boost** — find memories that reference the same concepts as top vector results:

```python
def graph_boost(seed_ids: list[str], top_k: int = 10) -> list[dict]:
    ids_str = ", ".join(seed_ids)
    sql = f"""
        LET $concepts = (
            SELECT VALUE ->references->concept
            FROM [{ids_str}]
        );
        SELECT id, title, content, tags, kind
        FROM memory
        WHERE id NOT IN [{ids_str}]
        AND ->references->concept CONTAINSANY $concepts
        LIMIT {top_k}
    """
    return surreal_query(sql)
```

### Fusing the Results

```python
def hybrid_search(query: str, top_k: int = 5,
                  weights: dict | None = None) -> list[dict]:
    w = weights or {"vector": 1.0, "bm25": 1.0, "graph": 0.5}

    vec_results = vector_search(query, top_k=20)
    bm25_results = bm25_search(query, top_k=20)

    seed_ids = [r["id"] for r in vec_results[:5]]
    graph_results = graph_boost(seed_ids, top_k=10) if seed_ids else []

    # RRF fusion
    scores = {}
    metadata = {}
    k = 60

    for source, results, weight in [
        ("vector", vec_results, w["vector"]),
        ("bm25", bm25_results, w["bm25"]),
        ("graph", graph_results, w["graph"]),
    ]:
        for rank, r in enumerate(results):
            rid = str(r["id"])
            scores[rid] = scores.get(rid, 0) + weight / (k + rank)
            metadata[rid] = r

    ranked = sorted(scores.items(), key=lambda x: -x[1])[:top_k]
    return [
        {**metadata[rid], "score": score}
        for rid, score in ranked
    ]
```

### Why This Beats Single-Modality Search

Ask Kit "what happened with the RTX 5070 Ti VRAM issue?"

- **Vector only**: Returns hardware-adjacent memories about GPU setup, model loading, CUDA — related by meaning but not the specific entry.
- **BM25 only**: Returns the exact entry mentioning "RTX 5070 Ti" and "VRAM" — but misses contextually related decisions about model selection.
- **Hybrid**: Returns the specific entry (BM25 hit) ranked first, with related GPU decision memories (vector + graph) filling out the context.

The graph boost is the secret weapon. When the vector results reference concepts like "GPU" and "embeddings", the graph boost pulls in other memories referencing those same concepts — even if they wouldn't rank high by text similarity alone.

---

## Graph-Aware Recall: Follow the Threads

Hybrid search answers "what's relevant to this query?" Graph recall answers a deeper question: "what's connected to this, and how?"

### The Concept Graph

Every memory in SurrealDB can reference concept nodes via `references` edges. Concepts connect to each other via `related_to` edges. Memories chain temporally via `follows` edges.

```
memory:whatsapp_fix --references--> concept:whatsapp
memory:whatsapp_fix --references--> concept:openclaw
concept:whatsapp --related_to--> concept:messaging
concept:openclaw --related_to--> concept:gateway
memory:gateway_config --follows--> memory:whatsapp_fix
```

### Multi-Hop Traversal

Graph recall starts from seed memories (found via vector similarity) and walks the graph outward:

```python
def graph_recall(query: str, hops: int = 2, top_k: int = 5) -> list[dict]:
    # Phase 1: vector search for seeds
    emb = get_embedding(query)
    seeds = vector_search_raw(emb, limit=5)

    if not seeds:
        return []

    # Phase 2: expand via concept graph
    seed_ids = [s["id"] for s in seeds]
    expanded = set()

    current_layer = set(str(s) for s in seed_ids)
    for hop in range(hops):
        if not current_layer:
            break
        ids_str = ", ".join(current_layer)

        # Follow memory -> concept -> related concept -> memory
        sql = f"""
            SELECT VALUE <-references<-memory
            FROM concept
            WHERE id IN (
                SELECT VALUE ->references->concept FROM [{ids_str}]
            ).flatten()
        """
        neighbors = surreal_query(sql)
        next_layer = set()
        for result in neighbors:
            if result.get("result"):
                for batch in result["result"]:
                    for mid in (batch if isinstance(batch, list) else [batch]):
                        mid_str = str(mid)
                        if mid_str not in expanded and mid_str not in {str(s) for s in seed_ids}:
                            next_layer.add(mid_str)
                            expanded.add(mid_str)
        current_layer = next_layer

    # Phase 3: also follow temporal chains
    for sid in seed_ids:
        sql = f"""
            SELECT VALUE <-follows<-memory FROM {sid};
            SELECT VALUE ->follows->memory FROM {sid};
        """
        temporal = surreal_query(sql)
        for result in temporal:
            if result.get("result"):
                for chain in result["result"]:
                    for mid in (chain if isinstance(chain, list) else [chain]):
                        expanded.add(str(mid))

    # Phase 4: fetch and rank expanded set
    # ... score by distance from seeds, return top_k
```

### What This Gets You

Ask "why did we choose Qwen3 over other embedding models?" and graph recall doesn't just find the model selection memory — it follows the graph to find:

1. The decision itself (seed, via vector similarity)
2. Memories about VRAM constraints (via concept: GPU → related: hardware_constraints)
3. The MTEB benchmark comparison (via concept: embeddings → related: model_evaluation)
4. The security review of safetensors format (via temporal chain: follows)
5. The eventual performance results (via temporal chain: follows)

You get a narrative thread, not isolated snippets.

---

## Auto-Ingest: Stay Current Automatically

Memory that requires manual re-indexing isn't memory — it's a filing cabinet. The ingest pipeline watches markdown files and keeps SurrealDB in sync.

### Markdown Chunking

Daily notes are structured with headers. Each `## Section` becomes a chunk:

```python
class MarkdownChunker:
    def chunk(self, text: str, source: str) -> list[dict]:
        sections = []
        current_title = source  # default title = filename
        current_lines = []

        for line in text.split("\n"):
            if line.startswith("## "):
                if current_lines:
                    sections.append(self._make_chunk(
                        current_title, current_lines, source))
                current_title = line.lstrip("# ").strip()
                current_lines = []
            else:
                current_lines.append(line)

        if current_lines:
            sections.append(self._make_chunk(
                current_title, current_lines, source))

        return sections
```

### Content-Hashed Upserts

Each chunk gets a deterministic ID based on its source file and section title:

```python
def chunk_id(source: str, title: str) -> str:
    key = f"{source}::{title}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]
```

Before embedding a chunk, we check if the content hash has changed. If the text is identical to what's already stored, skip it. This makes re-ingestion cheap — only modified sections get re-embedded.

### Concept Auto-Linking

The ingester maintains a dictionary of known concepts (project names, tools, people). When a chunk mentions a known concept, it automatically creates a `references` edge:

```python
KNOWN_CONCEPTS = {
    "surrealdb": "SurrealDB",
    "openclaw": "OpenClaw",
    "clawguard": "Clawguard",
    "whatsapp": "WhatsApp",
    # ...
}

def auto_link_concepts(chunk_id: str, content: str):
    content_lower = content.lower()
    for slug, name in KNOWN_CONCEPTS.items():
        if slug in content_lower:
            # Ensure concept exists
            surreal_query(f"""
                INSERT INTO concept {{ name: '{name}' }}
                ON DUPLICATE KEY UPDATE updated_at = time::now()
            """)
            # Create edge
            surreal_query(f"""
                RELATE memory:{chunk_id}->references->concept:{slug}
            """)
```

### Batch Embedding

The embedding server can handle batches, but we learned the hard way (500 errors) that 42 chunks in one request is too many. Batch size of 8 works reliably:

```python
def embed_batch(texts: list[str], batch_size: int = 8) -> list[list[float]]:
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        resp = requests.post(f"{EMBEDDING_URL}/v1/embeddings",
            json={"input": batch, "model": "qwen3-embedding-4b"})
        resp.raise_for_status()
        all_embeddings.extend(
            [d["embedding"] for d in resp.json()["data"]])
    return all_embeddings
```

### Running It

```bash
# One-shot ingest (on session start)
python3 ingest.py --once

# Output:
# Scanning 8 files...
# 42 chunks found, 38 concepts linked
# 12 chunks updated (30 unchanged)
# Embedded 12 chunks in 0.9s
```

In OpenClaw, this runs automatically on `/new` (session start). One line in the agent's instructions triggers it:

```bash
cd ~/.openclaw/workspace/surrealdb-prototype && \
  .venv/bin/python3 ingest.py --once
```

---

## Memory Consolidation: Forget Gracefully

The hardest problem in agent memory isn't remembering — it's forgetting. Three weeks of daily notes and you've got 200+ chunks, most of them routine logs. The signal-to-noise ratio degrades.

Consolidation compresses old daily notes into distilled long-term entries. The key constraint: **no LLM calls.** This runs on a heartbeat (every few hours). Making an API call every time would be expensive and slow.

### Extractive Summarization

Instead of asking an LLM to "summarize these notes," we use extractive methods — selecting the most information-dense sentences from each section:

```python
def score_sentence(sentence: str) -> float:
    """Score a sentence by information density."""
    score = 0.0

    # Longer sentences tend to carry more info (up to a point)
    words = sentence.split()
    score += min(len(words) / 20, 1.0) * 0.3

    # Sentences with specific markers are more likely important
    if any(marker in sentence.lower() for marker in
           ["decided", "fixed", "bug", "shipped", "learned",
            "important", "breakthrough", "blocked"]):
        score += 0.4

    # Sentences with technical terms or proper nouns
    capitalized = sum(1 for w in words if w[0:1].isupper()
                      and words.index(w) > 0)
    score += min(capitalized / 5, 1.0) * 0.2

    # Bullet points starting with action items
    if sentence.strip().startswith(("- [x]", "- [X]", "✅", "🚀")):
        score += 0.3

    return score
```

### Concept Deduplication

When multiple daily entries reference the same concept, consolidation merges them:

```python
def consolidate(older_than_days: int = 3, dry_run: bool = True):
    cutoff = datetime.now() - timedelta(days=older_than_days)

    # Find daily memories older than cutoff
    old_memories = surreal_query(f"""
        SELECT * FROM memory
        WHERE kind = 'daily_log'
        AND created_at < '{cutoff.isoformat()}'
        ORDER BY created_at ASC
    """)

    # Group by shared concepts
    concept_groups = group_by_concepts(old_memories)

    # For each group: extract top sentences, merge tags, create consolidated entry
    for concept, memories in concept_groups.items():
        top_sentences = []
        all_tags = set()
        for m in memories:
            scored = [(score_sentence(s), s) for s in m["content"].split(". ")]
            top_sentences.extend(sorted(scored, reverse=True)[:3])
            all_tags.update(m.get("tags", []))

        # Take the best sentences across all related memories
        consolidated_text = ". ".join(
            s for _, s in sorted(top_sentences, reverse=True)[:10]
        )

        if not dry_run:
            # Create consolidated memory
            surreal_query(f"""
                CREATE memory SET
                    kind = 'note',
                    title = 'Consolidated: {concept}',
                    content = '{consolidated_text}',
                    tags = {json.dumps(list(all_tags))},
                    source = 'consolidation'
            """)
            # Re-embed the consolidated entry
            # Archive (don't delete) the originals
```

### Why Not Use an LLM?

Three reasons:

1. **Cost.** Consolidation runs on a heartbeat. Even cheap models add up when you're summarizing daily.
2. **Determinism.** Extractive methods produce the same output given the same input. LLM summaries drift.
3. **Speed.** No API round trip. Consolidation over 50 entries takes <1 second.

The tradeoff is that extractive summaries aren't as fluent as LLM-generated ones. They're sentence fragments stitched together. But for agent recall — where the consumer is another LLM, not a human — fluency doesn't matter. Information density does.

---

## Wiring It Together: Event-Driven Architecture

No daemons. No cron jobs (well, one). No polling loops. The memory system is event-driven, triggered by OpenClaw lifecycle events:

| Event | Trigger | Action |
|-------|---------|--------|
| Session start (`/new`) | OpenClaw gateway | Run `ingest.py --once` |
| Memory recall | Agent calls `memory_search` | Hybrid search over SurrealDB |
| Graph recall | Agent calls graph_recall in AGENTS.md instructions | Multi-hop concept traversal |
| Consolidation | OpenClaw heartbeat (every few hours) | Run `consolidation.py` on old entries |

This means:

- **No background process** eating resources when the agent isn't active
- **No stale indexes** because ingest runs at session start
- **No manual maintenance** because consolidation is automatic
- **No cold starts** for search because SurrealDB and the embedding server run as systemd services

### The Agent's Instructions

In `AGENTS.md`, the agent (Kit) has instructions for when to use each component:

```markdown
### SurrealDB Recall
In addition to `memory_search`, query SurrealDB for richer recall:

# Hybrid search (BM25 + vector + graph)
python3 -c "from hybrid_search import hybrid_search; ..."

# Graph-aware recall (concept traversal + temporal chains)
python3 -c "from graph_recall import graph_recall; ..."
```

The agent decides which search modality to use based on the query. Simple factual lookups use `memory_search` (flat file). Complex contextual questions use hybrid search or graph recall.

---

## The Smoke Test

After building all of this, I needed to know if it actually worked end-to-end. Not just unit tests — the full loop:

1. Write something into a daily note
2. Start a new session (triggers ingest)
3. Ask the agent to recall it
4. Verify it comes back from SurrealDB, not just flat file search

The test: I wrote "JR's code phrase is blue bunny" into today's daily note, started a new session, and asked Kit if it remembered.

It did. From SurrealDB, via hybrid search, with a relevance score.

That's the difference between "here's a prototype" and "here's a memory system."

---

## The Numbers (Updated)

| Component | Metric | Value |
|-----------|--------|-------|
| Ingest | 8 files, 42 chunks | 2.1s total |
| Ingest | Re-ingest (no changes) | 0.3s (hash skip) |
| Hybrid search | Query latency | <500ms |
| Graph recall (2 hops) | Query latency | <800ms |
| Consolidation | 50 entries | <1s |
| Test suite | 4 modules | 107 tests, all passing |
| Total code | 4 Python modules | 1,266 lines |
| LLM API calls | For search/ingest/consolidation | 0 |

---

## What SurrealDB's Blog Gets Right (and What's Missing)

SurrealDB recently published [a conversation with Agno's CEO](https://surrealdb.com/blog/agents-with-memory-how-agno-and-surrealdb-enable-reliable-ai-systems) about building agent memory systems. The key points they make are correct:

- Context matters more than model size
- Don't dump everything into the context window
- Combine vectors, graphs, and structured data for richer retrieval
- Start small, solve a real problem, iterate

But the post is a Q&A about what's *possible*. It describes Agno as the framework that provides the "harness" and SurrealDB as the "memory layer," and recommends developers use both together.

What we built here is the memory layer *without* the framework. No Agno. No Agent OS. Just Python, SurrealQL, and a local GPU. The total dependency footprint:

- `sentence-transformers` (for embeddings)
- `requests` (for HTTP to SurrealDB)
- `fastapi` + `uvicorn` (for the embedding server)

That's it. Four pip packages and a database.

Frameworks are useful when you need batteries included. But when you're building a memory system for a specific agent (Kit, running in OpenClaw, with markdown-based memory files), you don't need a generic Agent OS. You need 1,266 lines of Python that do exactly what your agent needs.

---

## Lessons Learned

**Batch size matters.** Our first ingest attempt sent all 42 chunks to the embedding server in one request. The server returned a 500 error — Qwen3-Embedding-4B on 12GB VRAM can't handle 42 texts at once. Batch size of 8 works. Test your limits.

**Content hashing is essential.** Without it, every session start re-embeds everything. With it, only changed sections get processed. The difference: 2.1s vs 0.3s on re-ingest.

**Graph edges need to be auto-created.** Manual concept linking doesn't scale. The auto-linker catches ~80% of relevant connections. The remaining 20% are edge cases the agent can handle via explicit tagging.

**Extractive consolidation is "good enough."** I expected to need an LLM for summarization. Turns out, selecting the top 3 information-dense sentences from each section and merging by concept produces surprisingly usable consolidated entries. The consumer is an LLM — it doesn't need perfect prose.

**Event-driven beats always-on.** My first instinct was to build a file watcher daemon. But the agent only needs fresh data at session start, and consolidation only matters every few hours. Event-driven is simpler, cheaper, and just as effective.

---

## What's Actually Next

- **Feedback loop** — when the agent uses a memory and it helps, boost its ranking. When it retrieves something irrelevant, demote it. Relevance feedback without explicit ratings.
- **Multi-agent memory** — Kit's memory is Kit's. But what if spawned sub-agents could read (not write) the parent's memory graph?
- **Decay** — memories that haven't been accessed in weeks should fade in relevance. Not deletion — just lower ranking. Like how human memory works.
- **Richer concept ontology** — right now concepts are flat labels. Adding hierarchy (SurrealDB → database → tool) would enable more sophisticated traversal.

---

## Full Source

All code from both Part 1 and Part 2:

- `schema.surql` — SurrealDB table definitions and indexes
- `embedding-server.py` — OpenAI-compatible FastAPI server (Qwen3-Embedding-4B)
- `ingest.py` — Markdown chunker + auto-ingest pipeline
- `hybrid_search.py` — BM25 + vector + graph fusion with RRF
- `graph_recall.py` — Multi-hop concept and temporal traversal
- `consolidation.py` — Extractive memory compaction
- `tests/` — 107 tests across 4 modules

---

*Built by a human and his AI familiar, Kit. The blue bunny remembers.*
+++
