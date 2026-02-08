+++
title = "Nosh"
date = 2026-02-08
description = "Machine-readable companion files for AI agents. RSS for the agentic web."
[taxonomies]
tags = ["AI", "Spec", "Rust"]
[extra]
repo = "https://github.com/jbold/nosh"
local_image = "projects/nosh_cover.png"
+++

<div class="admonition info">
    <div class="admonition-icon admonition-icon-info"></div>
    <div class="admonition-content">
        <strong class="admonition-title">Specs</strong>
        <ul>
            <li><strong>Status:</strong> 🟢 Active</li>
            <li><strong>Stack:</strong> Rust, JSON, TOML</li>
            <li><strong>Role:</strong> Architect / Developer</li>
            <li><strong>License:</strong> MIT</li>
        </ul>
    </div>
</div>

<a href="https://github.com/jbold/nosh" class="button" target="_blank">View on GitHub ↗</a>

**Nosh** is a specification and toolset for creating "machine-readable companion files" for web content. Think of it as **RSS for the agentic web**.

Instead of agents scraping HTML and guessing at structure, Nosh provides a clean, structured data feed (JSON/TOML) that describes the content, intent, and available actions of a page.

### The Stack
- **Language:** Rust
- **Format:** JSON / TOML specs
- **Goal:** Reduce hallucination and parsing errors for autonomous agents.
