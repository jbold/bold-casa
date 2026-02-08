+++
title = "MyConMon"
date = 2026-02-05
description = "Personal Continuous Monitoring - drift detection with risk-based alerting."
[taxonomies]
tags = ["Security", "Ops", "Monitoring"]
[extra]
repo = "https://github.com/jbold/myconmon"
local_image = "projects/myconmon_cover.png"
+++

<a href="https://github.com/jbold/myconmon" class="button" target="_blank">View on GitHub ↗</a>

**MyConMon** (My Continuous Monitoring) is a system for tracking configuration drift and security posture on personal infrastructure.

It moves beyond simple uptime checks to validate *state*: are firewall rules active? Are unauthorized ports open? Has the software bill of materials changed?

### The Stack
- **Lang:** Python / Go
- **Logic:** Drift detection against a known-good baseline.
