---
name: tiktok-live-studio-local-data-access
description: Guides agents to implement, review, or troubleshoot TikTok LIVE Studio Local Data Access clients in any technology stack. Use when a project needs local live.like, live.gift, or live.chat events; WebSocket discovery and authentication; reconnect behavior; or protocol-compliance debugging.
---

# TikTok LIVE Studio Local Data Access

Build a safe, protocol-correct local client without forcing the project into a particular language, framework, engine, or WebSocket library.

## Scope

Use this skill for software that runs on the same creator machine as TikTok LIVE Studio and needs to consume approved local room events.

Do not treat this protocol as a remote API. The service binds to `127.0.0.1`; a cloud server, another computer, or a mobile device cannot connect to it directly.

## Read the references

Before implementing or diagnosing a connection, read [references/protocol.md](references/protocol.md).

Also read the files that match the task:

- Event models, dispatch, or deduplication: [references/events.md](references/events.md)
- Language, framework, runtime, or game-engine adaptation: [references/stack-adaptation.md](references/stack-adaptation.md)
- Tests, review, or completion checks: [references/verification.md](references/verification.md)

The repository documentation is the public source of truth. If it disagrees with this packaged skill, follow the repository docs and update the skill in the same change.

## Workflow

### 1. Establish feasibility

Determine where the client actually runs.

- Continue when the WebSocket client runs on the same Windows machine as TikTok LIVE Studio.
- For Electron, desktop apps, game engines, local services, and command-line tools, put the connection in a long-lived local runtime.
- For H5, continue only when the page runs locally on the creator machine and the browser permits loopback WebSockets. Never embed production credentials in public web assets.
- If the proposed client runs remotely, explain the loopback limitation. Do not invent a remote proxy or ask the developer to expose the local endpoint.

Confirm which events the application needs and how credentials will be supplied at runtime. Never request that a developer paste a raw secret into source control, chat logs, screenshots, or test fixtures.

### 2. Inspect the existing project

Before writing code:

1. Identify the language, runtime, lifecycle model, concurrency model, dependency manager, and test framework.
2. Find an existing WebSocket client or platform API and reuse it when suitable.
3. Locate the project's configuration or secret-storage pattern.
4. Locate existing logging, cancellation, retry, and event-dispatch patterns.
5. Preserve the project's architecture and naming conventions.

Do not migrate frameworks or add a large dependency merely to open one WebSocket. Add a library only when the runtime lacks a suitable client and the project owner permits the dependency.

### 3. Design explicit components

Keep these responsibilities separable even when the project uses a small single-file implementation:

- **Discovery** scans `127.0.0.1:30000-30015` and accepts only a verified server hello.
- **Transport** owns exactly one active socket, text-message decoding, close handling, and cancellation.
- **Authentication** sends `AUTH` only after hello validation and waits for `AUTH_RESULT`.
- **Dispatcher** validates the envelope, routes known event names, and ignores unknown events safely.
- **Reconnect policy** rediscoveries and reauthenticates with bounded exponential backoff and jitter.
- **Application adapter** translates protocol events into domain actions, UI updates, overlay actions, or game-engine main-thread work.

Do not couple credentials or socket lifecycle to a UI component that may mount repeatedly.

### 4. Implement the state machine

Use explicit states or equivalent guards:

```text
idle -> scanning -> waiting_hello -> authenticating -> authenticated
                    | invalid/timeout       | rejected
                    v                       v
                 scanning                 closed

authenticated -> closed -> backoff -> scanning
```

Required behavior:

1. Scan candidate ports and apply short, cancellable connect/hello timeouts.
2. Inspect the first server JSON message.
3. Accept the endpoint only when `type`, `product`, `channel`, and supported `version` match the protocol.
4. Send credentials only to that verified endpoint.
5. Send `AUTH` as the first client JSON message.
6. Do not dispatch events until `AUTH_RESULT.success` is `true`.
7. On every new socket, repeat discovery, hello validation, and authentication.
8. Prevent concurrent scan attempts, duplicate sockets, and reconnect timers that survive shutdown.

### 5. Handle events defensively

- Dispatch by the envelope's `event` value, not by guessing from payload fields.
- Deduplicate payloads with a `message_id` using `{event}:{message_id}`.
- Preserve documented string count fields as strings unless the application performs an explicit checked conversion.
- Treat `user` and all user fields as optional.
- Treat chat `content` as untrusted plain text; escape it before rendering into HTML or rich UI.
- Ignore unknown event names and tolerate unknown enum values.
- Isolate malformed or unsupported events; one bad payload must not terminate an otherwise healthy connection.

### 6. Apply security and retry rules

- Send the raw issued `secret`; do not hash or transform it.
- Keep credentials out of source files, browser bundles, version control, telemetry, exception messages, and normal logs.
- Redact `secret` and preferably credential identifiers in diagnostic output.
- Never send credentials before validating `SERVER_HELLO`.
- Use the library's native WebSocket ping/pong behavior. Do not create a JSON `HEARTBEAT` message.
- Reuse one connection per local app/client.
- Back off after failures. Do not retry invalid credentials or policy failures in a tight loop.
- Treat disconnect reason `510` as requiring credential or policy intervention; stop automatic retry until configuration changes or the user explicitly retries.

### 7. Verify before handing off

Read [references/verification.md](references/verification.md), then run the checks supported by the project. Prefer deterministic tests with a mock WebSocket server; a live smoke test is optional and must use credentials supplied through a secure runtime mechanism.

## Completion report

When implementation is complete, report:

- where the long-lived connection is owned;
- how credentials are supplied without being committed;
- which events are supported;
- how reconnect and reason `510` behave;
- which build, lint, and tests were run;
- any runtime limitation or manual live-test step that remains.

Do not claim live connectivity when only mock tests were run.
