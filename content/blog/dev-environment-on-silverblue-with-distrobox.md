+++
title = "How I Set Up a Full Dev Environment on Fedora Silverblue (Without Touching the Host)"
date = 2026-02-09
description = "Fedora Silverblue is immutable — you can't apt install or pip install on the host. Here's how I use distrobox to run a full Ubuntu dev environment with Rust, Node, Python, and AI coding tools, all without compromising the base OS."
[taxonomies]
tags = ["silverblue", "distrobox", "dev-environment", "linux", "containers"]
[extra]
og_image = ""

[extra.nosh]
type = "tutorial"
language = "en"

[extra.nosh.content]
body = "A practical guide to setting up a full development environment on Fedora Silverblue using distrobox. Covers why Silverblue's immutability matters, why distrobox beats toolbox and VMs, how to install language runtimes and dev tools, and how to make the setup reproducible with distrobox assemble."
duration = "30 minutes"
prerequisites = [
    "Fedora Silverblue (any recent version, tested on 43)",
    "Podman (pre-installed on Silverblue)",
    "A terminal (Ptyxis, GNOME Terminal, or any other)",
]
key_findings = [
    "Distrobox gives you a mutable Ubuntu/Fedora userspace inside an immutable OS without VMs or dual boot",
    "Host integration (Wayland, D-Bus, home directory, systemd) works out of the box",
    "Two-layer approach: distrobox assemble manifest for container packages + bootstrap script for home-directory tooling",
    "Home-directory tools (nvm, cargo, pip venvs) survive container rebuilds because they live on the bind-mounted host filesystem",
    "Init hooks can bind-mount host systemd journals and resolved into the container for full system observability",
]

[[extra.nosh.content.steps]]
title = "Install distrobox"
text = "curl -s https://raw.githubusercontent.com/89luca89/distrobox/main/install | sh -s -- --prefix ~/.local"

[[extra.nosh.content.steps]]
title = "Create the dev container"
text = "distrobox create --name dev --image ubuntu:24.04 --pull"

[[extra.nosh.content.steps]]
title = "Enter and install dev packages"
text = "distrobox enter dev, then sudo apt install build-essential git python3-pip nodejs rust toolchains"

[[extra.nosh.content.steps]]
title = "Make it reproducible"
text = "Create a distrobox assemble INI manifest and a bootstrap script for home-directory tools like nvm, rustup, and cargo crates"
+++

## TLDR

Fedora Silverblue is an immutable desktop OS — the base filesystem is read-only and atomic. That's great for reliability, but it means you can't `apt install gcc` or `pip install flask` on the host. Distrobox solves this by giving you a full mutable Linux userspace (Ubuntu, Fedora, Arch — your pick) inside a container that *feels* like your native system. Your home directory, Wayland display, D-Bus, GPU — all shared.

This post covers why I chose this setup, how to build it, and how to make it reproducible.

**[Jump to the setup →](#the-setup)** · **[Skip to the reproducible manifest →](#making-it-reproducible)**

---

### In This Post

- [Why Silverblue?](#why-silverblue)
- [The Problem: Immutable Means No Package Manager](#the-problem-immutable-means-no-package-manager)
- [Why Distrobox?](#why-distrobox-and-not-something-else)
- [The Setup](#the-setup)
- [Making It Reproducible](#making-it-reproducible)
- [What You End Up With](#what-you-end-up-with)

---

## Why Silverblue?

I run Fedora Silverblue on my daily driver — an ASUS ROG Strix with a Ryzen 9 and RTX 5070 Ti. The pitch is simple: your OS is an atomic image, like a phone OS. Updates are transactional. If something breaks, you reboot into the previous image. You can't accidentally bork your system by installing a conflicting package.

After years of traditional Linux where a bad kernel module or a library conflict could eat an afternoon, I wanted the "it just works" layer to be actually unbreakable. Silverblue gives me that.

But there's a tradeoff.

## The Problem: Immutable Means No Package Manager

On Silverblue, the root filesystem (`/usr`, `/etc`) is read-only. There's no `dnf install` on the host. The official package management options are:

- **rpm-ostree** — layers packages into the base image. Works, but requires a reboot to apply, and every layered package is another thing that can conflict during OS upgrades. You really want to minimize what you layer here.
- **Flatpak** — great for desktop apps (browsers, editors, media players). Not designed for dev toolchains.
- **Toolbox/Distrobox** — mutable containers that share your home directory and desktop session.

For development — where you need `gcc`, `python3-pip`, `libssl-dev`, `node`, `cargo`, and a hundred other things — the container approach is the right one. Keep the host clean, do all your messy dev work in a container you can nuke and rebuild.

## Why Distrobox (and Not Something Else)?

**Toolbox** is Fedora's official answer — it creates a Fedora container that integrates with your host. It works fine, but it's Fedora-only by default and less configurable.

**Distrobox** is the same concept, broader:

- **Any distro as your base.** I use Ubuntu 24.04 because the Debian package ecosystem is the widest. Need a PPA? A `.deb` from a vendor? It just works.
- **Full host integration.** Your home directory is bind-mounted, so your dotfiles, SSH keys, git config — all shared. Wayland, X11, PulseAudio/PipeWire, D-Bus, and GPU acceleration are forwarded automatically.
- **Custom init hooks.** You can bind-mount arbitrary host paths into the container at startup. I use this to mount systemd journal and resolved state so I can read host logs from inside the container.
- **Reproducible with `distrobox assemble`.** An INI manifest that declaratively defines your container — image, packages, hooks. One command to rebuild.
- **It's just podman underneath.** Rootless, OCI-compliant, no daemon. The container is a regular podman container you can inspect, export, or throw away.

**Why not a VM?** Overhead. A VM needs its own kernel, its own memory allocation, its own disk image. Distrobox shares the host kernel, the host filesystem, the host GPU driver. There's no performance penalty — your compiler runs at native speed because it *is* running natively, just in a different userspace.

## The Setup

### 1. Install distrobox

Distrobox is a set of shell scripts. Install it to your home directory (which is mutable on Silverblue):

```bash
curl -s https://raw.githubusercontent.com/89luca89/distrobox/main/install | sh -s -- --prefix ~/.local
```

Make sure `~/.local/bin` is in your `PATH` (it is by default on Silverblue).

### 2. Create your dev container

```bash
distrobox create --name dev --image ubuntu:24.04 --pull
```

This pulls the Ubuntu 24.04 image and creates a container named `dev`. First run takes a minute while distrobox sets up the host integration layer.

### 3. Enter it

```bash
distrobox enter dev
```

Your prompt changes to `📦[you@dev ~]$` and you're in Ubuntu. Your home directory is right there. `cd ~/projects` works. `git status` works (once you install git).

### 4. Install your dev packages

Now you have `apt`. Go wild:

```bash
sudo apt update && sudo apt install -y \
    build-essential cmake pkg-config libssl-dev \
    git curl wget rsync unzip zip \
    python3 python3-pip python3-venv python3-dev \
    man-db manpages less lsof \
    mtr traceroute tcpdump iputils-ping iproute2 \
    openssh-client ca-certificates gnupg
```

This gives you a C/C++ toolchain, Python with pip and venvs, git, and networking/diagnostic tools. The `sudo` here is inside the container — it doesn't touch your host.

### 5. Install language runtimes in your home directory

These go in `$HOME`, so they survive container rebuilds:

**Node.js via nvm:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
```

**Rust via rustup:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
```

**Cargo dev tools:**
```bash
cargo install cargo-audit cargo-deny cargo-nextest trunk wasm-pack
```

### 6. Add host system observability (optional)

If you want to read host systemd journals and DNS state from inside your container, you can add init hooks. These bind-mount host paths into the container on every start:

```bash
# These go in the distrobox assemble manifest (next section)
# or you can run them manually:
mount --rbind /run/host/run/systemd/journal /run/systemd/journal
mount --rbind /run/host/run/systemd/resolve /run/systemd/resolve
mount --rbind /run/host/var/log/journal /var/log/journal
```

With these mounts, `journalctl` inside the container reads host logs. Handy if you're debugging system-level issues without leaving your dev shell.

## Making It Reproducible

The manual setup works, but if you ever need to rebuild (or set up a second machine), you don't want to remember 30 commands. Distrobox has `distrobox assemble` — an INI manifest that captures your container definition.

### The manifest: `dev.ini`

```ini
[dev]
image=docker.io/library/ubuntu:24.04
replace=true
pull=true

# Build toolchain
additional_packages=build-essential cmake pkg-config libssl-dev

# Python
additional_packages=python3 python3-pip python3-venv python3-dev

# Core CLI tools
additional_packages=git curl wget rsync unzip zip less lsof bc time tree dialog

# Networking / diagnostics
additional_packages=mtr traceroute tcpdump iputils-ping iproute2 openssh-client

# System / crypto
additional_packages=ca-certificates gnupg man-db manpages

# Graphics libs (for GUI app forwarding)
additional_packages=mesa-vulkan-drivers libvulkan1 libegl1 libegl-mesa0 libgl1 libglx-mesa0 xauth

# Bind-mount host systemd paths for diagnostics
init_hooks="mount --rbind /run/host/run/systemd/journal /run/systemd/journal 2>/dev/null || true"
init_hooks="mount --rbind /run/host/run/systemd/resolve /run/systemd/resolve 2>/dev/null || true"
init_hooks="mount --rbind /run/host/run/systemd/seats /run/systemd/seats 2>/dev/null || true"
init_hooks="mount --rbind /run/host/run/systemd/sessions /run/systemd/sessions 2>/dev/null || true"
init_hooks="mount --rbind /run/host/run/systemd/users /run/systemd/users 2>/dev/null || true"
init_hooks="mount --rbind /run/host/var/lib/systemd/coredump /var/lib/systemd/coredump 2>/dev/null || true"
init_hooks="mount --rbind /run/host/var/log/journal /var/log/journal 2>/dev/null || true"
init_hooks="mount --rbind /run/host/etc/localtime /etc/localtime 2>/dev/null || true"
```

A few things to note about this format — I had to read the `distrobox-assemble` source to figure it out:

- **Each key-value pair must be on one line.** The parser splits on `=` line by line — no multiline values.
- **Duplicate keys are cumulative.** Multiple `additional_packages=` lines get joined internally. Same for `init_hooks=`.
- **Init hooks are chained with `&&`** in the generated command, so if one mount fails (the `|| true` handles that), the rest still run.
- **`replace=true`** means running assemble again tears down and recreates the container. Your home directory (a bind mount) is untouched.

### The bootstrap script: `bootstrap-dev-tools.sh`

The manifest handles apt packages (the container layer), but tools installed in `$HOME` need a separate script:

```bash
#!/usr/bin/env bash
# Install user-space dev tools into $HOME.
# Run INSIDE the distrobox after assemble create.
# Idempotent — safe to re-run.
set -euo pipefail

# Node.js via nvm
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 22 --default

# npm global packages
npm install -g @google/gemini-cli @openai/codex opencode-ai

# Rust via rustup
if ! command -v rustup &>/dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
fi
source "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown

# Cargo dev tools
cargo install cargo-audit cargo-deny cargo-llvm-cov cargo-nextest trunk wasm-pack
```

### Rebuild in two commands

```bash
# From the host:
distrobox assemble create --file path/to/dev.ini

# Enter and bootstrap (only needed on fresh $HOME):
distrobox enter dev -- ./path/to/bootstrap-dev-tools.sh
```

That's it. New machine, clean home directory, two commands to a fully working dev environment.

## What You End Up With

| Layer | What | Where | Survives rebuild? |
|-------|------|-------|-------------------|
| **Host** | Silverblue + GPU drivers + Flatpak apps | `/` (immutable) | Always |
| **Container** | Ubuntu 24.04 + apt packages | Container overlay | No — rebuilt from manifest |
| **Home** | nvm, rustup, cargo bins, dotfiles, repos | `~/` (bind mount) | Yes |

The mental model: your **host** is the stable foundation. Your **container** is the disposable toolbox. Your **home directory** is the persistent workspace that bridges them.

Inside the container, you get:
- **Full 64GB RAM and 16 CPU cores** visible (no VM overhead)
- **GPU access** for Vulkan/OpenGL workloads
- **Wayland and X11** forwarding for GUI apps
- **D-Bus** session bus for desktop integration
- **Host systemd journals** for system debugging
- **Native filesystem performance** — no copy-on-write, no network mounts

It doesn't feel like a container. It feels like your machine. That's the point.

---

The distrobox manifest and bootstrap script are in my [config-management repo](https://github.com/jbold/config-management) under `configs/distrobox/` if you want to use them as a starting point.
