+++
title = "Sovereign Silverblue"
date = 2026-02-05
description = "Hardened, privacy-first Fedora Silverblue bootc image."
[taxonomies]
tags = ["Linux", "Security", "OS"]
[extra]
repo = "https://github.com/jbold/sovereign-silverblue"
local_image = "projects/silverblue_cover.png"
+++

<div class="admonition info">
    <div class="admonition-icon admonition-icon-info"></div>
    <div class="admonition-content">
        <strong class="admonition-title">Specs</strong>
        <ul>
            <li><strong>Status:</strong> 🟢 Stable</li>
            <li><strong>Stack:</strong> Fedora Silverblue, bootc, OCI</li>
            <li><strong>Role:</strong> Maintainer</li>
            <li><strong>Focus:</strong> Privacy / Hardening</li>
        </ul>
    </div>
</div>

<a href="https://github.com/jbold/sovereign-silverblue" class="button" target="_blank">View on GitHub ↗</a>

A custom **Fedora Silverblue** image built with `bootc`, designed for privacy and security enthusiasts.

### Key Features
- **Immutable Base:** Atomic updates via OCI registries.
- **Hardened Defaults:** Disabled telemetry, strict firewall rules, removed bloat.
- **Privacy First:** Pre-configured with privacy-respecting tools and DNS.

### The Stack
- **Base:** Fedora Silverblue
- **Build:** bootc / Containerfile
- **Target:** Personal Workstations
