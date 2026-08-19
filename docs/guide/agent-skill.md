# Agent Skill

This repository ships a reusable coding-agent skill for implementing LIVE Studio Local Data Access in any application stack.

```txt
.agents/skills/tiktok-live-studio-local-data-access/
├── SKILL.md
├── agents/openai.yaml
└── references/
    ├── protocol.md
    ├── events.md
    ├── stack-adaptation.md
    └── verification.md
```

The skill is protocol-first rather than sample-first. It tells an agent how to inspect the developer's existing project and adapt the same connection lifecycle to JavaScript, TypeScript, Electron, H5, Unity, .NET, Java, Kotlin, Python, Go, Rust, C++, Unreal Engine, or another compatible local runtime.

## What the agent learns

The skill covers:

- same-machine and loopback feasibility checks;
- port discovery and strict `SERVER_HELLO` validation;
- secure `AUTH` ordering and credential handling;
- event DTOs, optional fields, deduplication, and plain-text safety;
- connection ownership, cancellation, backoff, and reason `510` handling;
- stack-specific lifecycle and threading adaptation;
- mock-server tests, security review, and live smoke-test boundaries.

It also tells the agent what **not** to do: expose the service remotely, send credentials before verifying the endpoint, invent a JSON heartbeat, embed secrets in browser assets, or force the project into a different framework.

## Use it in this repository

Codex, Cursor 2.4+, OpenCode, GitHub Copilot, and Gemini CLI can discover project skills from `.agents/skills/` in supported versions. Invoke it explicitly when desired:

```text
Use $tiktok-live-studio-local-data-access to integrate live.gift into this project.
```

Invocation syntax varies by agent. A tool-independent prompt is:

```text
Read .agents/skills/tiktok-live-studio-local-data-access/SKILL.md and all references it requires, then use that workflow to integrate LIVE Studio local events into this project without changing the existing technology stack.
```

That explicit form also works for agents that do not automatically scan `.agents/skills/`.

## Install it in another project

The fastest distribution method is the open Skills CLI. It discovers the skill from this GitHub repository and installs it for the coding agents detected on the developer machine:

```bash
npx skills add liangpeiran-bit/tiktok-live-studio-local-data-access \
  --skill tiktok-live-studio-local-data-access \
  -g
```

`-g` makes the skill available across the developer's projects. Omit `-g` to install it only in the current project. To target particular agents non-interactively:

```bash
npx skills add liangpeiran-bit/tiktok-live-studio-local-data-access \
  --skill tiktok-live-studio-local-data-access \
  -g -a codex -a claude-code -a cursor -y
```

Update an installed copy after this repository changes:

```bash
npx skills update tiktok-live-studio-local-data-access -g -y
```

Developers without Node.js/npm can download the repository or a release archive and copy the **entire** directory into the target project:

```text
source:
  .agents/skills/tiktok-live-studio-local-data-access/

recommended target for Codex, Cursor, OpenCode, Copilot, and Gemini CLI:
  <project>/.agents/skills/tiktok-live-studio-local-data-access/

Claude Code target:
  <project>/.claude/skills/tiktok-live-studio-local-data-access/

Trae target:
  <project>/.trae/skills/tiktok-live-studio-local-data-access/
```

Do not copy only `SKILL.md`; the protocol, events, stack adaptation, and verification references are part of the workflow.

For teams using several agent products, keep `.agents/skills/` as the canonical copy. Prefer an explicit read prompt or a locally managed link/copy for Claude Code and Trae instead of committing multiple editable copies that can drift.

## Example requests

```text
Use the LIVE Studio Local Data Access skill to add like and gift events to this Unity game. Reuse its existing WebSocket package.
```

```text
Review this Python client against the LIVE Studio protocol. Focus on hello validation, authentication order, reconnect behavior, and secret logging.
```

```text
Diagnose why this Electron overlay authenticates but stops receiving chat events after LIVE Studio restarts.
```

## Keep the skill current

The public documentation remains the source of truth. When the endpoint, protocol version, message fields, event schemas, or retry guidance changes:

1. update the English and Chinese documentation;
2. update the matching files under the skill's `references/` directory;
3. validate the skill and build the VitePress site;
4. redistribute the whole skill directory to projects that installed a copy.

The current skill targets protocol version `1.0.0`.
