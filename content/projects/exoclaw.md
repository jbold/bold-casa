+++
title = "Exoclaw"
date = 2026-02-08
description = "A secure, WASM-sandboxed AI agent runtime."
[taxonomies]
tags = ["WASM", "Security", "Rust", "AI"]
[extra]
repo = "https://github.com/jbold/exoclaw"
local_image = "projects/projects.jpg"
+++

<a href="https://github.com/jbold/exoclaw" class="button" target="_blank">View on GitHub ↗</a>

**Exoclaw** is an experimental runtime for AI agents, focusing on security and isolation.

By leveraging **WebAssembly (WASM)**, Exoclaw provides a sandboxed environment where agent capabilities (tools) can be executed safely, without giving the model unfettered access to the host system.

### The Stack
- **Runtime:** WASM (Wasmtime)
- **Language:** Rust
- **Security:** Capability-based security model (Object Capabilities)
