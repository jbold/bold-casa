+++
title = "Zero-Cost AI Agent Memory: Local GPU Embeddings with SurrealDB and OpenClaw"
date = 2026-02-12
description = "How I gave my AI agent semantic memory using a local GPU, SurrealDB, and Qwen3 embeddings — zero API costs, zero data leaving my machine."
[taxonomies]
tags = ["openclaw", "surrealdb", "embeddings", "gpu", "self-hosted", "ai-infrastructure", "memory"]
[extra]
og_image = ""

[extra.nosh]
type = "tutorial"
language = "en"

[extra.nosh.content]
body = "Most AI agents forget everything between sessions. This tutorial shows how to build a complete semantic memory system using a local GPU for embeddings, SurrealDB for storage, and OpenClaw's native memory search — all running locally with zero API costs."
duration = "2-3 hours"
prerequisites = [
    "A self-hosted OpenClaw gateway (2026.2.9+)",
    "NVIDIA GPU with 8GB+ VRAM (RTX 3070 or newer recommended)",
    "Python 3.11+",
    "Linux (tested on Fedora Silverblue 42, should work on any distro)",
    "Basic familiarity with the command line"
]
key_findings = [
    "Qwen3-Embedding-4B ranks #5 on MTEB multilingual and #3 on code retrieval — better than most paid API models",
    "The model uses 7.6GB VRAM during inference but can be loaded/unloaded on demand",
    "A thin OpenAI-compatible server lets OpenClaw use local GPU embeddings with zero code changes",
    "SurrealDB combines document, graph, and vector search in a single binary — no infra sprawl",
    "Total cost: $0. Everything runs on hardware you already own"
]

[[extra.nosh.content.steps]]
title = "Install SurrealDB"
text = "Single binary install, localhost only, RocksDB storage backend."

[[extra.nosh.content.steps]]
title = "Design the memory schema"
text = "Document + graph + vector tables in one database using SurrealQL."

[[extra.nosh.content.steps]]
title = "Install Qwen3-Embedding-4B"
text = "Security review, Python venv, model download via HuggingFace (safetensors only)."

[[extra.nosh.content.steps]]
title = "Build the embedding server"
text = "FastAPI server serving OpenAI-compatible /v1/embeddings on localhost."

[[extra.nosh.content.steps]]
title = "Wire into OpenClaw"
text = "One config key change and the native memory_search tool uses your GPU."

[extra.nosh.content.cost_data]
total = "$0 — all local inference"
embedding_model = "Qwen3-Embedding-4B (Apache 2.0, free)"
database = "SurrealDB (BSL 1.1, free for self-hosted)"
hardware_used = "NVIDIA RTX 5070 Ti Mobile (12GB VRAM)"
+++

My AI agent, Kit, wakes up with amnesia every session. It reads markdown files to reconstruct its memory, but that's brute force — dump everything into context and hope the important stuff doesn't get lost in the noise.

I wanted semantic memory. Ask Kit "what happened with WhatsApp?" and get back the exact section about the gateway fix, not a wall of unrelated notes.

Here's how I built it in an afternoon. Zero API costs. Nothing leaves my machine.

---

## TLDR

Local GPU embeddings + SurrealDB + OpenClaw = semantic memory for your AI agent at zero cost.

**[Jump to the complete setup →](#step-1-install-surrealdb)**

---

### What We're Building

1. **SurrealDB** — multi-model database (document + graph + vector) running locally
2. **Qwen3-Embedding-4B** — top-tier embedding model running on your GPU
3. **FastAPI embedding server** — OpenAI-compatible endpoint wrapping the model
4. **OpenClaw integration** — one config change to enable semantic memory search

### The Problem

OpenClaw agents store memory in markdown files: `MEMORY.md` for long-term facts, `memory/YYYY-MM-DD.md` for daily notes. The built-in `memory_search` tool needs an embedding provider to work — typically OpenAI, Google, or Voyage API keys.

No API key? Memory search is disabled. Your agent falls back to loading entire files into context, burning tokens on irrelevant content.

The fix: run your own embedding model on your GPU and point OpenClaw at it.

### Why These Tools

**SurrealDB** because it combines document storage, graph relations, and vector search in a single binary. No need for separate Postgres + Neo4j + Pinecone. One database, one query language, one process.

**Qwen3-Embedding-4B** because it ranks #5 on the MTEB multilingual leaderboard and #3 on code retrieval — beating most paid API models. It's Apache 2.0 licensed, uses safetensors (no pickle security risk), and fits in 8GB of VRAM.

**FastAPI** because OpenClaw expects an OpenAI-compatible `/v1/embeddings` endpoint. A 60-line FastAPI wrapper makes our local model look like OpenAI to OpenClaw.

<!-- more -->

---

## Step 1: Install SurrealDB

SurrealDB is a single binary. No Docker, no cluster, no config files.

```bash
# Install to ~/.surrealdb/
curl -sSf https://install.surrealdb.com | sh -s -- --nightly

# Verify
~/.surrealdb/surreal version
```

Start it bound to localhost only (important — no network exposure):

```bash
# Create data directory
mkdir -p ~/.openclaw/workspace/surrealdb-data

# Start with RocksDB backend
nohup ~/.surrealdb/surreal start \
  --bind 127.0.0.1:8000 \
  --user root --pass root \
  --log warn \
  "rocksdb://$HOME/.openclaw/workspace/surrealdb-data" \
  > /tmp/surreal.log 2>&1 &

# Verify
curl -sf http://127.0.0.1:8000/health && echo "SurrealDB running"
```

### Security note

SurrealDB uses the [Business Source License 1.1](https://surrealdb.com/license). Free for self-hosted/internal use. After 4 years, code converts to Apache 2.0. We bind to `127.0.0.1` only — no network exposure. Run as your normal user, not root.

---

## Step 2: Design the Memory Schema

SurrealDB supports document, graph, AND vector operations in a single query language. Here's the schema:

```sql
-- Connect
-- surreal sql --endpoint http://127.0.0.1:8000 \
--   --username root --password root \
--   --namespace kit --database memory

-- Memory entries (the core documents)
DEFINE TABLE memory SCHEMAFULL;
DEFINE FIELD kind ON memory TYPE string
  ASSERT $value IN ["conversation","decision","context","daily_log","note","lesson"];
DEFINE FIELD title ON memory TYPE string;
DEFINE FIELD content ON memory TYPE string;
DEFINE FIELD source ON memory TYPE option<string>;
DEFINE FIELD tags ON memory TYPE array<string>;
DEFINE FIELD created_at ON memory TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON memory TYPE datetime DEFAULT time::now();
DEFINE FIELD embedding ON memory TYPE option<array<float>>;

-- Full-text search (BM25)
DEFINE ANALYZER memory_analyzer TOKENIZERS blank, class
  FILTERS snowball(english);
DEFINE INDEX memory_content_search ON memory
  FIELDS content SEARCH ANALYZER memory_analyzer BM25;

-- Vector index (1024 dimensions, cosine distance)
DEFINE INDEX memory_embedding_idx ON memory
  FIELDS embedding MTREE DIMENSION 1024 DIST COSINE;

-- Concept nodes (for graph relations)
DEFINE TABLE concept SCHEMAFULL;
DEFINE FIELD name ON concept TYPE string;
DEFINE FIELD description ON concept TYPE option<string>;
DEFINE INDEX concept_name_idx ON concept FIELDS name UNIQUE;

-- Graph edges
DEFINE TABLE references SCHEMAFULL TYPE RELATION
  FROM memory TO concept;
DEFINE TABLE related_to SCHEMAFULL TYPE RELATION
  FROM concept TO concept;
DEFINE TABLE follows SCHEMAFULL TYPE RELATION
  FROM memory TO memory;
```

This gives you three search modalities in one database:

- **Full-text**: `SELECT * FROM memory WHERE content @@ "WhatsApp"` — keyword search with BM25 relevance scoring
- **Vector**: `SELECT *, vector::similarity::cosine(embedding, $vec) AS score FROM memory` — semantic similarity
- **Graph**: `SELECT ->references->concept.name FROM memory:some_entry` — traverse relationships between memories and concepts

---

## Step 3: Install the Embedding Model

### Security review first

Before installing any model, run a security check. For Qwen3-Embedding-4B:

- **License**: Apache 2.0 — fully permissive
- **Format**: Safetensors only (no pickle files — safetensors cannot execute arbitrary code)
- **Publisher**: Alibaba Cloud / Qwen team — publicly traded company (NYSE: BABA)
- **CVEs**: None specific to the model
- **MTEB rank**: #5 multilingual, #3 code retrieval

### Python setup

```bash
# Create a venv
mkdir -p ~/surrealdb-prototype && cd ~/surrealdb-prototype
python3 -m venv .venv
source .venv/bin/activate

# Install PyTorch with CUDA
pip install torch --index-url https://download.pytorch.org/whl/cu128

# Install the rest
pip install sentence-transformers transformers fastapi uvicorn requests
```

### Download the model

```python
# This downloads ~7.6GB of safetensors on first run
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("Qwen/Qwen3-Embedding-4B",
    trust_remote_code=True,
    model_kwargs={"torch_dtype": "float16"})
```

First load takes a few minutes (downloading weights). Subsequent loads take ~3.4 seconds from cache.

---

## Step 4: Build the Embedding Server

This is the key piece — a thin FastAPI server that makes your local GPU model look like OpenAI's embedding API to OpenClaw.

```python
#!/usr/bin/env python3
"""OpenAI-compatible embedding server wrapping Qwen3-Embedding-4B."""

import gc
import time
from contextlib import asynccontextmanager

import torch
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

MODEL_NAME = "Qwen/Qwen3-Embedding-4B"
EMBEDDING_DIM = 1024  # MRL truncation from native 2560
BIND_HOST = "127.0.0.1"
BIND_PORT = 8678

model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print(f"Loading {MODEL_NAME} onto GPU...")
    t0 = time.time()
    model = SentenceTransformer(
        MODEL_NAME,
        trust_remote_code=True,
        model_kwargs={"torch_dtype": torch.float16},
    )
    model.max_seq_length = 8192
    model.truncate_dim = EMBEDDING_DIM
    print(f"Model loaded in {time.time() - t0:.1f}s")
    yield
    del model
    gc.collect()
    torch.cuda.empty_cache()

app = FastAPI(lifespan=lifespan)

class EmbeddingRequest(BaseModel):
    input: str | list[str]
    model: str = "qwen3-embedding-4b"

@app.post("/v1/embeddings")
async def create_embedding(req: EmbeddingRequest):
    texts = [req.input] if isinstance(req.input, str) else req.input
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    data = []
    total_tokens = 0
    for i, emb in enumerate(embeddings):
        data.append({
            "object": "embedding",
            "embedding": emb.tolist(),
            "index": i,
        })
        total_tokens += len(texts[i].split())  # rough estimate

    return {
        "object": "list",
        "data": data,
        "model": "qwen3-embedding-4b",
        "usage": {"prompt_tokens": total_tokens, "total_tokens": total_tokens},
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "dim": EMBEDDING_DIM,
        "gpu": torch.cuda.is_available(),
    }

if __name__ == "__main__":
    uvicorn.run(app, host=BIND_HOST, port=BIND_PORT)
```

### Run it

```bash
source .venv/bin/activate
python3 embedding-server.py
```

### Test it

```bash
curl http://127.0.0.1:8678/health
# {"status":"ok","model":"Qwen/Qwen3-Embedding-4B","dim":1024,"gpu":true}

curl -X POST http://127.0.0.1:8678/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world", "model": "qwen3"}'
# Returns 1024-dim embedding vector in OpenAI format
```

### Make it persistent (systemd)

```ini
# ~/.config/systemd/user/kit-embeddings.service
[Unit]
Description=Kit Embedding Server (Qwen3-Embedding-4B)
After=network.target

[Service]
Type=simple
WorkingDirectory=%h/surrealdb-prototype
ExecStart=%h/surrealdb-prototype/.venv/bin/python3 %h/surrealdb-prototype/embedding-server.py
Restart=on-failure
RestartSec=5
Environment=CUDA_VISIBLE_DEVICES=0

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now kit-embeddings
```

---

## Step 5: Wire Into OpenClaw

This is the satisfying part. One config change and OpenClaw's native `memory_search` tool starts using your GPU.

Edit `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "remote": {
          "baseUrl": "http://127.0.0.1:8678/v1",
          "apiKey": "local"
        }
      }
    }
  }
}
```

Restart the gateway:

```bash
systemctl --user restart openclaw-gateway
```

That's it. OpenClaw will:

1. Watch your memory files (`MEMORY.md`, `memory/*.md`) for changes
2. Send text chunks to your local embedding server for vectorization
3. Store the vectors in its internal index
4. Use semantic similarity when the agent calls `memory_search`

### Verify it works

Ask your agent something that requires memory recall. In the embedding server logs you'll see:

```
INFO: 127.0.0.1:51364 - "POST /v1/embeddings HTTP/1.1" 200 OK
INFO: 127.0.0.1:51368 - "POST /v1/embeddings HTTP/1.1" 200 OK
```

The agent's `memory_search` should return ranked results with relevance scores:

```
Query: "WhatsApp gateway fix"
#1 [0.68] WhatsApp Gateway Fix — memory/2026-02-12.md
#2 [0.37] Messaging / Channel Behavior — memory/2026-02-10.md
```

---

## The Numbers

| Metric | Value |
|--------|-------|
| Model load time (cached) | 3.4s |
| Embedding speed | ~14 entries/sec |
| VRAM usage | 7.6GB (fp16) |
| Embedding dimensions | 1024 (MRL-truncated from 2560) |
| MTEB rank (multilingual) | #5 |
| MTEB rank (code retrieval) | #3 |
| API cost | $0 |
| Data leaving your machine | None |

---

## Why Not Just Use an API?

You could set `OPENAI_API_KEY` and call it a day. Here's why I didn't:

**Cost**: OpenAI's `text-embedding-3-small` costs $0.02 per million tokens. Sounds cheap until your agent re-indexes on every file change, every session start, every compaction cycle. It adds up.

**Privacy**: My agent has access to my personal notes, legal documents, project plans, and daily journals. I'm not sending that to an API endpoint.

**Quality**: Qwen3-Embedding-4B ranks #5 on the MTEB multilingual leaderboard. OpenAI's `text-embedding-3-small` (the default for most tools) doesn't crack the top 20. Higher quality embeddings = better recall.

**Latency**: Localhost is faster than any API. No network round trips, no rate limits, no cold starts (the model stays loaded via systemd).

**Control**: I can swap models, change dimensions, add custom preprocessing — all without waiting for a provider to update their API.

---

## What's Next

The embedding server and SurrealDB prototype give us the foundation. The roadmap:

- **Graph-aware recall** — not just "find similar text" but "traverse the concept graph to find related decisions and context"
- **Memory consolidation** — periodically summarize and merge old daily notes into distilled long-term memory
- **Auto-ingest** — watch for new memories in real-time, embed and index automatically
- **Hybrid search** — combine vector similarity, BM25 keyword matching, and graph traversal for richer results

SurrealDB's multi-model architecture makes all of this possible in a single query. The graph layer is what separates this from a plain vector database — you can ask "what concepts are related to the decisions I made last week?" and get answers that require traversing relationships, not just computing cosine similarity.

---

## Full Source

All code is available in the [surrealdb-prototype](https://github.com/jbold/surrealdb-agent-memory) directory:

- `schema.surql` — SurrealDB table definitions and indexes
- `seed.surql` — Sample data
- `embed.py` — Batch embed memories into SurrealDB
- `search.py` — Semantic search CLI
- `embedding-server.py` — OpenAI-compatible FastAPI server
- `requirements.txt` — Pinned Python dependencies

---

*Built by a human and his AI familiar, Kit.*
